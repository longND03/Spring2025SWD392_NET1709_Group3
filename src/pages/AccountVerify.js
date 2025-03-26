import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import messages from '../constants/message.json';

const AccountVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  
  const { verifyEmail } = useAuth();
  
  // Get email from location state or use empty string as fallback
  const email = location.state?.email || '';
  
  // If no email is provided, show a message and redirect to login
  useEffect(() => {
    if (!email) {
      toast.error(messages.error.accountVerification.emailRequired);
      navigate('/login');
    }
  }, [email, navigate]);
  
  // Create refs for the individual digit inputs
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Focus the first input when component mounts
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleDigitChange = (index, e) => {
    const value = e.target.value;
    
    // Only allow single numeric value
    const digit = value.replace(/\D/g, '').slice(-1);
    
    // Update the verification code
    const newVerificationCode = verificationCode.split('');
    newVerificationCode[index] = digit;
    setVerificationCode(newVerificationCode.join(''));
    
    // If a digit was entered and there's a next input, focus it
    if (digit && index < 5) {
      inputRefs[index + 1].current.focus();
    }
    
    // Clear error when typing
    if (error) setError('');
  };
  
  // Handle paste event for any input
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Extract only digits from pasted data
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length > 0) {
      // Create a new verification code with the pasted digits
      const newCode = digits.padEnd(6, '').slice(0, 6);
      setVerificationCode(newCode);
      
      // Focus the appropriate input box based on the number of digits pasted
      const focusIndex = Math.min(digits.length, 5);
      if (focusIndex < 6) {
        inputRefs[focusIndex].current.focus();
      }
      
      // Clear error when pasting
      if (error) setError('');
    }
  };
  
  // Handle backspace key to navigate to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && !verificationCode[index]) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate code length
    if (verificationCode.length !== 6) {
      setError(messages.validation.required.verificationCode);
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, verificationCode);
      // If verification successful, show success message
      setVerified(true);
      toast.success(messages.success.accountVerified);
    } catch (err) {
      console.error('Verification error:', err);
      setError(messages.error.accountVerification.invalidCode);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1B2028] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#2A303C] p-8 rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Registration Successful!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Your account has been verified successfully. You can now log in.
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Link to="/login">
              <button
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium 
                       rounded-lg text-white bg-[#E91E63] hover:bg-pink-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 
                       transition-colors duration-200"
              >
                Go to Login
              </button>
            </Link>
            <Link to="/">
              <button
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 text-sm font-medium 
                       rounded-lg text-gray-700 dark:text-white bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 
                       transition-colors duration-200"
              >
                Return to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1B2028] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#2A303C] p-8 rounded-2xl shadow-lg">
        <div>
          <Link to="/" className="flex justify-center">
            <span className="text-3xl font-bold text-[#E91E63] hover:text-pink-400 transition-colors duration-200">
              Diana Shop
            </span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification code to your email.
            <br />Please enter the 6-digit code below.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Verification Code
            </label>
            
            <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength="1"
                  value={verificationCode[index] || ''}
                  onChange={(e) => handleDigitChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-md 
                           text-gray-900 dark:text-white bg-white dark:bg-[#1B2028] 
                           text-center text-xl font-mono
                           focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:border-transparent"
                  required
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium 
                     rounded-lg text-white bg-[#E91E63] hover:bg-pink-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 
                     transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountVerify; 