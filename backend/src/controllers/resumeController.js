const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const User = require('../models/User');

// Upload and parse resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { originalname, filename, path: filePath, mimetype } = req.file;

    // Determine file type
    let fileType = 'pdf';
    if (mimetype.includes('word') || originalname.endsWith('.docx') || originalname.endsWith('.doc')) {
      fileType = 'docx';
    }

    // Parse file content
    let rawText = '';

    if (fileType === 'pdf') {
      const fileBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(fileBuffer);
      rawText = data.text;
    } else if (fileType === 'docx') {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    }

    // Parse resume data from text
    const parsedData = parseResumeContent(rawText);

    // Save to database
    const resume = new Resume({
      userId: req.userId,
      fileName: originalname,
      filePath: filename,
      fileType,
      rawText,
      parsedData
    });

    await resume.save();

    // Update user skills if available
    if (parsedData.skills && parsedData.skills.length > 0) {
      await User.findByIdAndUpdate(
        req.userId,
        { skills: parsedData.skills },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
        parsedData: resume.parsedData
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
};

// Get user's resumes
exports.getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      resumes
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resumes',
      error: error.message
    });
  }
};

// Get specific resume
exports.getResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);

    if (!resume || resume.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      resume
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resume',
      error: error.message
    });
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);

    if (!resume || resume.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Delete file
    const filePath = path.join(__dirname, '../../uploads', resume.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resume.findByIdAndDelete(resumeId);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resume',
      error: error.message
    });
  }
};

// Parse resume content from text
function parseResumeContent(text) {
  const parsedData = {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: []
  };

  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    parsedData.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = text.match(/\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/);
  if (phoneMatch) {
    parsedData.phone = phoneMatch[0];
  }

  // Extract skills (simple approach - look for common skill keywords)
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'MongoDB', 'SQL',
    'HTML', 'CSS', 'Git', 'Docker', 'AWS', 'Azure', 'Machine Learning',
    'TypeScript', 'Express', 'Angular', 'Vue', 'PHP', 'Ruby', 'Go',
    'Kubernetes', 'GraphQL', 'REST API', 'Django', 'Flask', 'Spring Boot'
  ];

  skillKeywords.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      parsedData.skills.push(skill);
    }
  });

  // Remove duplicates
  parsedData.skills = [...new Set(parsedData.skills)];

  return parsedData;
}
