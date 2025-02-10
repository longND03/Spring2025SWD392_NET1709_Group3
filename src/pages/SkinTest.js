import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

const questions = [
  {
    id: 1,
    question: "When you wake up in the morning, how does your skin feel?",
    options: [
      { value: 'dry', label: 'Tight and dry' },
      { value: 'normal', label: 'Comfortable' },
      { value: 'oily', label: 'Oily and shiny' },
      { value: 'combination', label: 'Oily in T-zone, normal elsewhere' }
    ]
  },
  {
    id: 2,
    question: "How often does your face get shiny throughout the day?",
    options: [
      { value: 'dry', label: 'Never' },
      { value: 'normal', label: 'Rarely' },
      { value: 'combination', label: 'Sometimes, mainly in T-zone' },
      { value: 'oily', label: 'Often, all over' }
    ]
  },
  {
    id: 3,
    question: "How does your skin feel after cleansing?",
    options: [
      { value: 'dry', label: 'Very tight and dry' },
      { value: 'normal', label: 'Clean and comfortable' },
      { value: 'combination', label: 'Tight in some areas, normal in others' },
      { value: 'oily', label: 'Still feels slightly oily' }
    ]
  },
  {
    id: 4,
    question: "How often do you experience breakouts?",
    options: [
      { value: 'dry', label: 'Rarely' },
      { value: 'normal', label: 'Occasionally' },
      { value: 'combination', label: 'Sometimes in T-zone' },
      { value: 'oily', label: 'Frequently' }
    ]
  },
  {
    id: 5,
    question: "What's your pore size like?",
    options: [
      { value: 'dry', label: 'Almost invisible' },
      { value: 'normal', label: 'Small and balanced' },
      { value: 'combination', label: 'Visible in T-zone, small elsewhere' },
      { value: 'oily', label: 'Visibly large, especially in T-zone' }
    ]
  }
];

const SkinTest = () => {
  const { darkMode } = useTheme();
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }
    setShowResults(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 
      ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-extrabold mb-6 
            ${darkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Discover Your Perfect Skincare Routine
          </h1>
          <p className={`text-lg max-w-2xl mx-auto 
            ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Take our comprehensive skin analysis test to receive personalized product recommendations 
            tailored to your unique skin type and concerns.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Progress
            </span>
            <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {Math.round((Object.keys(answers).length / questions.length) * 100)}%
            </span>
          </div>
          <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-200
          ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}
        >
          {questions.map((q) => (
            <div key={q.id} className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b'} last:border-0`}>
              <div className="flex items-start mb-6">
                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-semibold mr-4 mt-1
                  ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-600'}`}
                >
                  {q.id}
                </span>
                <h2 className={`text-xl font-medium leading-6
                  ${darkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {q.question}
                </h2>
              </div>
              
              <div className="grid gap-3 ml-12">
                {q.options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200
                      ${answers[q.id] === option.value 
                        ? (darkMode ? 'bg-blue-900 border-blue-500' : 'bg-blue-50 border-blue-500') 
                        : (darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border hover:bg-gray-50')}
                      border-2`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option.value}
                      checked={answers[q.id] === option.value}
                      onChange={() => handleAnswerSelect(q.id, option.value)}
                      className={`w-4 h-4 ${darkMode ? 'text-blue-500' : 'text-blue-600'}`}
                    />
                    <span className={`ml-3 font-medium
                      ${answers[q.id] === option.value
                        ? (darkMode ? 'text-blue-200' : 'text-blue-700')
                        : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleSubmit}
            className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg
              transition-all duration-200 transform hover:scale-105
              ${darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Get Your Personalized Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkinTest; 