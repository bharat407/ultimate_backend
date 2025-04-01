var mysql = require("mysql");

var pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  password: "1234",
  user: "root",
  database: "garments",
  connectionLimit: 100,
});

module.exports = pool;
