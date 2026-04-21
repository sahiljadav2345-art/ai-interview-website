import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { interviewService, resumeService } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [interviewRes, resumeRes] = await Promise.all([
        interviewService.getUserInterviews(),
        resumeService.getResumes()
      ]);

      setInterviews(interviewRes.data.interviews);
      setStats(interviewRes.data.stats);
      setResumes(resumeRes.data.resumes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleStartInterview = () => {
    navigate('/start-interview');
  };

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const scoreData = completedInterviews.map(interview => ({
    name: interview.jobRole || 'Interview',
    score: interview.overallScore
  }));

  const categoryData = completedInterviews.length > 0 ? [{
    name: 'Performance',
    technical: completedInterviews.reduce((sum, i) => sum + (i.technicalScore || 0), 0) / completedInterviews.length,
    hr: completedInterviews.reduce((sum, i) => sum + (i.hrScore || 0), 0) / completedInterviews.length,
    behavioral: completedInterviews.reduce((sum, i) => sum + (i.behavioralScore || 0), 0) / completedInterviews.length
  }] : [];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899'];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.firstName} {user?.lastName}!</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleStartInterview}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Start New Interview
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-6 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Interviews</h3>
            <p className="text-4xl font-bold text-blue-500 mt-2">{stats?.totalInterviews || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Completed</h3>
            <p className="text-4xl font-bold text-green-500 mt-2">{stats?.completedInterviews || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Average Score</h3>
            <p className="text-4xl font-bold text-purple-500 mt-2">{stats?.averageScore || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Progress */}
          {scoreData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Performance */}
          {categoryData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="technical" fill="#3b82f6" />
                  <Bar dataKey="hr" fill="#8b5cf6" />
                  <Bar dataKey="behavioral" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Interviews</h3>
          {interviews.length === 0 ? (
            <p className="text-gray-600">No interviews yet. Start your first interview!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Job Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Score</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.slice(0, 5).map(interview => (
                    <tr key={interview._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{interview.jobRole}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{interview.interviewType}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {interview.status === 'completed' ? (
                          <span className="text-blue-600">{interview.overallScore}/100</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          interview.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(interview.startedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => navigate(`/interview/${interview._id}`)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Resumes</h3>
          {resumes.length === 0 ? (
            <p className="text-gray-600 mb-4">No resumes uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {resumes.map(resume => (
                <div key={resume._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{resume.fileName}</p>
                    <p className="text-sm text-gray-600">Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/resume/${resume._id}`)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/upload-resume')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Upload Resume
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
