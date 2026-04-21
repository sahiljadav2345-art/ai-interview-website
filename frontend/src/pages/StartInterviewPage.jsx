import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService, resumeService } from '../services/api';

export const StartInterviewPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobRole: '',
    jobDescription: '',
    resumeId: '',
    interviewType: 'mixed',
    numberOfQuestions: 5
  });
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await resumeService.getResumes();
      setResumes(response.data.resumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.jobRole.trim()) {
      setError('Please enter a job role');
      setLoading(false);
      return;
    }

    try {
      const response = await interviewService.generateQuestions(formData);
      const interviewId = response.data.interview.id;
      navigate(`/interview/${interviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Start New Interview</h1>
          <p className="text-gray-600 mt-1">Configure your interview and let AI generate personalized questions</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description (Optional)
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Paste the job description to get more tailored questions..."
              />
            </div>

            {/* Resume Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume (Optional)
              </label>
              <select
                name="resumeId"
                value={formData.resumeId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">Choose a resume...</option>
                {resumes.map(resume => (
                  <option key={resume._id} value={resume._id}>
                    {resume.fileName}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-600">
                Don't have a resume? <a href="/upload-resume" className="text-blue-600 hover:text-blue-700">Upload one</a>
              </p>
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interview Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'technical', label: 'Technical', icon: '💻' },
                  { value: 'hr', label: 'HR', icon: '🤝' },
                  { value: 'behavioral', label: 'Behavioral', icon: '🎯' },
                  { value: 'mixed', label: 'Mixed', icon: '🎭' }
                ].map(type => (
                  <label
                    key={type.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.interviewType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interviewType"
                      value={type.value}
                      checked={formData.interviewType === type.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="text-2xl">{type.icon}</span>
                    <p className="font-semibold text-gray-900 mt-2">{type.label}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="numberOfQuestions"
                  min="3"
                  max="10"
                  value={formData.numberOfQuestions}
                  onChange={handleChange}
                  className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-2xl font-bold text-blue-600 min-w-12">
                  {formData.numberOfQuestions}
                </span>
              </div>
            </div>

            {/* Interview Duration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Interview Duration</h4>
              <p className="text-sm text-blue-800">
                This interview will have {formData.numberOfQuestions} questions. 
                Plan for approximately {formData.numberOfQuestions * 3}-{formData.numberOfQuestions * 5} minutes.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                {loading ? 'Generating Questions...' : 'Start Interview'}
              </button>
            </div>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Success</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Find a quiet place with good microphone quality</li>
              <li>✓ Read the question carefully before answering</li>
              <li>✓ Speak clearly and concisely</li>
              <li>✓ Use the STAR method for behavioral questions</li>
              <li>✓ Take your time - there's no rush</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StartInterviewPage;
