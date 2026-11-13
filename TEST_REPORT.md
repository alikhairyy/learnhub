# LearnHub – Smoke Test Report

**Date:** 11 November 2026  
**Setup:** Express API + MongoDB-compatible database + React dev server (Vite) at `http://localhost:5173`, driven by an automated Chrome browser (Playwright).  
**Result:** 49 / 49 checks passed

Each check performs real clicks and typing in the browser and verifies what appears on screen.

## Guest browsing

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Home page renders | ✅ Pass | hero, stats (6 courses), 3 featured cards, intro video embed |
| 2 | Navbar / logo / footer links | ✅ Pass |  |
| 3 | Home category chip links to filtered catalog | ✅ Pass |  |
| 4 | Catalog lists all 6 courses | ✅ Pass |  |
| 5 | Search 'react' | ✅ Pass |  |
| 6 | Search by instructor 'mosh' | ✅ Pass |  |
| 7 | Category filter + reset to All | ✅ Pass |  |
| 8 | Empty search state + Clear filters | ✅ Pass |  |
| 9 | Course details as guest (lessons locked) | ✅ Pass |  |
| 10 | 'Log in to enroll' sends guest to login | ✅ Pass |  |
| 11 | Protected pages redirect guests to login | ✅ Pass |  |

## Sign up & sign in

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Register: password mismatch rejected | ✅ Pass |  |
| 2 | Register new account | ✅ Pass | created hassan.test5482@learnhub.com |
| 3 | Session survives page refresh | ✅ Pass |  |
| 4 | New account is a student (no Admin access) | ✅ Pass |  |
| 5 | Log out | ✅ Pass |  |
| 6 | Register same email again (uppercase) rejected | ✅ Pass |  |
| 7 | Login with wrong password rejected | ✅ Pass |  |
| 8 | Login with the same credentials -> empty dashboard | ✅ Pass |  |

## Learning flow

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Enroll in JavaScript Essentials | ✅ Pass | students: '1 student' -> '2 students' |
| 2 | Start course -> lesson 1 video embed | ✅ Pass |  |
| 3 | Mark lesson complete -> 25% | ✅ Pass |  |
| 4 | Next lesson + timestamp + complete -> 50% | ✅ Pass | timestamped embed (start=2700), sidebar highlight, 50% |
| 5 | Un-mark and re-mark a lesson | ✅ Pass |  |
| 6 | Previous button, sidebar jump, last-lesson button | ✅ Pass |  |
| 7 | Invalid lesson number redirects to course | ✅ Pass |  |
| 8 | 'Continue learning' resumes at first unfinished lesson | ✅ Pass |  |
| 9 | Complete a whole course (MongoDB) -> 100% | ✅ Pass |  |
| 10 | Dashboard tiles and course list | ✅ Pass | Enrolled 2, Completed 1, Average 75% |
| 11 | Leave course (confirm dialog) removes it | ✅ Pass |  |
| 12 | Player blocked for courses not enrolled in | ✅ Pass |  |

## Admin panel

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Admin login -> admin panel | ✅ Pass |  |
| 2 | Form blocks submit with missing fields | ✅ Pass |  |
| 3 | Add course 1: CSS Styling & Layouts | ✅ Pass | CSS Styling & Layouts (3 lessons, Web Development) |
| 4 | Add course 2: Git & GitHub Basics | ✅ Pass | Git & GitHub Basics (3 lessons, Tools) |
| 5 | Add course 3: Express.js REST APIs | ✅ Pass | Express.js REST APIs (3 lessons, Web Development) |
| 6 | Table + stats show 9 courses / 29 lessons | ✅ Pass | tiles: ['9', '29', '3'] |
| 7 | Edit course (add a lesson) | ✅ Pass | added a 4th lesson via youtu.be short link |
| 8 | Edit course (remove a lesson) | ✅ Pass |  |
| 9 | Cancel edit resets form | ✅ Pass |  |
| 10 | Create (no lessons) + delete a course | ✅ Pass |  |
| 11 | New courses + new 'Tools' category appear in catalog | ✅ Pass |  |

## Student on new course

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Enroll + watch + progress on an admin-created course | ✅ Pass |  |
| 2 | Lesson with a different video in same course | ✅ Pass |  |

## Misc

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | 404 page + Go home | ✅ Pass |  |
| 2 | Invalid course id shows 'Course not found' | ✅ Pass |  |
| 3 | Mobile hamburger menu | ✅ Pass |  |

## Console

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | No JavaScript errors | ✅ Pass |  |
| 2 | No 5xx API responses | ✅ Pass |  |

## Courses added through the admin panel during testing

| Course | Category | Level | Lessons |
|---|---|---|---|
| CSS Styling & Layouts | Web Development | Beginner | Selectors and colors · The box model · Flexbox and Grid |
| Git & GitHub Basics | Tools | Beginner | What is Git? · Commits and pushing to GitHub · Branches and pull requests |
| Express.js REST APIs | Web Development | Intermediate | Setting up Express · Routing and middleware · Building a CRUD API |

These three courses are also included in `server/seed.js`.

## Fixes made during testing

- **Dev proxy:** the client now forwards `/api` to `127.0.0.1:5000` instead of `localhost:5000`, which avoids an IPv6 connection failure on some Windows machines (it showed as "Request failed with status code 500").
- **Admin messages:** a new success/error message now cancels the previous message's timer, so a quick follow-up action (e.g. create then delete) no longer has its message cleared early.
