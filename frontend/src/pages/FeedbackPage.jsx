import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService, evaluationService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const FeedbackPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [interviewRes, feedbackRes] = await Promise.all([
        interviewService.getInterview(interviewId),
        evaluationService.getFeedback(interviewId)
      ]);

      setInterview(interviewRes.data.interview);
      setFeedback(feedbackRes.data.feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading feedback...</div>;
  }

  if (!interview || !feedback) {
    return <div className="min-h-screen flex items-center justify-center">Feedback not available</div>;
  }

  const performanceData = [
    { category: 'Technical', score: interview.technicalScore || 0 },
    { category: 'HR', score: interview.hrScore || 0 },
    { category: 'Behavioral', score: interview.behavioralScore || 0 }
  ];

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'average':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const getRatingBgColor = (rating) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-50 border-green-200';
      case 'good':
        return 'bg-blue-50 border-blue-200';
      case 'average':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Interview Feedback</h1>
          <p className="text-gray-600 mt-1">{interview.jobRole} - {new Date(interview.startedAt).toLocaleDateString()}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overall Performance */}
        <div className={`rounded-lg shadow p-8 mb-8 border-l-4 ${getRatingBgColor(feedback.overallPerformance.rating)}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Performance</h2>
              <p className="text-gray-700 mb-4">{feedback.overallPerformance.summary}</p>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getRatingColor(feedback.overallPerformance.rating)}`}>
                {feedback.overallPerformance.score}
              </div>
              <p className="text-gray-600 mt-2">out of 100</p>
              <p className={`text-lg font-semibold mt-2 ${getRatingColor(feedback.overallPerformance.rating)}`}>
                {feedback.overallPerformance.rating.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Wise Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {['technical', 'hr', 'behavioral'].map((category) => {
            const analysis = feedback.categoryWiseAnalysis[category];
            return (
              <div key={category} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                  {category === 'technical' ? 'Technical Skills' : category === 'hr' ? 'HR Skills' : 'Behavioral'}
                </h3>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-blue-600">{analysis.score}</p>
                  <p className="text-gray-600">Score</p>
                </div>
                <p className="text-sm text-gray-700 mb-4">{analysis.feedback}</p>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Strengths:</h4>
                  <ul className="space-y-1">
                    {analysis.topStrengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-green-700">✓ {strength}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Improvements:</h4>
                  <ul className="space-y-1">
                    {analysis.topWeaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-red-700">○ {weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Question Wise Feedback */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Question-wise Feedback</h3>
          <div className="space-y-6">
            {feedback.questionWiseFeedback.map((q, idx) => (
              <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{q.question}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">{q.score}</p>
                    <p className="text-sm text-gray-600">/ 100</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{q.feedback}</p>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Strengths:</h5>
                    <ul className="space-y-1">
                      {q.strengths.map((strength, sidx) => (
                        <li key={sidx} className="text-sm text-green-700">✓ {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Areas to Improve:</h5>
                    <ul className="space-y-1">
                      {q.improvements.map((improvement, iidx) => (
                        <li key={iidx} className="text-sm text-red-700">○ {improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <ul className="space-y-3">
              {feedback.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-gray-700">
                  <span className="text-blue-600 font-semibold">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
            <ul className="space-y-3">
              {feedback.nextSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-gray-700">
                  <span className="text-green-600 font-semibold">{idx + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/start-interview')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Start Another Interview
          </button>
        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;
