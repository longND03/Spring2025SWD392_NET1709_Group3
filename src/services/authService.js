const db = require('./db');
const bcrypt = require('bcrypt');

const signup = async (email, password, name, role = 'user') => {
  console.log('Signup called with:', { email, password, name });

  // Kiểm tra xem email đã tồn tại chưa
  const existingUser = await new Promise((resolve, reject) => {
    db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Lưu người dùng vào cơ sở dữ liệu với vai trò
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO user (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        return reject(err);
      }
      resolve(results);
    });
  });
};

const login = async (email, password) => {
  const user = await new Promise((resolve, reject) => {
    db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid password');
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role }; // Trả về thông tin người dùng bao gồm vai trò
};

module.exports = { signup, login };