const express = require('express');
const interviewController = require('../controllers/interviewController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All interview routes require authentication
router.use(authenticate);

router.post('/generate-questions', interviewController.generateQuestions);
router.get('/:interviewId', interviewController.getInterview);
router.get('/', interviewController.getUserInterviews);
router.post('/submit-answer', interviewController.submitAnswer);
router.post('/complete', interviewController.completeInterview);

module.exports = router;
