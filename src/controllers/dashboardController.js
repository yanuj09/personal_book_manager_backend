const { Book, BOOK_STATUSES } = require('../models/Book');

// GET /api/dashboard — everything the dashboard needs in a single round trip.
// $facet runs each summary over the same matched set, so the page never fires
// five queries to render one screen.
async function getDashboard(req, res) {
  const ownerId = req.user._id;
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const [summary] = await Book.aggregate([
    { $match: { owner: ownerId } },
    {
      $facet: {
        total: [{ $count: 'value' }],
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        // The gentle insight: who this reader keeps coming back to.
        favouriteAuthors: [
          { $group: { _id: '$author', books: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
          { $sort: { books: -1, _id: 1 } },
          { $limit: 5 },
          { $project: { _id: 0, author: '$_id', books: 1, completed: 1 } },
        ],
        topTags: [
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
          { $limit: 5 },
          { $project: { _id: 0, tag: '$_id', count: 1 } },
        ],
        completedThisYear: [
          { $match: { status: 'completed', completedAt: { $gte: startOfYear } } },
          { $count: 'value' },
        ],
        // Surfaced up front so "what am I in the middle of?" needs no clicking.
        currentlyReading: [
          { $match: { status: 'reading' } },
          { $sort: { updatedAt: -1 } },
          { $limit: 5 },
          // `id` rather than `_id`, matching the shape the Book model serialises.
          { $project: { _id: 0, id: '$_id', title: 1, author: 1, tags: 1, updatedAt: 1 } },
        ],
        recentlyAdded: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, id: '$_id', title: 1, author: 1, status: 1, createdAt: 1 } },
        ],
      },
    },
  ]);

  const total = summary.total[0]?.value || 0;

  // A status with no books is absent from the aggregation; the dashboard still
  // wants a zero for it, so every status is filled in explicitly.
  const counts = Object.fromEntries(summary.byStatus.map(({ _id, count }) => [_id, count]));
  const byStatus = Object.fromEntries(BOOK_STATUSES.map((status) => [status, counts[status] || 0]));

  res.json({
    success: true,
    data: {
      total,
      byStatus,
      // Share of the shelf actually finished — one number that says the most.
      completionRate: total ? Math.round((byStatus.completed / total) * 100) : 0,
      completedThisYear: summary.completedThisYear[0]?.value || 0,
      favouriteAuthors: summary.favouriteAuthors,
      topTags: summary.topTags,
      currentlyReading: summary.currentlyReading,
      recentlyAdded: summary.recentlyAdded,
    },
  });
}

module.exports = { getDashboard };
