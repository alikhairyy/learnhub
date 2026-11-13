/**
 * Seeds the database with an admin, a demo student and sample courses.
 * Run with:  npm run seed
 * WARNING: clears the users, courses and enrollments collections first.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const yt = (id, startSeconds = 0) =>
  `https://www.youtube.com/watch?v=${id}${startSeconds ? `&t=${startSeconds}` : ''}`;
const img = (seed) => `https://picsum.photos/seed/${seed}/800/450`;

const courses = [
  {
    title: 'HTML Foundations',
    description:
      'Build your first web pages from scratch. Learn tags, links, images, lists, tables and forms - the building blocks of every website.',
    category: 'Web Development',
    level: 'Beginner',
    instructor: 'freeCodeCamp',
    imageUrl: img('learnhub-html'),
    lessons: [
      { title: 'Introduction & first page', videoUrl: yt('pQN-pnXPaVg'), duration: '15 min' },
      { title: 'Links and images', videoUrl: yt('pQN-pnXPaVg', 1500), duration: '20 min' },
      { title: 'Lists, tables and forms', videoUrl: yt('pQN-pnXPaVg', 3600), duration: '30 min' },
    ],
  },
  {
    title: 'JavaScript Essentials',
    description:
      'Variables, functions, arrays, objects and ES6 - everything you need to start writing real JavaScript for the browser and Node.js.',
    category: 'Programming',
    level: 'Beginner',
    instructor: 'freeCodeCamp',
    imageUrl: img('learnhub-js'),
    lessons: [
      { title: 'Running JavaScript & variables', videoUrl: yt('PkZNo7MFNFg'), duration: '20 min' },
      { title: 'Functions and scope', videoUrl: yt('PkZNo7MFNFg', 2700), duration: '25 min' },
      { title: 'Objects and arrays', videoUrl: yt('PkZNo7MFNFg', 6000), duration: '30 min' },
      { title: 'ES6 features', videoUrl: yt('PkZNo7MFNFg', 9000), duration: '30 min' },
    ],
  },
  {
    title: 'React for Beginners',
    description:
      'Learn components, props, state and hooks by building real projects. The perfect start for modern front-end development.',
    category: 'Web Development',
    level: 'Intermediate',
    instructor: 'Bob Ziroll',
    imageUrl: img('learnhub-react'),
    lessons: [
      { title: 'Why React?', videoUrl: yt('bMknfKXIFA8'), duration: '15 min' },
      { title: 'Components and JSX', videoUrl: yt('bMknfKXIFA8', 1800), duration: '30 min' },
      { title: 'Props', videoUrl: yt('bMknfKXIFA8', 9000), duration: '30 min' },
      { title: 'State and events', videoUrl: yt('bMknfKXIFA8', 18000), duration: '40 min' },
    ],
  },
  {
    title: 'Node.js in One Hour',
    description:
      'Understand how Node.js works, use built-in modules, events and the HTTP module, and get ready to build back-end APIs.',
    category: 'Web Development',
    level: 'Intermediate',
    instructor: 'Mosh Hamedani',
    imageUrl: img('learnhub-node'),
    lessons: [
      { title: 'What is Node?', videoUrl: yt('TlB_eWDSMt4'), duration: '10 min' },
      { title: 'Modules', videoUrl: yt('TlB_eWDSMt4', 900), duration: '20 min' },
      { title: 'Events and HTTP', videoUrl: yt('TlB_eWDSMt4', 2400), duration: '25 min' },
    ],
  },
  {
    title: 'MongoDB Crash Course',
    description:
      'Documents, collections, CRUD operations and queries. Learn the database behind the MEAN and MERN stacks.',
    category: 'Databases',
    level: 'Beginner',
    instructor: 'Web Dev Simplified',
    imageUrl: img('learnhub-mongo'),
    lessons: [
      { title: 'What is MongoDB?', videoUrl: yt('ofme2o29ngU'), duration: '10 min' },
      { title: 'CRUD operations', videoUrl: yt('ofme2o29ngU', 600), duration: '10 min' },
      { title: 'Complex queries', videoUrl: yt('ofme2o29ngU', 1200), duration: '15 min' },
    ],
  },
  {
    title: 'Python Programming',
    description:
      'Start coding with the most beginner-friendly language. Variables, conditions, loops, functions and classes with practical examples.',
    category: 'Programming',
    level: 'Beginner',
    instructor: 'Mike Dane & Mosh Hamedani',
    imageUrl: img('learnhub-python'),
    lessons: [
      { title: 'Python basics', videoUrl: yt('rfscVS0vtbw'), duration: '30 min' },
      { title: 'Functions and loops', videoUrl: yt('rfscVS0vtbw', 5400), duration: '35 min' },
      { title: 'Python for real projects', videoUrl: yt('_uQrJ0TkZlc'), duration: '40 min' },
    ],
  },
  {
    title: 'CSS Styling & Layouts',
    description:
      'Selectors, colors, the box model, Flexbox and Grid. Learn to turn plain HTML into clean, responsive layouts.',
    category: 'Web Development',
    level: 'Beginner',
    instructor: 'Dave Gray',
    imageUrl: img('learnhub-css'),
    lessons: [
      { title: 'Selectors and colors', videoUrl: yt('OXGznpKZ_sA'), duration: '25 min' },
      { title: 'The box model', videoUrl: yt('OXGznpKZ_sA', 7200), duration: '30 min' },
      { title: 'Flexbox and Grid', videoUrl: yt('ieTHC78giGQ'), duration: '40 min' },
    ],
  },
  {
    title: 'Git & GitHub Basics',
    description:
      'Version control for real projects: commits, branches, merging, and collaborating with pull requests on GitHub.',
    category: 'Tools',
    level: 'Beginner',
    instructor: 'Gwen Faraday',
    imageUrl: img('learnhub-git'),
    lessons: [
      { title: 'What is Git?', videoUrl: yt('RGOj5yH7evk'), duration: '10 min' },
      { title: 'Commits and pushing to GitHub', videoUrl: yt('RGOj5yH7evk', 1200), duration: '20 min' },
      { title: 'Branches and pull requests', videoUrl: yt('RGOj5yH7evk', 2700), duration: '25 min' },
    ],
  },
  {
    title: 'Express.js REST APIs',
    description:
      'Build back-end APIs with Express: routing, middleware, handling JSON requests and a full CRUD API.',
    category: 'Web Development',
    level: 'Intermediate',
    instructor: 'Brad Traversy',
    imageUrl: img('learnhub-express'),
    lessons: [
      { title: 'Setting up Express', videoUrl: yt('L72fhGm1tfE'), duration: '15 min' },
      { title: 'Routing and middleware', videoUrl: yt('L72fhGm1tfE', 1500), duration: '25 min' },
      { title: 'Building a CRUD API', videoUrl: yt('L72fhGm1tfE', 3000), duration: '30 min' },
    ],
  },
];

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Enrollment.deleteMany({})]);

  // Use create() (not insertMany) so the password-hashing hook runs
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@learnhub.com',
    password: 'admin123',
    role: 'admin',
  });
  const student = await User.create({
    name: 'Demo Student',
    email: 'student@learnhub.com',
    password: 'student123',
  });

  const created = await Course.insertMany(courses.map((c) => ({ ...c, createdBy: admin._id })));

  // Give the demo student some progress so the dashboard isn't empty
  await Enrollment.create([
    {
      user: student._id,
      course: created[0]._id,
      completedLessons: [created[0].lessons[0]._id, created[0].lessons[1]._id],
    },
    { user: student._id, course: created[1]._id, completedLessons: [created[1].lessons[0]._id] },
  ]);

  console.log(`Seeded ${created.length} courses.`);
  console.log('Admin login:   admin@learnhub.com / admin123');
  console.log('Student login: student@learnhub.com / student123');
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
