const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'azure-mysql-swd.mysql.database.azure.com',
  user: 'azureadmin', // Thay thế bằng tên người dùng MySQL của bạn
  password: 'Admin123456', // Thay thế bằng mật khẩu MySQL của bạn
  database: 'test' // Thay thế bằng tên cơ sở dữ liệu của bạn
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = db;