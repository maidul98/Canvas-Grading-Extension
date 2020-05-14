var mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'be9696052936bb',
    password: '4f1c4dfa',
    database: 'heroku_aff64052225438d',
    multipleStatements: true

});
module.exports = pool;