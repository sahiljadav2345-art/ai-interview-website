const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'doc'],
    required: true
  },
  rawText: {
    type: String,
    default: ''
  },
  parsedData: {
    fullName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    summary: {
      type: String,
      default: ''
    },
    experience: [{
      jobTitle: String,
      company: String,
      startDate: String,
      endDate: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      field: String,
      graduationYear: String
    }],
    skills: [{
      type: String
    }],
    certifications: [{
      type: String
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String]
    }]
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Resume', resumeSchema);
