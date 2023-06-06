'use strict';

const express = require('express');
const app = express();

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const multer = require('multer');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(multer().none());

app.get('/helloworld', async (req, res) => {
  try {
    let query = "SELECT * FROM staff WHERE id > 123";
    // access the db
    let db = await getDBConnection();
    // query for data
    let results = await db.get(query);
    console.log(results);
    if (results) { } else { }
    await db.close();
    res.json(results);
  } catch (err) {
    // status code
    res.status(500);
    res.type('text').send('something went wrong');
  }
});

app.post('/post', async (req, res) => {
  try {
    let name = req.body.name;
    // let age = req.body.age;
    // add data to the database
    let db = await getDBConnection();
    let allResult = "SELECT * FROM staff";
    let allRows = await db.all(allResult);
    console.log(allRows);
    let query = "INSERT INTO staff (name, age) VALUES (?, ?)";
    console.log(query);
    await db.run(query, [name, age]);
    let allResult2 = "SELECT * FROM staff";
    let allRows2 = await db.all(allResult2);
    console.log(allRows2);
    await db.close();
    res.type('text').send('success');
  } catch (err) {
    console.log(err);
    res.status(500);
    res.type('text').send('something went wrong');
  }
});

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'cse154roster.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);