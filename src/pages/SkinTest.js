import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

const SkinTest = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [recSkintypeId, setRecSkintypeId] = useState([]);
  const [recProduct, setRecProduct] = useState([]);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

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

  useEffect(() => {
    const fetchRecommendProductBySkintypeId = async () => {
      try {
        
      } catch (error) {
        
      } finally {
        
      }
    }

    fetchRecommendProductBySkintypeId();
  }, [recSkintypeId]);

  const handleAnswerSelect = (questionId, value) => {
    // Hide results when any answer changes
    setShowResults(false);
    setResult("");

    // Check if this question was previously answered
    const isFirstAnswer = !answers[questionId];

    setAnswers(prev => ({
      ...prev,
      [questionId]: [value.skinTypeId, value.skinType]
    }));

    // Auto advance to next question only if this is the first answer for this question
    if (isFirstAnswer && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
  };

  const handleSubmit = () => {
    // Count occurrences of each skin type and store their IDs
    const skinTypeData = {};
    const totalQuestions = Object.keys(answers).length;

    Object.values(answers).forEach(([skinTypeId, skinType]) => {
      if (!skinTypeData[skinType]) {
        skinTypeData[skinType] = { count: 0, id: skinTypeId };
      }
      skinTypeData[skinType].count += 1;
    });

    // Calculate percentages
    Object.keys(skinTypeData).forEach(skinType => {
      skinTypeData[skinType].percentage = Math.round((skinTypeData[skinType].count / totalQuestions) * 100);
    });

    // Sort skin types by percentage
    const sortedSkinTypes = Object.entries(skinTypeData)
      .sort(([, a], [, b]) => b.percentage - a.percentage);

    // Find the highest percentage
    const highestPercentage = sortedSkinTypes[0][1].percentage;

    // Get all skin types with the highest percentage
    const highestSkinTypes = sortedSkinTypes.filter(([, data]) => data.percentage === highestPercentage);
    
    // Set all highest percentage skin type IDs
    const highestSkinTypeIds = highestSkinTypes.map(([, data]) => data.id);
    setRecSkintypeId(highestSkinTypeIds);

    const resultMessage = sortedSkinTypes
      .map(([skinType, data], index) => {
        // Apply bold and large font to all skin types with highest percentage
        if (data.percentage === highestPercentage) {
          return `<span class="text-xl font-bold text-[#E91E63]">${data.percentage}% ${skinType}</span>`;
        }
        return `${data.percentage}% ${skinType}`;
      })
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
      <div className="flex items-center justify-center h-screen">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-6 text-[#E91E63]">
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
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
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

        {/* Current Question Section */}
        {currentQuestion && (
          <div className="rounded-xl shadow-lg overflow-hidden bg-white">
            <div className="p-6">
              <div className="flex items-start mb-6">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-semibold mr-4 mt-1 bg-blue-100 text-blue-600">
                  {currentQuestion.id}
                </span>
                <h2 className="text-xl font-medium leading-6 text-gray-900">
                  {currentQuestion.content}
                </h2>
              </div>

              <div className="grid gap-3 ml-12">
                {currentQuestion.answers.map((a) => (
                  <label
                    key={a.skinTypeId}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200
                      ${answers[currentQuestion.id]?.[0] === a.skinTypeId
                        ? 'bg-blue-50 border-blue-500'
                        : 'border hover:bg-gray-50'}
                      border-2`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={a.skinTypeId}
                      checked={answers[currentQuestion.id]?.[0] === a.skinTypeId}
                      onChange={() => handleAnswerSelect(currentQuestion.id, a)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`ml-3 font-medium
                      ${answers[currentQuestion.id]?.[0] === a.skinTypeId ? 'text-blue-700' : 'text-gray-700'}`}
                    >
                      {a.content}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <div className="flex gap-3">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium w-40
                ${currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
            >
              Previous
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className={`px-6 py-3 rounded-lg font-medium w-40
                ${currentQuestionIndex === questions.length - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
            >
              Next
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${Object.keys(answers).length === questions.length
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit
          </button>
        </div>
      </div>

      {showResults && (!isRecommendLoading ?
        <div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-20 rounded-xl shadow-lg overflow-hidden bg-white p-6">
              <h3 className="text-xl font-semibold mb-4">Your Results</h3>
              <p className="text-lg text-gray-700" dangerouslySetInnerHTML={{ __html: result }}></p>
            </div>
          </div>

          <p className="text-4xl text-left font-extrabold pl-10 mb-10">Recommendations for your skin type</p>

          
        </div>
        :
        <div className="flex items-center justify-center mt-20">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default SkinTest; 