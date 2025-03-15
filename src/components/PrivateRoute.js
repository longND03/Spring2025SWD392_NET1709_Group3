import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  console.log('User:', user); // Kiểm tra thông tin người dùng

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role?.[0]?.roleName !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute; 