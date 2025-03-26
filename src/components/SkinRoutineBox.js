import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const SkinRoutineBox = ({ userInfo }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skinTypes, setSkinTypes] = useState([]);
  const [userSkinTypes, setUserSkinTypes] = useState([]);
  const [skinPercentages, setSkinPercentages] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all skin types
        const skinTypesResponse = await axios.get('/api/skintype?IsDeleted=false');
        const allSkinTypes = skinTypesResponse.data.items;
        setSkinTypes(allSkinTypes);

        // Fetch user's skin type percentages
        const userSkinResponse = await axios.get('/api/user/skin-type');
        const userSkinData = userSkinResponse.data;
        setUserSkinTypes(userSkinData);

        // Initialize percentages with user data or defaults
        const initialPercentages = {};
        allSkinTypes.forEach(skinType => {
          const userSkinType = userSkinData.find(item => item.skinTypeId === skinType.id);
          initialPercentages[skinType.id] = userSkinType ? userSkinType.percentage : 0;
        });
        setSkinPercentages(initialPercentages);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load skin type information. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePercentageChange = (id, value) => {
    // Ensure value is between 0-100
    const newValue = Math.min(Math.max(parseInt(value) || 0, 0), 100);
    setSkinPercentages(prev => ({
      ...prev,
      [id]: newValue
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Format data for the API
      const dataToSave = Object.keys(skinPercentages).map(skinTypeId => ({
        skinTypeId: parseInt(skinTypeId),
        percentage: skinPercentages[skinTypeId]
      }));
      
      await axios.post('/api/user/skin-type', dataToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving skin type data:', err);
      setError('Failed to save your skin type information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-pink-500 font-medium">Loading skincare information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-pink-500 mb-4">Your Skincare Routine</h2>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg border border-red-200">
          <p className="font-medium">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition duration-200 ease-in-out transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center mb-5">Your Skincare Routine</h2>
   
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Select your skin type</h3>
        
        <div className="flex flex-wrap gap-2">
          {skinTypes.map(skinType => (
            <div key={skinType.id} className="border border-pink-200 rounded-lg px-3 py-2 flex items-center hover:shadow-sm transition">
              <span className="text-gray-800 mr-2">{skinType.name}</span>
              <input
                type="number"
                min="0"
                max="100"
                value={skinPercentages[skinType.id] || 0}
                onChange={(e) => handlePercentageChange(skinType.id, e.target.value)}
                className="w-14 text-right border border-pink-100 rounded px-1 py-0.5 text-sm"
              />
              <span className="text-pink-500 font-medium ml-0.5">%</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          {saveSuccess && (
            <div className="mr-3 bg-green-100 text-green-700 px-3 py-1.5 rounded text-sm">
              Saved successfully!
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 text-sm rounded-lg font-medium transition ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkinRoutineBox;