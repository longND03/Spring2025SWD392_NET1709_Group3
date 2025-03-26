import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Divider, Accordion, AccordionSummary, AccordionDetails, Tabs, Tab, Pagination } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { Link } from 'react-router-dom';
import { getSkinTestResults } from '../utils/cookies';

const SkinRoutineBox = ({ userInfo }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skinTypes, setSkinTypes] = useState([]);
  const [userSkinTypes, setUserSkinTypes] = useState([]);
  const [skinPercentages, setSkinPercentages] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [skinTestResults, setSkinTestResults] = useState([]);
  const [skinRoutines, setSkinRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [savedRoutines, setSavedRoutines] = useState({ items: [], totalPages: 1 });
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savingRoutineId, setSavingRoutineId] = useState(null);
  const [savedPage, setSavedPage] = useState(1);

  useEffect(() => {
    // Get skin test results from cookies
    const results = getSkinTestResults();
    setSkinTestResults(results);

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

        // Fetch skincare routines after skin percentages are set
        await fetchSkinRoutines(initialPercentages);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load skin type information. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load saved routines when active tab changes to saved routines or when page changes
  useEffect(() => {
    if (activeTab === 1) {
      fetchSavedRoutines();
    }
  }, [activeTab, savedPage]);

  // Fetch saved skincare routines
  const fetchSavedRoutines = async () => {
    setLoadingSaved(true);
    try {
      const response = await axios.get(`/api/skincareroutine/saved?PageNumber=${savedPage}&PageSize=20&IsDeleted=false`);
      setSavedRoutines(response.data);
    } catch (err) {
      console.error('Error fetching saved skincare routines:', err);
      setError('Failed to load saved routines. Please try again later.');
    } finally {
      setLoadingSaved(false);
    }
  };

  // Fetch and filter skincare routines
  const fetchSkinRoutines = async (currentPercentages) => {
    setLoadingRoutines(true);
    try {
      const response = await axios.get('/api/skincareroutine?PageSize=10000&IsDeleted=false');
      const allRoutines = response.data.items;

      // Filter routines based on user's skin percentages
      const filteredRoutines = allRoutines.filter(routine => {
        // Check if user meets all skin type requirements for this routine
        return routine.skinTypes.every(skinType => {
          const userPercentage = currentPercentages[skinType.skinTypeId] || 0;
          return userPercentage >= skinType.percentage;
        });
      });

      // Sort routines by best match (most matching skin types first)
      const sortedRoutines = filteredRoutines.sort((a, b) => {
        // Calculate match score (higher is better)
        const scoreA = calculateMatchScore(a, currentPercentages);
        const scoreB = calculateMatchScore(b, currentPercentages);
        return scoreB - scoreA; // Sort descending
      });

      setSkinRoutines(sortedRoutines);
    } catch (err) {
      console.error('Error fetching skincare routines:', err);
    } finally {
      setLoadingRoutines(false);
    }
  };

  // Calculate how well a routine matches the user's skin profile
  const calculateMatchScore = (routine, userPercentages) => {
    // Base score starts at 0
    let score = 0;
    
    // Add points for each matching skin type
    routine.skinTypes.forEach(skinType => {
      const userPercentage = userPercentages[skinType.skinTypeId] || 0;
      if (userPercentage >= skinType.percentage) {
        // More points for higher percentage matches
        score += (userPercentage / skinType.percentage);
      }
    });
    
    return score;
  };

  // Save a routine to the user's saved routines
  const saveRoutine = async (routineId) => {
    setSavingRoutineId(routineId);
    try {
      await axios.post(`/api/skincareroutine/${routineId}/save`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // If we're on the saved tab, refresh the list
      if (activeTab === 1) {
        fetchSavedRoutines();
      }
    } catch (err) {
      console.error('Error saving routine:', err);
      setError('Failed to save routine. Please try again.');
    } finally {
      setSavingRoutineId(null);
    }
  };

  const handlePercentageChange = (id, value) => {
    // Ensure value is between 0-100
    const newValue = Math.min(Math.max(parseInt(value) || 0, 0), 100);
    const newPercentages = {
      ...skinPercentages,
      [id]: newValue
    };
    
    setSkinPercentages(newPercentages);
    
    // Re-filter routines immediately when percentages change
    fetchSkinRoutines(newPercentages);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveProgress(0);
    
    try {
      // Format data for individual API calls - only include skin types with non-zero percentage
      const dataToSave = Object.keys(skinPercentages)
        .filter(skinTypeId => skinPercentages[skinTypeId] > 0)
        .map(skinTypeId => ({
          skinTypeId: parseInt(skinTypeId),
          percentage: skinPercentages[skinTypeId]
        }));
      
      // Calculate total updates needed for progress
      const totalUpdates = dataToSave.length;
      let completedUpdates = 0;
      
      // Save each skin type individually
      for (const item of dataToSave) {
        try {
          await axios.post('/api/user/skin-type', item);
          completedUpdates++;
          setSaveProgress(Math.round((completedUpdates / totalUpdates) * 100));
        } catch (err) {
          console.error(`Error saving skin type ${item.skinTypeId}:`, err);
          // Continue with other skin types even if one fails
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      return true; // Return true on successful save
    } catch (err) {
      console.error('Error in save process:', err);
      setError('Failed to save your skin type information. Please try again.');
      return false; // Return false on failed save
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  const applyTestResult = async (result) => {
    if (!result.types || !result.types.length) return;
    
    // Disable inputs during application
    setIsSaving(true);
    
    try {
      // Create a new percentages object based on the test result
      const newPercentages = { ...skinPercentages };
      
      // Reset all to 0 first
      Object.keys(newPercentages).forEach(id => {
        newPercentages[id] = 0;
      });
      
      // Apply the skin type percentages from the test result
      result.types.forEach(type => {
        // Find the skinType by name in our skinTypes array
        const matchingSkinType = skinTypes.find(st => 
          st.name.toLowerCase() === type.name.toLowerCase()
        );
        
        if (matchingSkinType) {
          newPercentages[matchingSkinType.id] = type.percentage;
        }
      });
      
      // Update the state
      setSkinPercentages(newPercentages);
      
      // Re-filter routines with the new percentages
      await fetchSkinRoutines(newPercentages);
      
      // Save immediately and wait for completion
      // Use a timeout to ensure state update has completed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Format data for individual API calls - only include skin types with non-zero percentage
      const dataToSave = Object.keys(newPercentages)
        .filter(skinTypeId => newPercentages[skinTypeId] > 0)
        .map(skinTypeId => ({
          skinTypeId: parseInt(skinTypeId),
          percentage: newPercentages[skinTypeId]
        }));
      
      // Calculate total updates needed for progress
      const totalUpdates = dataToSave.length;
      let completedUpdates = 0;
      
      // Save each skin type individually
      let hasError = false;
      for (const item of dataToSave) {
        try {
          await axios.post('/api/user/skin-type', item);
          completedUpdates++;
          setSaveProgress(Math.round((completedUpdates / totalUpdates) * 100));
        } catch (err) {
          console.error(`Error saving skin type ${item.skinTypeId}:`, err);
          hasError = true;
          // Continue with other skin types even if one fails
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error applying skin test result:', err);
      setError('Failed to apply skin test result. Please try again.');
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle saved routines page change
  const handlePageChange = (event, value) => {
    setSavedPage(value);
  };

  if (loading) {
    return (
      <main className="p-4 bg-gray-50">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center mb-7">Your Skincare Routine</h1>
        <div className="bg-white shadow-lg rounded-lg p-8 flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-pink-500 font-medium">Loading skincare information...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-4 bg-gray-50">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center mb-7">Your Skincare Routine</h1>
        <div className="bg-white shadow-lg rounded-lg p-8">
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
      </main>
    );
  }

  const renderRoutineDetails = (routine) => (
    <AccordionDetails className="bg-white">
      <div className="space-y-4 pl-2">
        <h4 className="font-medium text-gray-800">Routine Steps:</h4>
        <div className="space-y-3">
          {routine.routineSteps
            .sort((a, b) => a.order - b.order)
            .map(step => (
              <div key={step.id} className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-medium">
                  {step.order}
                </div>
                <div className="ml-3">
                  <h5 className="font-medium text-gray-800">{step.title}</h5>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </AccordionDetails>
  );

  return (
    <main className="p-4 bg-gray-50">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center mb-7">Your Skincare Routine</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-8 min-h-[calc(100vh-6rem)]">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Skin Type Analysis</h2>
          <Divider />
          
          {/* Skin Test Results Accordion */}
          <Accordion className="mt-4">
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              aria-controls="skin-test-results-content"
              id="skin-test-results-header"
              className="bg-pink-50"
            >
              <h3 className="text-lg font-medium text-pink-800">
                Recommendations from Your Skin Tests
              </h3>
            </AccordionSummary>
            <AccordionDetails className="bg-pink-50/30">
              {skinTestResults && skinTestResults.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Apply skin type percentages from your previous skin test results:
                  </p>
                  
                  <div className="space-y-3">
                    {skinTestResults.map((result, index) => (
                      <div key={index} className="border border-pink-100 rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-500">
                            {result.createdAt ? formatDate(result.createdAt) : 'Unknown date'}
                          </p>
                          <button
                            onClick={() => applyTestResult(result)}
                            disabled={isSaving}
                            className={`px-3 py-1 text-white text-sm rounded transition ${
                              isSaving 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-pink-500 hover:bg-pink-600'
                            }`}
                          >
                            {isSaving ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {result.types && result.types.map((type, i) => (
                            <div key={i} className="flex items-center">
                              <span className={i === 0 ? "font-medium text-pink-700 mr-1" : "text-gray-700 mr-1"}>
                                {type.name}:
                              </span>
                              <span className={i === 0 ? "font-medium text-pink-700" : "text-gray-700"}>
                                {type.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-700 mb-4">
                    You haven't completed any skin type tests yet.
                  </p>
                  <Link to="/skin-test">
                    <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">
                      Take a Skin Type Test
                    </button>
                  </Link>
                </div>
              )}
            </AccordionDetails>
          </Accordion>
          
          <div className="space-y-4 py-2">
            <div className="mb-4">
              <p className="text-gray-700 mb-4">
                Customize your skin type percentages to receive personalized skincare recommendations.
              </p>
              
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
                      disabled={isSaving}
                    />
                    <span className="text-pink-500 font-medium ml-0.5">%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end items-center">
              {isSaving && saveProgress > 0 && (
                <div className="mr-3 flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-pink-500 h-2.5 rounded-full" 
                      style={{ width: `${saveProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{saveProgress}%</span>
                </div>
              )}
              
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
          
          {/* Skincare Routines Tabs */}
          <div className="mt-10">
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ 
                mb: 3,
                '& .MuiTab-root': { 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: '#6B7280',
                  '&.Mui-selected': { color: '#E91E63' }
                },
                '& .MuiTabs-indicator': { backgroundColor: '#E91E63' }
              }}
            >
              <Tab label="Explore Skincare Routines" />
              <Tab label="Saved Routines" />
            </Tabs>
            
            {/* Explore Routines Tab */}
            {activeTab === 0 && (
              <div>
                <h2 className="text-2xl font-semibold">Recommended Skincare Routines</h2>
                <Divider className="mb-4" />
                
                {loadingRoutines ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                    <p className="ml-3 text-pink-500 font-medium">Loading routines...</p>
                  </div>
                ) : skinRoutines.length > 0 ? (
                  <div className="space-y-4">
                    {skinRoutines.map(routine => (
                      <Accordion key={routine.id} className="border border-pink-100 rounded-lg shadow-sm">
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon className="text-pink-500" />}
                          aria-controls={`routine-${routine.id}-content`}
                          id={`routine-${routine.id}-header`}
                          className="bg-gradient-to-r from-pink-50 to-white"
                        >
                          <div className="flex-1">
                            <div className="flex justify-between items-start w-full pr-8">
                              <div>
                                <h3 className="text-lg font-medium text-gray-800">{routine.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{routine.description}</p>
                                
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                                  {routine.skinTypes.map(type => (
                                    <div key={type.skinTypeId} className="flex items-center text-xs">
                                      <span className="font-medium text-pink-700 mr-1">{type.skinTypeName}:</span>
                                      <span className="text-gray-700">{type.percentage}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveRoutine(routine.id);
                                }}
                                disabled={savingRoutineId === routine.id}
                                className={`px-3 py-1.5 text-white text-sm rounded-lg flex items-center ${
                                  savingRoutineId === routine.id
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-pink-500 hover:bg-pink-600'
                                }`}
                              >
                                <BookmarkIcon fontSize="small" className="mr-1" />
                                {savingRoutineId === routine.id ? 'Saving...' : 'Save Routine'}
                              </button>
                            </div>
                          </div>
                        </AccordionSummary>
                        {renderRoutineDetails(routine)}
                      </Accordion>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-pink-100 rounded-lg bg-pink-50/30">
                    <p className="text-gray-700">
                      No skincare routines match your current skin type profile. 
                      Adjust your skin type percentages to see recommended routines.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Saved Routines Tab */}
            {activeTab === 1 && (
              <div>
                <h2 className="text-2xl font-semibold">Your Saved Routines</h2>
                <Divider className="mb-4" />
                
                {loadingSaved ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                    <p className="ml-3 text-pink-500 font-medium">Loading your saved routines...</p>
                  </div>
                ) : savedRoutines.items.length > 0 ? (
                  <div>
                    <div className="space-y-4">
                      {savedRoutines.items.map(routine => (
                        <Accordion key={routine.id} className="border border-pink-100 rounded-lg shadow-sm">
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon className="text-pink-500" />}
                            aria-controls={`saved-routine-${routine.id}-content`}
                            id={`saved-routine-${routine.id}-header`}
                            className="bg-gradient-to-r from-pink-50 to-white"
                          >
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-800">{routine.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{routine.description}</p>
                              
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                                {routine.skinTypes.map(type => (
                                  <div key={type.skinTypeId} className="flex items-center text-xs">
                                    <span className="font-medium text-pink-700 mr-1">{type.skinTypeName}:</span>
                                    <span className="text-gray-700">{type.percentage}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </AccordionSummary>
                          {renderRoutineDetails(routine)}
                        </Accordion>
                      ))}
                    </div>
                    
                    {/* Pagination for saved routines */}
                    {savedRoutines.totalPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination
                          count={savedRoutines.totalPages}
                          page={savedPage}
                          onChange={handlePageChange}
                          variant="outlined"
                          shape="rounded"
                          sx={{
                            '& .MuiPaginationItem-root': {
                              color: '#6B7280',
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                                color: '#E91E63',
                                fontWeight: 'bold'
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(233, 30, 99, 0.1)'
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-pink-100 rounded-lg bg-pink-50/30">
                    <p className="text-gray-700 mb-4">
                      You haven't saved any skincare routines yet.
                    </p>
                    <button
                      onClick={() => setActiveTab(0)}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                    >
                      Explore Routines
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SkinRoutineBox;