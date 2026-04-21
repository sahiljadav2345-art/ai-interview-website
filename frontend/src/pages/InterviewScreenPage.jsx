import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService, evaluationService } from '../services/api';

export const InterviewScreenPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    fetchInterview();
    initializeSpeechRecognition();
  }, []);

  useEffect(() => {
    if (interview && interview.duration) {
      setTimeLeft(interview.duration * 60);
    }
  }, [interview]);

  useEffect(() => {
    if (timeLeft > 0 && !isRecording) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, isRecording]);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecording]);

  const fetchInterview = async () => {
    try {
      const response = await interviewService.getInterview(interviewId);
      setInterview(response.data.interview);
    } catch (error) {
      console.error('Error fetching interview:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
      };
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const audioChunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = async () => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          setIsRecording(false);
          resolve();
        };
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } else {
        resolve();
      }
    });
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) {
      alert('Please record an answer');
      return;
    }

    try {
      await interviewService.submitAnswer({
        interviewId,
        questionIndex: currentQuestionIndex,
        transcribedText: transcript,
        audioUrl: '',
        duration: recordingDuration,
        confidence: 75 // Can be calculated based on confidence scores
      });

      // Evaluate answer
      await evaluationService.evaluateAnswer({
        interviewId,
        questionIndex: currentQuestionIndex
      });

      if (currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTranscript('');
        setRecordingDuration(0);
      } else {
        // All questions answered
        alert('Interview completed! View your feedback.');
        navigate(`/feedback/${interviewId}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error submitting answer. Please try again.');
    }
  };

  const completeInterview = async () => {
    try {
      await interviewService.completeInterview({ interviewId });
      navigate(`/feedback/${interviewId}`);
    } catch (error) {
      console.error('Error completing interview:', error);
      alert('Error completing interview. Please try again.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading interview...</div>;
  }

  if (!interview) {
    return <div className="min-h-screen flex items-center justify-center">Interview not found</div>;
  }

  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress = Math.round((currentQuestionIndex / interview.questions.length) * 100);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{interview.jobRole}</h1>
          <div className="flex justify-between items-center mt-4">
            <p className="text-gray-600">Question {currentQuestionIndex + 1} of {interview.questions.length}</p>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-600">Time Left</p>
                <p className="text-2xl font-bold text-red-600">{formatTime(timeLeft)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Recording</p>
                <p className={`text-2xl font-bold ${isRecording ? 'text-red-600' : 'text-gray-600'}`}>
                  {formatTime(recordingDuration)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h2>

          {currentQuestion.expectedKeyPoints && currentQuestion.expectedKeyPoints.length > 0 && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Key Points to Cover:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {currentQuestion.expectedKeyPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Your Answer:</h3>
              <p className="text-gray-700">{transcript}</p>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex gap-4 mb-8">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
              >
                <span>🎤</span> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 animate-pulse"
              >
                <span>⏹️</span> Stop Recording
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                  setTranscript('');
                }
              }}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 font-semibold py-2 px-6 rounded-lg"
            >
              ← Previous
            </button>

            {currentQuestionIndex === interview.questions.length - 1 ? (
              <button
                onClick={completeInterview}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Complete Interview
              </button>
            ) : (
              <button
                onClick={submitAnswer}
                disabled={!transcript.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewScreenPage;
