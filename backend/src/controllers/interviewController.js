const OpenAI = require('openai');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const User = require('../models/User');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate interview questions using OpenAI
exports.generateQuestions = async (req, res) => {
  try {
    const { jobRole, jobDescription, resumeId, interviewType = 'mixed', numberOfQuestions = 5 } = req.body;

    if (!jobRole) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required'
      });
    }

    // Get resume data if provided
    let resumeData = {};
    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume && resume.userId.toString() === req.userId) {
        resumeData = resume.parsedData;
      }
    }

    // Get user data for context
    const user = await User.findById(req.userId);

    // Build prompt for OpenAI
    const prompt = buildPrompt(
      jobRole,
      jobDescription,
      resumeData,
      user,
      interviewType,
      numberOfQuestions
    );

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach. Generate realistic and insightful interview questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const questionsText = response.choices[0].message.content;
    const questions = parseQuestions(questionsText, interviewType);

    // Create interview record
    const interview = new Interview({
      userId: req.userId,
      resumeId: resumeId || null,
      jobRole,
      jobDescription,
      interviewType,
      questions: questions.map(q => ({
        category: q.category,
        question: q.question,
        expectedKeyPoints: q.keyPoints || []
      }))
    });

    await interview.save();

    res.status(201).json({
      success: true,
      message: 'Interview questions generated successfully',
      interview: {
        id: interview._id,
        jobRole: interview.jobRole,
        questions: interview.questions.map(q => ({
          id: q._id,
          question: q.question,
          category: q.category
        }))
      }
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating interview questions',
      error: error.message
    });
  }
};

// Get interview details
exports.getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);

    if (!interview || interview.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interview',
      error: error.message
    });
  }
};

// Get user interviews
exports.getUserInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ startedAt: -1 });

    // Calculate summary stats
    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const avgScore = completedInterviews.length > 0
      ? (completedInterviews.reduce((sum, i) => sum + i.overallScore, 0) / completedInterviews.length).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      interviews,
      stats: {
        totalInterviews: interviews.length,
        completedInterviews: completedInterviews.length,
        averageScore: avgScore
      }
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interviews',
      error: error.message
    });
  }
};

// Submit answer for a question
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, transcribedText, audioUrl, duration, confidence } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview || interview.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (questionIndex >= interview.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    // Update question with answer
    interview.questions[questionIndex].answer = {
      transcribedText,
      audioUrl,
      duration,
      confidence
    };
    interview.questions[questionIndex].status = 'answered';
    interview.questions[questionIndex].attemptedAt = new Date();

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting answer',
      error: error.message
    });
  }
};

// Complete interview
exports.completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview || interview.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.timeSpent = Math.round((new Date() - interview.startedAt) / 1000);

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview completed',
      interview
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing interview',
      error: error.message
    });
  }
};

// Helper function to build prompt
function buildPrompt(jobRole, jobDescription, resumeData, user, interviewType, numberOfQuestions) {
  let prompt = `Generate ${numberOfQuestions} interview questions for a ${jobRole} position`;

  if (jobDescription) {
    prompt += ` for the following job description:\n${jobDescription}\n`;
  }

  if (resumeData.skills && resumeData.skills.length > 0) {
    prompt += `\n\nCandidate's skills: ${resumeData.skills.join(', ')}\n`;
  }

  if (resumeData.experience && resumeData.experience.length > 0) {
    prompt += `\nCandidate's experience: ${resumeData.experience.map(e => e.jobTitle).join(', ')}\n`;
  }

  let typeString = '';
  if (interviewType === 'technical') {
    typeString = 'Focus on technical and programming questions.';
  } else if (interviewType === 'hr') {
    typeString = 'Focus on HR and behavioral questions.';
  } else if (interviewType === 'behavioral') {
    typeString = 'Focus on behavioral and situational questions.';
  } else {
    typeString = 'Include a mix of technical, behavioral, and HR questions.';
  }

  prompt += `\n\n${typeString}\n`;
  prompt += `\nFor each question, provide:\n1. The question itself\n2. Key points to look for in the answer\n3. Question category (technical/behavioral/hr)\n`;
  prompt += `\nFormat each question clearly with line breaks between them.`;

  return prompt;
}

// Helper function to parse questions from OpenAI response
function parseQuestions(text, interviewType) {
  const questions = [];
  const lines = text.split('\n');

  let currentQuestion = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^\d+\.|^Question:/i)) {
      if (currentQuestion.question) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question: line.replace(/^\d+\.|^Question:\s*/i, '').trim(),
        category: determinateCategory(line, interviewType),
        keyPoints: []
      };
    } else if (line.match(/^(Key Points?:|Expected:|Look for:)/i)) {
      let keyPointsText = line.replace(/^(Key Points?:|Expected:|Look for:)\s*/i, '');
      if (keyPointsText) {
        currentQuestion.keyPoints = keyPointsText.split(',').map(k => k.trim());
      }
    } else if (line.match(/^(Category|Type):/i)) {
      const category = line.replace(/^(Category|Type):\s*/i, '').trim().toLowerCase();
      if (['technical', 'behavioral', 'hr'].includes(category)) {
        currentQuestion.category = category;
      }
    }
  }

  if (currentQuestion.question) {
    questions.push(currentQuestion);
  }

  return questions.length > 0 ? questions : generateDefaultQuestions(interviewType);
}

// Generate default questions if parsing fails
function generateDefaultQuestions(interviewType) {
  const defaultQuestions = {
    technical: [
      { question: 'What is your experience with the tech stack for this role?', category: 'technical' },
      { question: 'Describe a challenging technical problem you solved recently.', category: 'technical' },
      { question: 'How do you approach debugging and testing?', category: 'technical' }
    ],
    behavioral: [
      { question: 'Tell me about a time you worked in a team. What was your role?', category: 'behavioral' },
      { question: 'Describe a situation where you faced a conflict. How did you resolve it?', category: 'behavioral' },
      { question: 'Give an example of when you had to meet a tight deadline.', category: 'behavioral' }
    ],
    hr: [
      { question: 'Why are you interested in this position and company?', category: 'hr' },
      { question: 'Where do you see yourself in 5 years?', category: 'hr' },
      { question: 'What are your strengths and weaknesses?', category: 'hr' }
    ]
  };

  if (interviewType === 'mixed') {
    return [
      ...defaultQuestions.technical.slice(0, 2),
      ...defaultQuestions.behavioral.slice(0, 2),
      ...defaultQuestions.hr.slice(0, 1)
    ];
  }

  return defaultQuestions[interviewType] || [];
}

// Determine question category
function determinateCategory(text, interviewType) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('technical') || lowerText.includes('code') || lowerText.includes('programming')) {
    return 'technical';
  } else if (lowerText.includes('behavioral') || lowerText.includes('team') || lowerText.includes('situation')) {
    return 'behavioral';
  } else if (lowerText.includes('hr') || lowerText.includes('strength') || lowerText.includes('weakness')) {
    return 'hr';
  }

  const categories = ['technical', 'behavioral', 'hr'];
  return categories[Math.floor(Math.random() * categories.length)];
}
