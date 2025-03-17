import React, { useEffect, useState } from 'react';
import axios from '../api/axios'; // Ensure axios is configured correctly

const StaffSkinTest = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [error, setError] = useState('');
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestionValue, setEditQuestionValue] = useState('');
  const [editAnswerId, setEditAnswerId] = useState(null);
  const [editAnswerValue, setEditAnswerValue] = useState('');

  // Function to fetch the list of questions
  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5296/api/skintypetest/questions');
      console.log('Fetched questions:', response.data); // Kiểm tra dữ liệu trả về
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions');
    }
  };

  // Function to add a new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', newQuestion);

    try {
      const response = await axios.post('http://localhost:5296/api/skintypetest/questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Added question:', response.data); // Kiểm tra dữ liệu trả về
      setQuestions(prevQuestions => [...prevQuestions, response.data]); // Cập nhật danh sách câu hỏi
      setNewQuestion(''); // Reset input
    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to add question');
    }
  };

  // Function to delete a question
  const handleDeleteQuestion = async (id) => {
    try {
      await axios.delete(`http://localhost:5296/api/skintypetest/questions/${id}`); // API endpoint to delete question
      setQuestions(prevQuestions => prevQuestions.filter(question => question.id !== id)); // Cập nhật danh sách câu hỏi
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question');
    }
  };

  // Function to update a question
  const handleUpdateQuestion = async (id) => {
    const formData = new FormData();
    formData.append('content', editQuestionValue);

    try {
      const response = await axios.put(`http://localhost:5296/api/skintypetest/questions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Cập nhật danh sách câu hỏi ngay lập tức
      setQuestions(prevQuestions => 
        prevQuestions.map(question => 
          question.id === id ? response.data : question
        )
      );

      setEditQuestionId(null); // Reset edit state
      setEditQuestionValue(''); // Reset input
    } catch (error) {
      console.error('Error updating question:', error);
      setError('Failed to update question');
    }
  };

  // Function to add a new answer to a question
  const handleAddAnswer = async (questionId) => {
    const formData = new FormData();
    formData.append('content', newAnswer);

    try {
      const response = await axios.post(`http://localhost:5296/api/skintypetest/questions/${questionId}/answers`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedQuestions = questions.map(question => {
        if (question.id === questionId) {
          return { ...question, answers: [...(question.answers || []), response.data] }; // Đảm bảo answers là một mảng
        }
        return question;
      });
      setQuestions(updatedQuestions); // Cập nhật danh sách câu hỏi
      setNewAnswer(''); // Reset input
    } catch (error) {
      console.error('Error adding answer:', error);
      setError('Failed to add answer');
    }
  };

  // Function to delete an answer
  const handleDeleteAnswer = async (questionId, answerId) => {
    try {
      await axios.delete(`http://localhost:5296/api/skintypetest/answers/${answerId}`); // API endpoint to delete answer
      const updatedQuestions = questions.map(question => {
        if (question.id === questionId) {
          return { ...question, answers: (question.answers || []).filter(answer => answer.id !== answerId) }; // Đảm bảo answers là một mảng
        }
        return question;
      });
      setQuestions(updatedQuestions); // Cập nhật danh sách câu hỏi
    } catch (error) {
      console.error('Error deleting answer:', error);
      setError('Failed to delete answer');
    }
  };

  // Function to update an answer
  const handleUpdateAnswer = async (questionId, answerId) => {
    const formData = new FormData();
    formData.append('Content', editAnswerValue);
    formData.append('QuestionId', questionId);
    formData.append('SkinTypeId', 1); // Điều chỉnh nếu cần

    try {
      const response = await axios.put(`http://localhost:5296/api/skintypetest/answers/${answerId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Cập nhật danh sách câu hỏi ngay lập tức
      setQuestions(prevQuestions => 
        prevQuestions.map(question => {
          if (question.id === questionId) {
            return {
              ...question,
              answers: (question.answers || []).map(answer => 
                answer.id === answerId ? response.data : answer
              )
            };
          }
          return question;
        })
      );

      setEditAnswerId(null);
      setEditAnswerValue('');
    } catch (error) {
      console.error('Error updating answer:', error);
      setError('Failed to update answer');
    }
  };

  useEffect(() => {
    fetchQuestions(); // Gọi hàm để lấy danh sách câu hỏi khi component mount
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#E91E63]">Skin Test Management</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleAddQuestion} className="mb-4 flex">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Enter new question"
          className="border rounded p-2 mr-2 flex-grow focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
          required
        />
        <button type="submit" className="bg-[#E91E63] text-white p-2 rounded hover:bg-[#D81B60] transition">
          Add Question
        </button>
      </form>
      <ul className="space-y-4">
        {questions.length > 0 ? (
          questions.map((question) => (
            <li key={question.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
              <div className="font-semibold">ID: {question.id}</div>
              <div className="text-lg">Question: <span className="font-bold">{question.content}</span></div>
              <div className="flex space-x-2 mt-2">
                <button onClick={() => { 
                  setEditQuestionId(question.id); 
                  setEditQuestionValue(question.content); 
                }} className="text-blue-500 hover:underline">Edit</button>
                <button onClick={() => handleDeleteQuestion(question.id)} className="text-red-500 hover:underline">Delete</button>
              </div>
              {editQuestionId === question.id && (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateQuestion(question.id); }} className="mt-2">
                  <input
                    type="text"
                    value={editQuestionValue}
                    onChange={(e) => setEditQuestionValue(e.target.value)}
                    className="border rounded p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    required
                  />
                  <button type="submit" className="bg-green-500 text-white p-2 rounded">Update</button>
                </form>
              )}
              <h3 className="font-semibold mt-4">Answers:</h3>
              <ul className="space-y-2">
                {(question.answers || []).map((answer) => ( // Đảm bảo answers là một mảng
                  <li key={answer.id} className="flex justify-between items-center border rounded-lg p-2 bg-gray-100">
                    <span>{answer.content}</span>
                    <div className="flex space-x-2">
                      <button onClick={() => handleDeleteAnswer(question.id, answer.id)} className="text-red-500 hover:underline">Delete</button>
                      <button onClick={() => { 
                        setEditAnswerId(answer.id); 
                        setEditAnswerValue(answer.content); 
                      }} className="text-blue-500 hover:underline">Edit</button>
                    </div>
                    {editAnswerId === answer.id && (
                      <form onSubmit={(e) => { e.preventDefault(); handleUpdateAnswer(question.id, answer.id); }} className="ml-2">
                        <input
                          type="text"
                          value={editAnswerValue}
                          onChange={(e) => setEditAnswerValue(e.target.value)}
                          className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                          required
                        />
                        <button type="submit" className="bg-green-500 text-white p-2 rounded">Update</button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
              <form onSubmit={(e) => { e.preventDefault(); handleAddAnswer(question.id); }} className="mt-2 flex">
                <input
                  type="text"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Enter new answer"
                  className="border rounded p-2 mr-2 flex-grow focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                  required
                />
                <button type="submit" className="bg-[#E91E63] text-white p-2 rounded hover:bg-[#D81B60] transition">
                  Add Answer
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="text-center">No questions available.</li> // Thông báo nếu không có câu hỏi
        )}
      </ul>
    </div>
  );
};

export default StaffSkinTest;