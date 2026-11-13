# LearnHub – Online Video Course Platform

**Course:** DPRG507 – Advanced Full Stack Web Development (Fall 2026)
**Stack:** MERN – MongoDB, Express.js, React, Node.js

LearnHub is a web application where students register, browse video courses, enroll, watch lessons and track their progress. Administrators manage the course catalog from an admin panel.

---

## 1. Features

| Area | What it does |
|---|---|
| **Authentication** | Register and log in with email + password. Passwords are hashed with **bcrypt**; sessions use **JWT** tokens. Login information is stored in MongoDB (`users` collection). |
| **Roles** | `student` (default for new accounts) and `admin`. Admin-only pages and API routes are protected on both the client and the server. |
| **Course catalog** | Grid of course cards with images, search by title/description/instructor, and filtering by category. |
| **Course details** | Course banner, lesson list (locked until enrolled), enroll / leave course, progress bar. |
| **Lesson player** | Embedded video (YouTube or `.mp4`), lesson sidebar, previous/next navigation, mark lesson as complete. |
| **Student dashboard** | Summary tiles (enrolled, completed, average progress) and a list of enrolled courses with progress bars. |
| **Admin panel** | Create, edit and delete courses and their lessons; overview statistics. |
| **Responsive UI** | Works on desktop and mobile (collapsible navigation menu). |

### How the UI rubric is covered

| Rubric item | Where |
|---|---|
| Matching colors | One palette (indigo `#4f46e5`, teal `#14b8a6`, deep indigo `#1e1b4b`) defined as CSS variables in `client/src/index.css` and used everywhere |
| Clean & simple interface | Consistent cards, buttons, spacing and typography (Poppins + Inter) |
| Images and videos | Course images on cards/details/dashboard, hero and login images, intro video on Home, video player on every lesson |
| Navigation links | Navbar, footer links, breadcrumbs, course cards, category chips, previous/next lesson buttons |
| Different layouts | Hero banner, card grid, two-column video section, three-column features, split-screen login, content + sticky sidebar (course details), video + sidebar (player), dashboard tiles, form + table (admin) |

---

## 2. Project structure

```
learnhub/
├── server/                    # Express + MongoDB API
│   ├── server.js              # Entry point: connects to MongoDB, starts the server
│   ├── app.js                 # Express app: middleware, routes, error handler
│   ├── seed.js                # Fills the DB with demo users and courses
│   ├── config/db.js           # Mongoose connection
│   ├── middleware/auth.js     # JWT protect + adminOnly middleware
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   └── Enrollment.js
│   ├── routes/                # REST endpoints
│   │   ├── auth.js
│   │   ├── courses.js
│   │   └── enrollments.js
│   └── utils/asyncHandler.js
│
└── client/                    # React front end (Vite)
    ├── index.html
    ├── vite.config.js         # Proxies /api to the server in development
    └── src/
        ├── main.jsx           # App bootstrap (Router + AuthProvider)
        ├── App.jsx            # Route definitions
        ├── api.js             # Axios instance (adds JWT to requests)
        ├── utils.js           # YouTube embed helper, image fallback
        ├── index.css          # Theme and all styles
        ├── context/AuthContext.jsx
        ├── components/        # Navbar, Footer, CourseCard, ProgressBar, ProtectedRoute, Spinner
        └── pages/             # Home, Login, Register, Courses, CourseDetails,
                               # LessonPlayer, MyCourses, Admin, NotFound
```

---

## 3. Running the project locally

### Requirements
- **Node.js 18+**
- **MongoDB**: either installed locally ([MongoDB Community](https://www.mongodb.com/try/download/community)) or a free **MongoDB Atlas** cluster

### Step 1: Server
```bash
cd server
npm install
cp .env.example .env        # on Windows: copy .env.example .env
```
Open `.env` and set `MONGO_URI` (local or Atlas) and `JWT_SECRET` (any long random text).

```bash
npm run seed                # adds demo users + 9 sample courses
npm run dev                 # starts the API on http://localhost:5000
```

### Step 2: Client (in a second terminal)
```bash
cd client
npm install
npm run dev                 # opens on http://localhost:5173
```

### Demo accounts (created by the seed script)
| Role | Email | Password |
|---|---|---|
| Admin | admin@learnhub.com | admin123 |
| Student | student@learnhub.com | student123 |

---

## 4. Database design (MongoDB)

**users**
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | bcrypt hash, never returned by the API |
| role | String | `student` or `admin` |

**courses**
| Field | Type | Notes |
|---|---|---|
| title, description, category, instructor | String | required |
| level | String | Beginner / Intermediate / Advanced |
| imageUrl | String | course cover image |
| lessons | Array | embedded `{ title, videoUrl, duration }` sub-documents |
| createdBy | ObjectId → users | admin who created it |

**enrollments**
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → users | |
| course | ObjectId → courses | |
| completedLessons | [ObjectId] | ids of finished lessons |
| *(index)* | | unique on `{ user, course }`, so a student can't enroll twice |

Progress is calculated as `completed lessons / total lessons × 100`.

---

## 5. API reference

Base URL: `/api`. 🔒 = needs `Authorization: Bearer <token>`. 👑 = admin only.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account → `{ token, user }` |
| POST | `/auth/login` | Log in → `{ token, user }` |
| GET | `/auth/me` 🔒 | Current user |
| GET | `/courses?search=&category=` | List courses (with lesson and student counts) |
| GET | `/courses/categories` | Distinct categories |
| GET | `/courses/:id` | One course with lessons |
| POST | `/courses` 🔒👑 | Create course |
| PUT | `/courses/:id` 🔒👑 | Update course |
| DELETE | `/courses/:id` 🔒👑 | Delete course and its enrollments |
| POST | `/enroll/:courseId` 🔒 | Enroll in a course |
| GET | `/enroll/:courseId` 🔒 | Enrollment status + completed lessons |
| DELETE | `/enroll/:courseId` 🔒 | Leave a course |
| GET | `/my-courses` 🔒 | Dashboard: enrolled courses with progress |
| PUT | `/progress/:courseId` 🔒 | Body `{ lessonId, completed }`, marks a lesson done/undone |

Errors are returned as `{ "message": "..." }` with a suitable status code (400, 401, 403, 404, 409).

---

## 6. Deployment (optional, for the "Online Website address" field)

1. **Database:** create a free cluster on MongoDB Atlas, then copy its connection string.
2. **Server:** deploy the `server` folder on [Render](https://render.com) as a Web Service (`npm install` / `npm start`). Add the environment variables `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`.
3. **Client:** deploy the `client` folder on [Vercel](https://vercel.com). Set `VITE_API_URL=https://<your-render-app>.onrender.com/api`. Add a rewrite of all paths to `/index.html` so page refreshes work.

*Alternative (single service):* run `npm run build` inside `client`, then start the server with `NODE_ENV=production`; Express serves the built React app.

---

## 7. Team contribution

Built by a team of four students.

| Member | Responsibility |
|---|---|
| Member 1 | Authentication: User model, register/login API, JWT middleware, Login/Register pages, AuthContext |
| Member 2 | Courses: Course model, course API (list/search/filter/details), Home, Courses and CourseDetails pages |
| Member 3 | Learning: Enrollment model, enrollment & progress API, LessonPlayer and MyCourses dashboard |
| Member 4 | Admin & UI: admin CRUD routes, Admin panel, theme/styling, deployment, documentation |


---

## 8. Extra content

- Password hashing (bcrypt) and JWT authentication
- Role-based access control (student / admin) on both server and client
- Progress tracking with percentage bars
- Search and category filtering with shareable URLs (`/courses?category=Programming`)
- Seed script with demo data
- Responsive mobile layout
- Production mode where Express serves the React build

## 9. Testing

A full browser smoke test (49 checks across every feature) was run against the app. See [`TEST_REPORT.md`](TEST_REPORT.md).

## Credits
Sample lesson videos are public YouTube tutorials by freeCodeCamp, Programming with Mosh, Web Dev Simplified, Dave Gray and Traversy Media, embedded for demonstration. Placeholder images come from picsum.photos.
