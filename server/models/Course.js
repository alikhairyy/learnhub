const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Lesson title is required'], trim: true },
  videoUrl: { type: String, required: [true, 'Lesson video URL is required'], trim: true },
  duration: { type: String, default: '' }, // e.g. "12 min"
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
    description: { type: String, required: [true, 'Description is required'] },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    instructor: { type: String, required: [true, 'Instructor is required'], trim: true },
    imageUrl: { type: String, default: '' },
    lessons: [lessonSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
