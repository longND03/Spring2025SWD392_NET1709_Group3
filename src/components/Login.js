import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError('Failed to login');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full mb-4 p-2 border rounded"
      />
      <div className="text-right mb-4">
        <Link 
          to="/forgot-password"
          className="text-blue-500 hover:text-blue-600"
        >
          Forgot your password?
        </Link>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E91E63] text-white p-2 rounded"
      >
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
};

export default Login; 