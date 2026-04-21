const OpenAI = require('openai');
const Interview = require('../models/Interview');
const Feedback = require('../models/Feedback');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Evaluate answer
exports.evaluateAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview || interview.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Evaluate using OpenAI
    const evaluation = await evaluateAnswerWithAI(
      question.question,
      question.answer.transcribedText,
      question.category,
      question.expectedKeyPoints
    );

    // Update question with evaluation
    interview.questions[questionIndex].evaluation = {
      relevanceScore: evaluation.relevanceScore,
      completenessScore: evaluation.completenessScore,
      confidenceScore: question.answer.confidence || 75,
      totalScore: (evaluation.relevanceScore + evaluation.completenessScore + (question.answer.confidence || 75)) / 3,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements
    };
    interview.questions[questionIndex].status = 'evaluated';
    interview.questions[questionIndex].evaluatedAt = new Date();

    await interview.save();

    // Update interview scores
    updateInterviewScores(interview);
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Answer evaluated successfully',
      evaluation: interview.questions[questionIndex].evaluation
    });
  } catch (error) {
    console.error('Evaluate answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error evaluating answer',
      error: error.message
    });
  }
};

// Generate detailed feedback for entire interview
exports.generateFeedback = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview || interview.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if all questions are evaluated
    const allEvaluated = interview.questions.every(q => q.status === 'evaluated');
    if (!allEvaluated) {
      return res.status(400).json({
        success: false,
        message: 'Not all questions have been evaluated yet'
      });
    }

    // Generate comprehensive feedback
    const feedback = generateComprehensiveFeedback(interview);

    // Save feedback to database
    const feedbackDoc = new Feedback({
      interviewId: interview._id,
      userId: req.userId,
      overallPerformance: feedback.overallPerformance,
      questionWiseFeedback: feedback.questionWiseFeedback,
      categoryWiseAnalysis: feedback.categoryWiseAnalysis,
      recommendations: feedback.recommendations,
      nextSteps: feedback.nextSteps
    });

    await feedbackDoc.save();

    res.status(201).json({
      success: true,
      message: 'Feedback generated successfully',
      feedback: feedbackDoc
    });
  } catch (error) {
    console.error('Generate feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating feedback',
      error: error.message
    });
  }
};

// Get interview feedback
exports.getFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);

    if (!interview || interview.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const feedback = await Feedback.findOne({ interviewId });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// Helper function to evaluate answer using OpenAI
async function evaluateAnswerWithAI(question, answer, category, expectedKeyPoints) {
  const prompt = `
    You are an expert interview evaluator. Evaluate the following answer to an interview question.
    
    Question (${category}): ${question}
    
    Expected key points: ${expectedKeyPoints.join(', ')}
    
    Candidate's Answer: ${answer}
    
    Please provide:
    1. Relevance Score (0-100): How relevant is the answer to the question?
    2. Completeness Score (0-100): How complete is the answer?
    3. Key Strengths (list 2-3)
    4. Areas for Improvement (list 2-3)
    5. Brief Feedback (2-3 sentences)
    
    Format your response as JSON with these exact keys: relevanceScore, completenessScore, strengths, improvements, feedback
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach and evaluator. Provide constructive feedback in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    const responseText = response.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const evaluation = JSON.parse(jsonMatch[0]);
      return {
        relevanceScore: Math.min(100, Math.max(0, evaluation.relevanceScore || 70)),
        completenessScore: Math.min(100, Math.max(0, evaluation.completenessScore || 70)),
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        feedback: evaluation.feedback || 'Good effort. Keep practicing to improve further.'
      };
    }
  } catch (error) {
    console.error('OpenAI evaluation error:', error);
  }

  // Fallback evaluation if OpenAI fails
  return {
    relevanceScore: 70,
    completenessScore: 70,
    strengths: ['Clear communication', 'Relevant examples'],
    improvements: ['Add more specific details', 'Provide measurable outcomes'],
    feedback: 'Good answer. Try to include more quantifiable results and specific examples.'
  };
}

// Helper function to update interview scores
function updateInterviewScores(interview) {
  let technicalScores = [];
  let hrScores = [];
  let behavioralScores = [];

  interview.questions.forEach(question => {
    if (question.evaluation && question.evaluation.totalScore) {
      if (question.category === 'technical') {
        technicalScores.push(question.evaluation.totalScore);
      } else if (question.category === 'hr') {
        hrScores.push(question.evaluation.totalScore);
      } else if (question.category === 'behavioral') {
        behavioralScores.push(question.evaluation.totalScore);
      }
    }
  });

  // Calculate average scores
  const technicalAvg = technicalScores.length > 0
    ? technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length
    : 0;

  const hrAvg = hrScores.length > 0
    ? hrScores.reduce((a, b) => a + b, 0) / hrScores.length
    : 0;

  const behavioralAvg = behavioralScores.length > 0
    ? behavioralScores.reduce((a, b) => a + b, 0) / behavioralScores.length
    : 0;

  interview.technicalScore = Math.round(technicalAvg);
  interview.hrScore = Math.round(hrAvg);
  interview.behavioralScore = Math.round(behavioralAvg);

  // Calculate overall score
  const allScores = [...technicalScores, ...hrScores, ...behavioralScores];
  interview.overallScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  // Identify strengths and weaknesses
  const scores = { technical: technicalAvg, hr: hrAvg, behavioral: behavioralAvg };
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  interview.strengths = sorted.slice(0, 1).map(([cat]) => `Strong ${cat} skills`);
  interview.areasForImprovement = sorted.slice(-1).map(([cat]) => `Improve ${cat} performance`);
}

// Helper function to generate comprehensive feedback
function generateComprehensiveFeedback(interview) {
  const evaluatedQuestions = interview.questions.filter(q => q.evaluation);

  // Calculate overall performance
  const scores = evaluatedQuestions.map(q => q.evaluation.totalScore);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  let rating = 'needs-improvement';
  if (avgScore >= 80) rating = 'excellent';
  else if (avgScore >= 60) rating = 'good';
  else if (avgScore >= 40) rating = 'average';

  // Question-wise feedback
  const questionWiseFeedback = evaluatedQuestions.map(q => ({
    questionId: q._id,
    question: q.question,
    score: q.evaluation.totalScore,
    feedback: q.evaluation.feedback,
    strengths: q.evaluation.strengths,
    improvements: q.evaluation.improvements
  }));

  // Category-wise analysis
  const categories = {
    technical: evaluatedQuestions.filter(q => q.category === 'technical'),
    hr: evaluatedQuestions.filter(q => q.category === 'hr'),
    behavioral: evaluatedQuestions.filter(q => q.category === 'behavioral')
  };

  const categoryWiseAnalysis = {
    technical: analyzeCategoryPerformance(categories.technical, 'Technical Skills'),
    hr: analyzeCategoryPerformance(categories.hr, 'HR/Soft Skills'),
    behavioral: analyzeCategoryPerformance(categories.behavioral, 'Behavioral Competencies')
  };

  // Generate recommendations
  const recommendations = generateRecommendations(avgScore, categoryWiseAnalysis);
  const nextSteps = generateNextSteps(avgScore, rating);

  return {
    overallPerformance: {
      score: avgScore,
      rating,
      summary: `Your overall interview performance was ${rating}. You scored ${avgScore} out of 100.`
    },
    questionWiseFeedback,
    categoryWiseAnalysis,
    recommendations,
    nextSteps
  };
}

function analyzeCategoryPerformance(questions, categoryName) {
  if (questions.length === 0) {
    return {
      score: 0,
      feedback: `No ${categoryName} questions were answered.`,
      topStrengths: [],
      topWeaknesses: []
    };
  }

  const scores = questions.map(q => q.evaluation.totalScore);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const allStrengths = [];
  const allWeaknesses = [];

  questions.forEach(q => {
    allStrengths.push(...(q.evaluation.strengths || []));
    allWeaknesses.push(...(q.evaluation.improvements || []));
  });

  return {
    score: avgScore,
    feedback: `Your average score in ${categoryName} is ${avgScore}/100.`,
    topStrengths: [...new Set(allStrengths)].slice(0, 3),
    topWeaknesses: [...new Set(allWeaknesses)].slice(0, 3)
  };
}

function generateRecommendations(score, categoryAnalysis) {
  const recommendations = [];

  if (categoryAnalysis.technical.score < 60) {
    recommendations.push('Focus on strengthening your technical skills. Practice coding problems and system design.');
  }

  if (categoryAnalysis.behavioral.score < 60) {
    recommendations.push('Work on your behavioral responses. Use the STAR method (Situation, Task, Action, Result) to structure your answers.');
  }

  if (categoryAnalysis.hr.score < 60) {
    recommendations.push('Improve your communication and soft skills. Practice your elevator pitch and research the company thoroughly.');
  }

  if (score < 50) {
    recommendations.push('Consider taking interview preparation courses to boost your confidence and interview skills.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue to maintain and enhance your strong interview performance.');
  }

  return recommendations;
}

function generateNextSteps(score, rating) {
  const steps = [];

  if (rating === 'excellent') {
    steps.push('You\'re well-prepared! Apply to your target positions with confidence.');
    steps.push('Help others improve their interview skills by sharing your experience.');
  } else if (rating === 'good') {
    steps.push('You\'re on the right track! Practice a few more interviews to fine-tune your answers.');
    steps.push('Focus on the areas mentioned above to further improve your score.');
  } else {
    steps.push('Schedule more mock interviews to practice and build confidence.');
    steps.push('Review the feedback from each question and work on specific improvements.');
    steps.push('Consider seeking mentorship or interview coaching services.');
  }

  steps.push('Schedule your next interview to continue improving.');

  return steps;
}
