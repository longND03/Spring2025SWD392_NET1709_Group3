const jwt = require('jsonwebtoken'); // Nếu bạn sử dụng JWT

const authorize = (roles = []) => {
  return (req, res, next) => {
    // Lấy token từ header
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Access denied.');

    // Xác thực token
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) return res.status(403).send('Invalid token.');

      // Kiểm tra vai trò
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).send('Access denied.');
      }

      req.user = decoded; // Lưu thông tin người dùng vào req
      next();
    });
  };
};

module.exports = authorize; 