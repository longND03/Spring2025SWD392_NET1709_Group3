import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  console.log('User:', user); // Kiểm tra thông tin người dùng

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Kiểm tra nếu requiredRole là một mảng và nếu vai trò của người dùng có trong đó
  const hasAccess = Array.isArray(requiredRole)
    ? requiredRole.some(role => user.role?.some(userRole => userRole.roleName === role))
    : user.role?.some(userRole => userRole.roleName === requiredRole);

  if (!hasAccess) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute; 