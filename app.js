'use strict';

const express = require('express');
const app = express();

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const multer = require('multer');

const SERVER_ERROR = 500;
const BAD_REQUEST = 400;

const DEFAULT_PORT = 8000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

app.get('/inkflux/products', async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM items";
    let query = "";

    if (req.query.price !== undefined) {
      query = req.query.price;
      sqlQuery += " WHERE price = ?";
    } else if (req.query.subject !== undefined) {
      query = req.query.subject;
      sqlQuery += " WHERE subject = ?";
    } else if (req.query.author !== undefined) {
      query = req.query.author;
      sqlQuery += " WHERE author = ?";
    } else if (req.query.isbn !== undefined) {
      query = req.query.isbn;
      sqlQuery += " WHERE isbn = ?";
    } else {
      sqlQuery += "";
    }

    const db = await getDBConnection();
    let allProducts = await db.all(sqlQuery, query);
    await db.close();
    res.json(allProducts);

  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

/**
* Establishes a database connection to the database and returns the database object.
* Any errors that occur should be caught in the function that calls this one.
* @returns {Object} - The database object for the connection.
*/
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'tables.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);