const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  jobRole: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    default: ''
  },
  interviewType: {
    type: String,
    enum: ['technical', 'hr', 'behavioral', 'mixed'],
    default: 'mixed'
  },
  duration: {
    type: Number,
    default: 30 // in minutes
  },
  questions: [{
    questionId: mongoose.Schema.Types.ObjectId,
    category: {
      type: String,
      enum: ['technical', 'hr', 'behavioral'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    expectedKeyPoints: [String],
    answer: {
      transcribedText: String,
      audioUrl: String,
      duration: Number, // in seconds
      confidence: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    evaluation: {
      relevanceScore: {
        type: Number,
        min: 0,
        max: 100
      },
      completenessScore: {
        type: Number,
        min: 0,
        max: 100
      },
      confidenceScore: {
        type: Number,
        min: 0,
        max: 100
      },
      totalScore: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      strengths: [String],
      improvements: [String]
    },
    status: {
      type: String,
      enum: ['pending', 'answered', 'evaluated'],
      default: 'pending'
    },
    attemptedAt: Date,
    evaluatedAt: Date
  }],
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'paused'],
    default: 'in-progress'
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  technicalScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  hrScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  behavioralScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  strengths: [String],
  areasForImprovement: [String],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  }
});

module.exports = mongoose.model('Interview', interviewSchema);
