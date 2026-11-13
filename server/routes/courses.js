const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/courses?search=react&category=Web%20Development
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, category } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) {
      const rx = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ title: rx }, { description: rx }, { instructor: rx }];
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();

    // Add enrolled-student counts for the course cards
    const counts = await Enrollment.aggregate([{ $group: { _id: '$course', students: { $sum: 1 } } }]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.students]));

    res.json(
      courses.map((c) => ({
        ...c,
        lessonCount: c.lessons.length,
        students: countMap[String(c._id)] || 0,
      }))
    );
  })
);

// GET /api/courses/categories -> distinct list for the filter dropdown
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await Course.distinct('category');
    res.json(categories.sort());
  })
);

// GET /api/courses/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Course not found' });
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const students = await Enrollment.countDocuments({ course: course._id });
    res.json({ ...course, students });
  })
);

// POST /api/courses  (admin)
router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { title, description, category, level, instructor, imageUrl, lessons } = req.body;
    const course = await Course.create({
      title,
      description,
      category,
      level,
      instructor,
      imageUrl,
      lessons: Array.isArray(lessons) ? lessons : [],
      createdBy: req.user._id,
    });
    res.status(201).json(course);
  })
);

// PUT /api/courses/:id  (admin)
router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Course not found' });
    const allowed = ['title', 'description', 'category', 'level', 'instructor', 'imageUrl', 'lessons'];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.set(updates);
    await course.save(); // runs validators on lessons too
    res.json(course);
  })
);

// DELETE /api/courses/:id  (admin) - also removes its enrollments
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Course not found' });
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Enrollment.deleteMany({ course: course._id });
    res.json({ message: 'Course deleted' });
  })
);

module.exports = router;
