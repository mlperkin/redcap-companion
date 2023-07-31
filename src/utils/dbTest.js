const mysql = require('mysql2');
const { Client } = require('pg');
// Function to test the MySQL database connection
async function testMySQLConnection(dbConfig) {
  const connection = mysql.createConnection({
    host: dbConfig.hostname,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: 'mysql', // Replace with your target database name (e.g., the database you want to test the connection to)
  });

  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL database:', err);
        reject(err); // Reject the promise with the error
      } else {
        console.log('Successfully connected to MySQL database');
        resolve(true); // Resolve the promise with the connection result
      }
    });

    // Remove the following line to keep the connection open until the promise is resolved or rejected
    connection.end();
  });
}

async function testPostgreSQLConnection(dbConfig) {
  const client = new Client({
    host: dbConfig.hostname,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: 'postgres', // Replace with your target database name (e.g., the database you want to test the connection to)
  });

  try {
    await client.connect();
    console.log('Successfully connected to PostgreSQL database');
    return true;
  } catch (err) {
    console.error('Error connecting to PostgreSQL database:', err);
    return false;
  } finally {
    await client.end();
  }
}

module.exports = {
  testMySQLConnection,
  testPostgreSQLConnection
};
