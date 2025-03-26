import axios from '../api/axios';
import { Container, Grid2 } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import messages from '../constants/message.json';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { saveSkinTestResult, getSkinTestResults } from '../utils/cookies';

const SkinTest = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const [recSkintypeId, setRecSkintypeId] = useState([]);
  const [recProduct, setRecProduct] = useState([]);
  const [isRecommendLoading, setIsRecommendLoading] = useState(true);
  
  const { user } = useAuth();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("/api/skintypetest/questions");
        setQuestions(res.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error(messages.error.loadProducts);
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
        setIsRecommendLoading(true);
        console.log(recSkintypeId);

        const queryString = recSkintypeId.map(id => `&SkinTypeIds=${id}`).join('');
        const res = await axios.get(`/api/product?PageNumber=1&PageSize=5&IsDeleted=false${queryString}`);

        setRecProduct(res.data.items);
      } catch (error) {
        console.log("Cant fetch recommendations!")
      } finally {
        setIsRecommendLoading(false);
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
    } else if (isFirstAnswer && currentQuestionIndex === questions.length - 1) {
      handleSubmit();
    }
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
  };

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    
    // Disable submit button for 0.5 seconds
    setIsSubmitDisabled(true);
    setTimeout(() => {
      setIsSubmitDisabled(false);
    }, 500);
    
    setHasSubmittedOnce(true);
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

    // Create the result message for display
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
    
    // Create simplified result object with just all types
    const skinTestResult = {
      types: sortedSkinTypes.map(([skinType, data]) => ({
        id: data.id,
        name: skinType,
        percentage: data.percentage
      }))
    };
    
    // Save to cookies (will expire in 24 hours)
    saveSkinTestResult(skinTestResult);
    
    // Console log all results for verification
    console.log('New skin test result:', skinTestResult);
    console.log('All saved results:', getSkinTestResults());
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
                ? isSubmitDisabled 
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              ${!hasSubmittedOnce && 'hidden'}`}
            disabled={Object.keys(answers).length < questions.length || isSubmitDisabled}
          >
            Re-submit
          </button>
        </div>
      </div>

      {/* Show result section */}
      {showResults && (
        <div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-20 rounded-xl shadow-lg overflow-hidden bg-white p-6">
              <h3 className="text-xl font-semibold mb-4">Your Results</h3>
              <p className="text-lg text-gray-700" dangerouslySetInnerHTML={{ __html: result }}></p>
              
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-green-600">
                  Result saved.
                </p>
                <Link to="/profile?tab=skinroutine">
                  <button className="inline-block px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#D81B60] transition-colors duration-300">
                    To Skin Routine
                  </button>
                </Link>
              </div>
              
              <p className="text-red-600 mt-4 text-sm italic">
                *Disclaimer: This quiz is for reference purposes only and is intended to provide a general prediction of the skin type you may have. It is not a substitute for professional dermatological advice. For an accurate skin assessment, please consult a dermatologist or skincare specialist.
              </p>
            </div>
          </div>

          <p className="text-4xl text-center font-extrabold pl-10 mb-10">Recommendations for your skin type</p>
          {isRecommendLoading ? (
            <div className="flex items-center justify-center mt-20">
              <CircularProgress />
            </div>
          ) : (
            <Container sx={{ py: 4 }}>
              <Grid2 container spacing={3}>
                {recProduct.length > 0 ? (
                  recProduct.map(product => (
                    <Grid2
                      size={3}      // 3 cards per row on medium screens
                      key={product.id}
                    >
                      <ProductCard
                        product={product}
                      />
                    </Grid2>
                  ))
                ) : (
                  <Grid2>
                    <p className="text-base">No products available.</p>
                  </Grid2>
                )}
              </Grid2>
            </Container>
          )}
        </div>
      )}
    </div>
  );
};

export default SkinTest; 