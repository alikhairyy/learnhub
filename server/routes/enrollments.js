const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const progressOf = (enrollment, course) => {
  const total = course.lessons.length;
  // only count lessons that still exist in the course
  const lessonIds = new Set(course.lessons.map((l) => String(l._id)));
  const done = enrollment.completedLessons.filter((id) => lessonIds.has(String(id))).length;
  return total === 0 ? 0 : Math.round((done / total) * 100);
};

// Every route here requires login (protect is applied per route so
// unknown /api paths still fall through to the 404 handler)

// POST /api/enroll/:courseId
router.post(
  '/enroll/:courseId',
  protect,
  asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    if (!isValidId(courseId)) return res.status(404).json({ message: 'Course not found' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing) return res.status(200).json({ message: 'Already enrolled', enrollment: existing });

    const enrollment = await Enrollment.create({ user: req.user._id, course: courseId });
    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  })
);

// GET /api/enroll/:courseId -> enrollment status for one course
router.get(
  '/enroll/:courseId',
  protect,
  asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    if (!isValidId(courseId)) return res.json({ enrolled: false });
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    res.json({
      enrolled: !!enrollment,
      completedLessons: enrollment ? enrollment.completedLessons.map(String) : [],
    });
  })
);

// DELETE /api/enroll/:courseId -> unenroll
router.delete(
  '/enroll/:courseId',
  protect,
  asyncHandler(async (req, res) => {
    await Enrollment.findOneAndDelete({ user: req.user._id, course: req.params.courseId });
    res.json({ message: 'Unenrolled' });
  })
);

// GET /api/my-courses -> dashboard data
router.get(
  '/my-courses',
  protect,
  asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate('course').sort({ updatedAt: -1 });
    const result = enrollments
      .filter((e) => e.course) // skip courses that were deleted
      .map((e) => ({
        enrollmentId: e._id,
        enrolledAt: e.createdAt,
        progress: progressOf(e, e.course),
        completedCount: e.completedLessons.length,
        course: {
          _id: e.course._id,
          title: e.course.title,
          imageUrl: e.course.imageUrl,
          category: e.course.category,
          instructor: e.course.instructor,
          lessonCount: e.course.lessons.length,
        },
      }));
    res.json(result);
  })
);

// PUT /api/progress/:courseId  body: { lessonId, completed: true|false }
router.put(
  '/progress/:courseId',
  protect,
  asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { lessonId, completed = true } = req.body;
    if (!isValidId(courseId) || !isValidId(lessonId)) {
      return res.status(400).json({ message: 'Invalid course or lesson id' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.lessons.id(lessonId)) return res.status(404).json({ message: 'Lesson not found' });

    const update = completed
      ? { $addToSet: { completedLessons: lessonId } }
      : { $pull: { completedLessons: lessonId } };
    const enrollment = await Enrollment.findOneAndUpdate({ user: req.user._id, course: courseId }, update, {
      new: true,
    });
    if (!enrollment) return res.status(403).json({ message: 'Enroll in this course first' });

    res.json({
      completedLessons: enrollment.completedLessons.map(String),
      progress: progressOf(enrollment, course),
    });
  })
);

module.exports = router;
