const express = require('express');
const resumeController = require('../controllers/resumeController');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All resume routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/', resumeController.getUserResumes);
router.get('/:resumeId', resumeController.getResume);
router.delete('/:resumeId', resumeController.deleteResume);

module.exports = router;
