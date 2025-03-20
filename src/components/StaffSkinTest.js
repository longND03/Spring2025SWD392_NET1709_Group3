import React, { useEffect, useState } from 'react';
import axios from '../api/axios'; // Ensure axios is configured correctly

const StaffSkinTest = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [questionToAddAnswer, setQuestionToAddAnswer] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestionValue, setEditQuestionValue] = useState('');
  const [editAnswerId, setEditAnswerId] = useState(null);
  const [editAnswerValue, setEditAnswerValue] = useState('');
  
  // Function to fetch the list of questions
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5296/api/skintypetest/questions');
      console.log('Fetched questions:', response.data);
      setQuestions(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('content', newQuestion);

    try {
      const response = await axios.post('http://localhost:5296/api/skintypetest/questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Added question:', response.data);
      setQuestions(prevQuestions => [...prevQuestions, response.data]);
      setNewQuestion('');
      setSuccess('Question added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to add question');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a question
  const handleDeleteQuestion = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5296/api/skintypetest/questions/${id}`);
      setQuestions(prevQuestions => prevQuestions.filter(question => question.id !== id));
      setSuccess('Question deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to update a question
  const handleUpdateQuestion = async (id) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('content', editQuestionValue);

    try {
      const response = await axios.put(`http://localhost:5296/api/skintypetest/questions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the questions list immediately with the response data
      setQuestions(prevQuestions => 
        prevQuestions.map(question => 
          question.id === id ? {...question, content: editQuestionValue} : question
        )
      );

      setEditQuestionId(null);
      setEditQuestionValue('');
      setSuccess('Question updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating question:', error);
      setError('Failed to update question');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new answer to a question
  const handleAddAnswer = async (questionId) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('content', newAnswer);
    formData.append('questionId', questionId);
    // You may need to add SkinTypeId if required
    formData.append('skinTypeId', 1); // Adjust as needed
  
    try {
      // Modified endpoint to match the API structure
      const response = await axios.post(`http://localhost:5296/api/skintypetest/${questionId}/answers`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rest of your code remains the same
      setQuestions(prevQuestions => 
        prevQuestions.map(question => {
          if (question.id === questionId) {
            return { 
              ...question, 
              answers: [...(question.answers || []), response.data]
            };
          }
          return question;
        })
      );
      
      setNewAnswer('');
      setQuestionToAddAnswer(null);
      setSuccess('Answer added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding answer:', error);
      setError('Failed to add answer');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  // Function to delete an answer
  const handleDeleteAnswer = async (questionId, answerId) => {
    // Add confirmation dialog
    if (!window.confirm("Do you want to delete this answer?")) {
      return; // Exit if the user cancels
    }
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5296/api/skintypetest/answers/${answerId}`);
      
      setQuestions(prevQuestions => 
        prevQuestions.map(question => {
          if (question.id === questionId) {
            return { 
              ...question, 
              answers: (question.answers || []).filter(answer => answer.id !== answerId)
            };
          }
          return question;
        })
      );
      
      setSuccess('Answer deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting answer:', error);
      setError('Failed to delete answer');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to update an answer
  const handleUpdateAnswer = async (questionId, answerId) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('Content', editAnswerValue);
    formData.append('QuestionId', questionId);
    formData.append('SkinTypeId', 1); // Adjust if needed

    try {
      const response = await axios.put(`http://localhost:5296/api/skintypetest/answers/${answerId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the state with the updated answer
      setQuestions(prevQuestions => 
        prevQuestions.map(question => {
          if (question.id === questionId) {
            return {
              ...question,
              answers: (question.answers || []).map(answer => 
                answer.id === answerId ? {...answer, content: editAnswerValue} : answer
              )
            };
          }
          return question;
        })
      );

      setEditAnswerId(null);
      setEditAnswerValue('');
      setSuccess('Answer updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating answer:', error);
      setError('Failed to update answer');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditQuestionId(null);
    setEditQuestionValue('');
    setEditAnswerId(null);
    setEditAnswerValue('');
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#E91E63]">Skin Test Management</h2>
      
      {/* Status messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="font-bold">×</button>
        </div>
      )}

      {/* Add question form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-[#E91E63]">Add New Question</h3>
        <form onSubmit={handleAddQuestion} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Enter new question"
            className="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
            required
          />
          <button 
            type="submit" 
            className="bg-[#E91E63] text-white p-2 rounded hover:bg-[#D81B60] transition flex items-center justify-center"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Question'}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && !error && !success && (
        <div className="text-center p-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#E91E63] border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* Questions list */}
      <ul className="space-y-6">
        {questions.length > 0 ? (
          questions.map((question) => (
            <li key={question.id} className="border rounded-lg p-5 shadow-sm bg-gray-50 hover:shadow">
              <div className="mb-1 text-sm text-gray-500">Question ID: {question.id}</div>
              
              {/* Question content/edit form */}
              {editQuestionId === question.id ? (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateQuestion(question.id); }} className="mb-3">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">Edit Question:</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editQuestionValue}
                        onChange={(e) => setEditQuestionValue(e.target.value)}
                        className="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                        required
                      />
                      <div className="flex gap-2">
                        <button 
                          type="submit" 
                          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition min-w-20"
                          disabled={loading}
                        >
                          {loading ? '...' : 'Save'}
                        </button>
                        <button 
                          type="button" 
                          onClick={handleCancelEdit}
                          className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition min-w-20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-3">
                  <div className="text-lg font-medium">Question: <span className="font-bold">{question.content}</span></div>
                  <div className="flex space-x-3 mt-2">
                    <button 
                      onClick={() => { 
                        setEditQuestionId(question.id); 
                        setEditQuestionValue(question.content); 
                      }} 
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteQuestion(question.id)} 
                      className="text-red-500 hover:text-red-700 flex items-center"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              )}
              
              {/* Answers section */}
              <div className="mt-4 pl-4 border-l-4 border-[#E91E63]/20">
                <h3 className="font-semibold mb-2 flex items-center text-[#E91E63]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Answers ({(question.answers || []).length})
                </h3>
                
                {/* Answers list */}
                <ul className="space-y-2 mb-4">
                  {(question.answers || []).length > 0 ? (
                    (question.answers || []).map((answer) => (
                      <li key={answer.id} className="border rounded p-3 bg-white hover:shadow-sm transition">
                        {editAnswerId === answer.id ? (
                          <form onSubmit={(e) => { e.preventDefault(); handleUpdateAnswer(question.id, answer.id); }} className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={editAnswerValue}
                              onChange={(e) => setEditAnswerValue(e.target.value)}
                              className="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                              required
                            />
                            <div className="flex gap-2">
                              <button 
                                type="submit" 
                                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                                disabled={loading}
                              >
                                Save
                              </button>
                              <button 
                                type="button" 
                                onClick={handleCancelEdit}
                                className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="flex-grow">{answer.content}</span>
                            <div className="flex space-x-2 ml-4">
                              <button 
                                onClick={() => { 
                                  setEditAnswerId(answer.id); 
                                  setEditAnswerValue(answer.content); 
                                }} 
                                className="text-blue-500 hover:text-blue-700"
                                disabled={loading}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAnswer(question.id, answer.id)} 
                                className="text-red-500 hover:text-red-700"
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic text-sm p-2">No answers for this question yet.</li>
                  )}
                </ul>
                
                {/* Add answer form */}
                {questionToAddAnswer === question.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleAddAnswer(question.id); }} className="mt-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="Enter new answer"
                        className="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                        required
                      />
                      <div className="flex gap-2">
                        <button 
                          type="submit" 
                          className="bg-[#E91E63] text-white p-2 rounded hover:bg-[#D81B60] transition"
                          disabled={loading}
                        >
                          Add
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setQuestionToAddAnswer(null)}
                          className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setQuestionToAddAnswer(question.id)} 
                    className="text-[#E91E63] hover:text-[#D81B60] font-medium text-sm flex items-center"
                    disabled={loading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Answer
                  </button>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="text-center p-8 border rounded-lg bg-gray-50">
            <p className="text-gray-500">No questions available.</p>
            <button 
              onClick={fetchQuestions} 
              className="mt-4 text-[#E91E63] hover:underline flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </li>
        )}
      </ul>
      
      {questions.length > 0 && (
        <div className="mt-6 text-center">
          <button 
            onClick={fetchQuestions} 
            className="text-[#E91E63] hover:text-[#D81B60] font-medium flex items-center mx-auto"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Questions
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffSkinTest;