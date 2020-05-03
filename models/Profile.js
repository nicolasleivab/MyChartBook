const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  company: {
    type: String,
  },
  location: {
    type: String,
  },
  from: {
    type: Date,
  },
  to: {
    type: Date,
  },
  current: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },
});

const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
  },
  school: {
    type: String,
  },
  year: {
    type: Date,
  },
  fielOfStudy: {
    type: String,
  },
});

const socialSchema = new mongoose.Schema({
  twitter: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  facebook: {
    type: String,
  },
  instagram: {
    type: String,
  },
  youtube: {
    type: String,
  },
});

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  company: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  bio: {
    type: String,
  },
  experience: [experienceSchema],
  education: [educationSchema],
  social: socialSchema,
});

module.exports = mongoose.model("profile", ProfileSchema);
