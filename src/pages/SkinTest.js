import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

// const questions = [
//   {
//     id: 1,
//     question: "When you wake up in the morning, how does your skin feel?",
//     options: [
//       { value: 'dry', label: 'Tight and dry' },
//       { value: 'normal', label: 'Comfortable' },
//       { value: 'oily', label: 'Oily and shiny' },
//       { value: 'combination', label: 'Oily in T-zone, normal elsewhere' }
//     ]
//   },
//   {
//     id: 2,
//     question: "How often does your face get shiny throughout the day?",
//     options: [
//       { value: 'dry', label: 'Never' },
//       { value: 'normal', label: 'Rarely' },
//       { value: 'combination', label: 'Sometimes, mainly in T-zone' },
//       { value: 'oily', label: 'Often, all over' }
//     ]
//   },
//   {
//     id: 3,
//     question: "How does your skin feel after cleansing?",
//     options: [
//       { value: 'dry', label: 'Very tight and dry' },
//       { value: 'normal', label: 'Clean and comfortable' },
//       { value: 'combination', label: 'Tight in some areas, normal in others' },
//       { value: 'oily', label: 'Still feels slightly oily' }
//     ]
//   },
//   {
//     id: 4,
//     question: "How often do you experience breakouts?",
//     options: [
//       { value: 'dry', label: 'Rarely' },
//       { value: 'normal', label: 'Occasionally' },
//       { value: 'combination', label: 'Sometimes in T-zone' },
//       { value: 'oily', label: 'Frequently' }
//     ]
//   },
//   {
//     id: 5,
//     question: "What's your pore size like?",
//     options: [
//       { value: 'dry', label: 'Almost invisible' },
//       { value: 'normal', label: 'Small and balanced' },
//       { value: 'combination', label: 'Visible in T-zone, small elsewhere' },
//       { value: 'oily', label: 'Visibly large, especially in T-zone' }
//     ]
//   }
// ];

const SkinTest = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:5296/api/skintypetest/questions");
        setQuestions(res.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error('Failed to fetch products');
        setError("Failed to fetch products! X.X");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  // useEffect(() => {
  //   console.log("single log", questions)
  // }, [questions])

  const handleAnswerSelect = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [value.skinTypeId, value.skinType]
    }));
  };

  const handleSubmit = () => {
    console.log(answers)
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    // Count occurrences of each skin type
    const skinTypeCounts = {};
    const totalQuestions = Object.keys(answers).length;

    // Iterate through answers and count each skin type
    Object.values(answers).forEach(([skinTypeId, skinType]) => {
      skinTypeCounts[skinType] = (skinTypeCounts[skinType] || 0) + 1;
    });

    // Calculate percentages for each skin type
    const skinTypePercentages = {};
    Object.entries(skinTypeCounts).forEach(([skinType, count]) => {
      skinTypePercentages[skinType] = Math.round((count / totalQuestions) * 100);
    });

    // Create result message showing all percentages
    const resultMessage = Object.entries(skinTypePercentages)
      .map(([skinType, percentage]) => `${percentage}% ${skinType}`)
      .join(', ');

    setResult(`Your skin type analysis: ${resultMessage}`);
    setShowResults(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div div className="flex items-center justify-center h-screen" >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-6 text-gray-900">
            Discover Your Perfect Skincare Routine
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-600">
            Take our comprehensive skin analysis test to receive personalized product recommendations
            tailored to your unique skin type and concerns.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round((Object.keys(answers).length / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="rounded-xl shadow-lg overflow-hidden bg-white">
          {questions.map((q) => (
            <div key={q.id} className="p-6 border-b last:border-0">
              <div className="flex items-start mb-6">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-semibold mr-4 mt-1 bg-blue-100 text-blue-600">
                  {q.id}
                </span>
                <h2 className="text-xl font-medium leading-6 text-gray-900">
                  {q.content}
                </h2>
              </div>

              <div className="grid gap-3 ml-12">
                {q.answers.map((a) => (
                  <label
                    key={a.skinTypeId}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200
                      ${answers[q.id]?.[0] === a.skinTypeId
                        ? 'bg-blue-50 border-blue-500'
                        : 'border hover:bg-gray-50'}
                      border-2`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={a.skinTypeId}
                      checked={answers[q.id]?.[0] === a.skinTypeId}
                      onChange={() => handleAnswerSelect(q.id, a)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`ml-3 font-medium
                      ${answers[q.id]?.[0] === a.skinTypeId ? 'text-blue-700' : 'text-gray-700'}`}
                    >
                      {a.content}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center mt-8 mb-8">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg
              transition-all duration-200 transform hover:scale-105
              bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get Your Personalized Results
          </button>
        </div>

        {showResults && (
          <div className="rounded-xl shadow-lg overflow-hidden bg-white">
            <p>dskfsfsdhfksfksdfs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinTest; 