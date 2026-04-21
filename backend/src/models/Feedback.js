const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  overallPerformance: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    rating: {
      type: String,
      enum: ['excellent', 'good', 'average', 'needs-improvement'],
      required: true
    },
    summary: String
  },
  questionWiseFeedback: [{
    questionId: mongoose.Schema.Types.ObjectId,
    question: String,
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    strengths: [String],
    improvements: [String]
  }],
  categoryWiseAnalysis: {
    technical: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      topStrengths: [String],
      topWeaknesses: [String]
    },
    hr: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      topStrengths: [String],
      topWeaknesses: [String]
    },
    behavioral: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      topStrengths: [String],
      topWeaknesses: [String]
    }
  },
  recommendations: [String],
  nextSteps: [String],
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
