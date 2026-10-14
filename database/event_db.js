// ============================================================
// database/event_db.js
// PROG2002 A2 - MySQL connection module
//
// 1) Install the driver first:  npm install mysql2
// 2) Update the password below to match your local MySQL.
// 3) Test the connection:       node database/event_db.js
//    Expected output: Database connection OK. Events in table: 10
// ============================================================

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',           // TODO: put your MySQL root password here
    database: 'charityevents_db',
    waitForConnections: true,
    connectionLimit: 10
});

// Promise-based query helper used by the API (server.js)
module.exports = {
    query(sql, params) {
        return pool.promise().query(sql, params);
    },
    // Close all connections (used only when shutting down)
    end() {
        return pool.end();
    }
};

// When this file is run directly (node event_db.js), test the connection
if (require.main === module) {
    (async () => {
        try {
            const [rows] = await module.exports.query(
                'SELECT COUNT(*) AS total FROM events'
            );
            console.log('Database connection OK. Events in table:', rows[0].total);
        } catch (err) {
            console.error('Database connection FAILED:', err.message);
            console.error('Hint: is MySQL running? Is the database created? Is the password correct?');
        } finally {
            module.exports.end();
        }
    })();
}
//（注：内容由AI生成）
