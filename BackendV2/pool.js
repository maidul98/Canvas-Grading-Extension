var mysql = require('mysql');

const pool = mysql.createPool({
    host: "us-cdbr-iron-east-04.cleardb.net",
    user: "be9696052936bb",
    password: "4f1c4dfa",
    database: "heroku_aff64052225438d",
});
// trying to fix my github issue 
module.exports = pool;