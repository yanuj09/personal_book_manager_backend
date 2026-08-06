// Seeds a demo reader with a small shelf, so the dashboard has something
// honest to show on a fresh database. Safe to re-run: it replaces only the
// demo account's books, never anyone else's.
//
//   npm run seed
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const { Book } = require('../models/Book');

const DEMO = { name: 'Demo Reader', email: 'demo@bookmanager.dev', password: 'demopassword' };

const BOOKS = [
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', tags: ['craft', 'engineering'], status: 'completed' },
  { title: 'Refactoring', author: 'Martin Fowler', tags: ['craft', 'engineering'], status: 'reading' },
  { title: 'Clean Code', author: 'Robert C. Martin', tags: ['craft'], status: 'want-to-read' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', tags: ['systems'], status: 'reading' },
  { title: 'The Design of Everyday Things', author: 'Don Norman', tags: ['design'], status: 'completed' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', tags: ['psychology'], status: 'want-to-read' },
  { title: 'Analysis Patterns', author: 'Martin Fowler', tags: ['engineering'], status: 'want-to-read' },
];

async function seed() {
  await connectDB();

  let user = await User.findOne({ email: DEMO.email });
  if (!user) {
    user = await User.create(DEMO);
    console.log(`Created demo user ${DEMO.email} (password: ${DEMO.password})`);
  }

  await Book.deleteMany({ owner: user._id });
  // create() rather than insertMany() so setters and the completedAt hook run.
  await Book.create(BOOKS.map((book) => ({ ...book, owner: user._id })));

  console.log(`Seeded ${BOOKS.length} books for ${DEMO.email}`);
  await disconnectDB();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await disconnectDB();
  process.exit(1);
});
