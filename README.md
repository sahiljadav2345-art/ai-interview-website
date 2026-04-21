# AI Mock Interview Platform

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that helps users practice and improve their interview skills using AI-powered question generation and answer evaluation.

## 🌟 Features

### 1. **User Authentication**
- Secure signup and login functionality
- JWT (JSON Web Token) based authentication
- Password encryption using bcrypt
- Forgot password and reset functionality
- User session management

### 2. **User Dashboard**
- User profile with performance analytics
- Interview history and statistics
- Performance charts and visualizations
- Resume management
- Real-time score tracking

### 3. **Resume Upload & Parsing**
- Support for PDF and DOCX file formats
- Automatic resume parsing and data extraction
- Extract skills, experience, education details
- Store parsed data for personalized questions

### 4. **AI Interview Question Generation**
- Dynamic question generation based on job role
- Resume-based personalization
- Question categorization (Technical, HR, Behavioral)
- Support for different interview types
- Customizable number of questions

### 5. **Voice-Based Answer System**
- Real-time voice recording using Web Speech API
- Automatic speech-to-text transcription
- Visual transcript display
- Recording duration tracking

### 6. **AI Answer Evaluation**
- Intelligent answer analysis using OpenAI API
- Evaluation metrics:
  - Relevance scoring
  - Completeness scoring
  - Confidence tracking
- Detailed feedback generation

### 7. **Feedback & Reports**
- Comprehensive feedback for each interview
- Section-wise performance analysis
- Strength and weakness identification
- Personalized recommendations
- Performance trends and improvements

### 8. **Analytics Dashboard**
- Interactive charts and visualizations
- Category-wise performance metrics
- Interview attempt tracking
- Score progression analysis
- Growth insights

## 📋 Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Web Speech API** - Voice recognition

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password encryption
- **OpenAI API** - AI question generation & evaluation
- **Multer** - File upload handling
- **pdf-parse** - PDF parsing
- **mammoth** - DOCX parsing
- **Nodemailer** - Email functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- OpenAI API key

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-interview-website

   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRY=7d

   # OpenAI
   OPENAI_API_KEY=sk-your_openai_api_key

   # Email
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # CORS
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173`

## 📁 Project Structure

```
ai-interview-website/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Custom middleware
│   │   └── utils/           # Helper functions
│   ├── uploads/             # Resume uploads
│   ├── server.js            # Main server file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/           # React pages
    │   ├── components/      # Reusable components
    │   ├── services/        # API calls
    │   ├── context/         # React context
    │   ├── App.jsx          # Main app component
    │   └── main.jsx         # Entry point
    └── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Resumes
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes` - Get user's resumes
- `GET /api/resumes/:resumeId` - Get specific resume
- `DELETE /api/resumes/:resumeId` - Delete resume

### Interviews
- `POST /api/interviews/generate-questions` - Generate interview questions
- `GET /api/interviews` - Get user's interviews
- `GET /api/interviews/:interviewId` - Get interview details
- `POST /api/interviews/submit-answer` - Submit answer
- `POST /api/interviews/complete` - Complete interview

### Evaluations
- `POST /api/evaluations/evaluate-answer` - Evaluate an answer
- `POST /api/evaluations/generate-feedback` - Generate comprehensive feedback
- `GET /api/evaluations/:interviewId` - Get interview feedback

## 🎯 Usage Guide

### 1. Sign Up / Login
- Create a new account or login with existing credentials
- Verify your email address

### 2. Upload Resume (Optional)
- Navigate to Dashboard
- Click "Upload Resume"
- Upload PDF or DOCX file
- AI will extract key information

### 3. Start Interview
- Click "Start New Interview"
- Fill in job role and description
- Select interview type (Technical/HR/Behavioral/Mixed)
- Choose number of questions
- Click "Start Interview"

### 4. Answer Questions
- Read each question carefully
- Click "Start Recording" to begin speaking
- Speak your answer clearly
- Click "Stop Recording" when done
- Proceed to next question

### 5. View Feedback
- After completing all questions
- View detailed feedback and scores
- Analyze strengths and improvements
- Get recommendations

## 🔐 Security Features

- Password encryption with bcrypt
- JWT-based authentication
- Secure API endpoints with middleware
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📊 Database Schema

### User Model
- Personal information (name, email, phone)
- Account credentials (password hash)
- Profile details (skills, target role)
- Authentication tokens

### Resume Model
- File information (name, type, path)
- Parsed content (skills, experience, education)
- Timestamp information

### Interview Model
- Interview metadata (job role, type)
- Questions and answers
- Evaluation scores
- Performance metrics

### Feedback Model
- Overall performance rating
- Category-wise analysis
- Question-wise feedback
- Recommendations and next steps

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Create account on hosting platform
2. Set environment variables
3. Deploy using Git
4. Configure MongoDB Atlas for production

### Frontend Deployment (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository
3. Configure build settings
4. Deploy automatically

## 🐛 Troubleshooting

### Microphone Access Issues
- Check browser permissions
- Ensure HTTPS in production
- Use Chrome/Edge for best compatibility

### MongoDB Connection
- Verify connection string
- Check firewall settings
- Ensure MongoDB service is running

### OpenAI API Errors
- Verify API key
- Check API quota
- Monitor rate limits

## 📝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Support

For support, email support@aiinterview.com or open an issue on GitHub.

## 🙏 Acknowledgments

- OpenAI for GPT API
- MongoDB for database
- React community
- All contributors

---

**Built with ❤️ for interview preparation**

