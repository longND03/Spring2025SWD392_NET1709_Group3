import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SkinRoutineBox = ({ userInfo }) => {
  const [selectedSkinType, setSelectedSkinType] = useState(userInfo?.skinType || '');
  const [skinTypes, setSkinTypes] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('morning');

  // Fetch skin types from API
  useEffect(() => {
    const fetchSkinTypes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5296/api/skintype');
        setSkinTypes(response.data.items || []);
      } catch (err) {
        console.error('Error fetching skin types:', err);
        setError('Failed to load skin types. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSkinTypes();
  }, []);

  // Fetch routines from API
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5296/api/skincareroutine');
        setRoutines(response.data.items || []);
      } catch (err) {
        console.error('Error fetching routines:', err);
        setError('Failed to load skincare routines. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  // Function to handle skin type selection
  const handleSkinTypeSelect = (skinTypeId) => {
    setSelectedSkinType(skinTypeId);
  };

  // Filter routines by skin type
  const getRoutinesBySkinType = (skinTypeId) => {
    return routines.filter(routine => 
      routine.skinTypes && routine.skinTypes.includes(skinTypeId)
    );
  };

  // Group routines by morning/evening
  const getMorningRoutines = () => {
    return getRoutinesBySkinType(selectedSkinType)
      .filter(routine => routine.name && routine.name.toLowerCase().includes('morning'));
  };

  const getEveningRoutines = () => {
    return getRoutinesBySkinType(selectedSkinType)
      .filter(routine => routine.name && routine.name.toLowerCase().includes('evening'));
  };

  // Sort routine steps by order
  const getSortedSteps = (routine) => {
    if (!routine || !routine.routineSteps) return [];
    return [...routine.routineSteps].sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-pink-500 font-medium">Đang tải thông tin chăm sóc da...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-pink-500 mb-4">Quy trình chăm sóc da của bạn</h2>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg border border-red-200">
          <p className="font-medium">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition duration-200 ease-in-out transform hover:scale-105"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center mb-7">Quy trình chăm sóc da của bạn</h2>
      
      {!selectedSkinType ? (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-700">Chọn loại da của bạn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skinTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSkinTypeSelect(type.name)}
                className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-200 hover:to-pink-300 border border-pink-200 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-md"
              >
                <span className="block text-lg font-medium text-pink-600">{type.name}</span>
                <span className="block text-sm mt-2 text-gray-600">{type.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-pink-100">
            <h3 className="text-xl font-semibold text-gray-700">
              <span className="mr-2">Quy trình cho da</span>
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">{selectedSkinType}</span>
            </h3>
            <button 
              onClick={() => setSelectedSkinType('')}
              className="mt-2 md:mt-0 text-pink-500 border border-pink-300 hover:bg-pink-50 rounded-lg px-4 py-2 transition duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Thay đổi loại da
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-3 px-6 font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === 'morning'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('morning')}
              >
                Buổi sáng
              </button>
              <button
                className={`py-3 px-6 font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === 'evening'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('evening')}
              >
                Buổi tối
              </button>
            </div>
          </div>

          {activeTab === 'morning' && (
            <div className="mt-6">
              {getMorningRoutines().length > 0 ? (
                getMorningRoutines().map(routine => (
                  <div key={routine.id} className="mb-8">
                    <div className="bg-pink-50 p-5 rounded-lg mb-6">
                      <h4 className="text-xl font-semibold text-pink-600">{routine.name}</h4>
                      <p className="text-gray-600 mt-2">{routine.description}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {getSortedSteps(routine).map((step, index) => (
                        <div key={step.id} className="bg-white p-5 rounded-lg border border-pink-100 hover:shadow-md transition duration-300 flex">
                          <div className="mr-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-lg font-semibold text-gray-800">{step.title}</h5>
                            <p className="text-gray-600 mt-1">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-pink-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <p className="mt-4 text-gray-600">Không tìm thấy quy trình buổi sáng cho da {selectedSkinType}.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evening' && (
            <div className="mt-6">
              {getEveningRoutines().length > 0 ? (
                getEveningRoutines().map(routine => (
                  <div key={routine.id} className="mb-8">
                    <div className="bg-purple-50 p-5 rounded-lg mb-6">
                      <h4 className="text-xl font-semibold text-purple-600">{routine.name}</h4>
                      <p className="text-gray-600 mt-2">{routine.description}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {getSortedSteps(routine).map((step, index) => (
                        <div key={step.id} className="bg-white p-5 rounded-lg border border-purple-100 hover:shadow-md transition duration-300 flex">
                          <div className="mr-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-lg font-semibold text-gray-800">{step.title}</h5>
                            <p className="text-gray-600 mt-1">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-purple-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <p className="mt-4 text-gray-600">Không tìm thấy quy trình buổi tối cho da {selectedSkinType}.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkinRoutineBox;