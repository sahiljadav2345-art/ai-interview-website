const express = require('express');
const evaluationController = require('../controllers/evaluationController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All evaluation routes require authentication
router.use(authenticate);

router.post('/evaluate-answer', evaluationController.evaluateAnswer);
router.post('/generate-feedback', evaluationController.generateFeedback);
router.get('/:interviewId', evaluationController.getFeedback);

module.exports = router;
