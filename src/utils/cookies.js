export const setCookie = (name, value, days = 1) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const cookieExists = (name) => {
  return getCookie(name) !== null;
};

// Functions for skin test results
export const saveSkinTestResult = (result) => {
  try {
    // Get existing results
    const existingResults = getSkinTestResults();
    
    // Add timestamp to new result
    const newResult = {
      ...result,
      createdAt: new Date().toISOString()
    };

    // Helper function to get dominant type
    const getDominantType = (resultObj) => {
      if (!resultObj.types || resultObj.types.length === 0) return null;
      return resultObj.types.sort((a, b) => b.percentage - a.percentage)[0];
    };

    // Check for duplicates based on all types having the same percentages
    const isDuplicate = existingResults.some(existingResult => {
      if (!existingResult.types || existingResult.types.length !== newResult.types.length) {
        return false;
      }
      
      // Check if all types have matching percentages and names
      return newResult.types.every(newType => {
        const matchingType = existingResult.types.find(t => 
          t.name === newType.name && 
          t.percentage === newType.percentage
        );
        return !!matchingType;
      });
    });

    let updatedResults;
    if (isDuplicate) {
      // Find the duplicate
      const duplicateIndex = existingResults.findIndex(existingResult => {
        if (!existingResult.types || existingResult.types.length !== newResult.types.length) {
          return false;
        }
        
        return newResult.types.every(newType => {
          const matchingType = existingResult.types.find(t => 
            t.name === newType.name && 
            t.percentage === newType.percentage
          );
          return !!matchingType;
        });
      });
      
      // Remove the duplicate and add new result at the front
      if (duplicateIndex !== -1) {
        updatedResults = [
          newResult,
          ...existingResults.slice(0, duplicateIndex),
          ...existingResults.slice(duplicateIndex + 1)
        ];
      } else {
        updatedResults = [newResult, ...existingResults];
      }
    } else {
      // Add new result to front
      updatedResults = [newResult, ...existingResults];
    }
    
    // Keep only most recent 5 results
    updatedResults = updatedResults.slice(0, 5);
    
    // Save to cookie with 24h expiration
    setCookie('skinTestResults', JSON.stringify(updatedResults), 1);
    
    return updatedResults;
  } catch (error) {
    console.error('Error saving skin test results:', error);
    return [];
  }
};

export const getSkinTestResults = () => {
  try {
    const results = getCookie('skinTestResults');
    return results ? JSON.parse(results) : [];
  } catch (error) {
    console.error('Error getting skin test results:', error);
    return [];
  }
};

const cookieUtils = {
  setCookie,
  getCookie,
  deleteCookie,
  cookieExists,
  saveSkinTestResult,
  getSkinTestResults
};

export default cookieUtils; 