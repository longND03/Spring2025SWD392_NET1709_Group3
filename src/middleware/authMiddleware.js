const jwt = require('jsonwebtoken'); // Nếu bạn sử dụng JWT

const authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const token = authHeader.split(' ')[1];

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
          });
        }

        // Kiểm tra role nếu được yêu cầu
        if (roles.length && (!decoded.role || !roles.includes(decoded.role))) {
          return res.status(403).json({
            success: false,
            message: 'Unauthorized access'
          });
        }

        // Thêm thông tin user vào request
        req.user = decoded;
        next();
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  };
};

module.exports = authorize; 