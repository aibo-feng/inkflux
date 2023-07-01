'use strict';

const express = require('express');
const app = express();

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const multer = require('multer');

const SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const OK = 200;

const DEFAULT_PORT = 8000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

app.get('/inkflux/products', async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM items";
    let query;
    let prevQuery = false;

    if (req.query.name) {
      query = "%" + req.query.name + "%";
      sqlQuery += " WHERE name LIKE ?";
      prevQuery = true;
    }

    if (req.query.price) {
      sqlQuery += prevQuery ? " AND " : " WHERE ";
      query = "%" + req.query.price + "%";
      sqlQuery += "price LIKE ?";
      prevQuery = true;
    }

    if (req.query.subject) {
      sqlQuery += prevQuery ? " AND " : " WHERE ";
      query = req.query.subject.toLowerCase();
      sqlQuery += "subject = ?";
      prevQuery = true;
    }

    if (req.query.author) {
      sqlQuery += prevQuery ? " AND " : " WHERE ";
      query = "%" + req.query.author + "%";
      sqlQuery += "author LIKE ?";
      prevQuery = true;
    }

    if (req.query.isbn) {
      sqlQuery += prevQuery ? " AND " : " WHERE ";
      query = "%" + req.query.isbn + "%";
      sqlQuery += "isbn LIKE ?";
      prevQuery = true;
    }

    const db = await getDBConnection();
    let allProducts;
    if (query !== undefined) {
      allProducts = await db.all(sqlQuery, query);
    } else {
      allProducts = await db.all(sqlQuery);
    }

    await db.close();
    res.json(allProducts);

  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

app.get('/inkflux/login', async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;

    let userCheck = "SELECT * FROM users WHERE username = ?";
    let loginQuery = "SELECT * FROM users WHERE username = ? AND password = ?";

    const db = await getDBConnection();

    let isUser = await db.all(userCheck, username);

    if (isUser.length <= 0) {
      await db.close();
      res.status(BAD_REQUEST);
      res.type('text').send('User does not exist.');
    } else {
      let user = await db.all(loginQuery, username, password);
      await db.close();

      if (user.length <= 0) {
        res.status(BAD_REQUEST);
        res.type('text').send('Password is incorrect.');
      } else {
        res.status(OK);
        res.type('text').send('success');
      }
    }
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

app.post('/inkflux/signup', async (req, res) => {
  try {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;

    let userCheck = "SELECT * FROM users WHERE username = ?";
    let emailCheck = "SELECT * FROM users WHERE email = ?";
    let insertQuery = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";

    const db = await getDBConnection();
    let isUser = await db.all(userCheck, username);
    let isEmail = await db.all(emailCheck, email);

    if (isEmail.length > 0) {
      await db.close();
      res.status(BAD_REQUEST);
      res.type('text').send('Email already exists.');
    } else if (isUser.length > 0) {
      await db.close();
      res.status(BAD_REQUEST);
      res.type('text').send('Username already exists.');
    } else {
      await db.run(insertQuery, email, username, password);
      await db.close();
      res.status(OK);
      res.type('text').send('success');
    }

  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

app.get('/inkflux/getcart/:username', async (req, res) => {
  try {
    let username = req.params.username;
    let userCheck = "SELECT * FROM users WHERE username = ?";
    let cartQuery = "SELECT c.isbn, i.name, i.price " +
      "FROM cart c, items i " +
      "WHERE c.isbn = i.isbn AND username = ?";

    const db = await getDBConnection();

    let isUser = await db.all(userCheck, username);

    if (isUser.length <= 0) {
      await db.close();
      res.status(BAD_REQUEST);
      res.type('text').send('User does not exist.');
    } else {
      let cart = await db.all(cartQuery, username);
      await db.close();
      res.json(cart);
    }

  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

app.post('/inkflux/buy', async (req, res) => {
  try {
    let username = req.body.username;
    let ISBNArray = req.body.ISBNArray;

    if (ISBNArray.length <= 0) {
      res.status(BAD_REQUEST);
      res.type('text').send('No items in cart.');
    } else {
      const db = await getDBConnection();

      let confirmationNumber = Math.floor(Math.random() * 1000000000);
      let confirmationCheck = "SELECT * FROM transactions WHERE confirmation_number = ?";
      while (db.all(confirmationCheck, confirmationNumber).length > 0) {
        confirmationNumber = Math.floor(Math.random() * 1000000000);
      }

      let userCheck = "SELECT * FROM users WHERE username = ?";
      let isUser = await db.all(userCheck, username);

      if (isUser.length <= 0) {
        await db.close();
        res.status(BAD_REQUEST);
        res.type('text').send('User does not exist.');
      } else {
        for (let i = 0; i < ISBNArray.length; i++) {
          let isbn = ISBNArray[i];

          let itemCheck = "SELECT * FROM items WHERE isbn = ?";
          let isItem = await db.all(itemCheck, isbn);
          if (isItem.length <= 0) {
            await db.close();
            res.status(BAD_REQUEST);
            res.type('text').send('Item does not exist.');
          } else {
            let insertQuery = "INSERT INTO transactions (confirmation_number, isbn, username) " +
              "VALUES (?, ?, ?)";
            await db.run(insertQuery, confirmationNumber, isbn, username);
            await db.run("DELETE FROM cart WHERE username = ?", username);
            let updateQuery = "UPDATE items SET amount_in_stock = amount_in_stock - 1 " +
              "WHERE isbn = ?";
            await db.run(updateQuery, isbn);
          }
        }
      }
      await db.close();
      res.status(OK);
      res.type('text').send(confirmationNumber.toString());
    }
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

app.post('/inkflux/addcart/', async (req, res) => {
  try {
    let username = req.body.username;
    let isbn = req.body.isbn.toString();

    const db = await getDBConnection();

    let userCheck = "SELECT * FROM users WHERE username = ?";
    let itemCheck = "SELECT * FROM items WHERE isbn = ?";
    let cartCheck = "SELECT * FROM cart WHERE username = ? AND isbn = ?";
    let isUser = await db.all(userCheck, username);
    let isItem = await db.all(itemCheck, isbn);
    let isCart = await db.all(cartCheck, username, isbn);

    if (isUser.length <= 0) {
      await db.close();
      res.status(BAD_REQUEST);
      res.type('text').send('User does not exist.');
    } else if (isItem.length <= 0) {
      await db.close();
      res.status(BAD_REQUEST);
      res.type('text').send('Item does not exist.');
    } else if (isCart.length > 0) {
      await db.close();
      res.status(BAD_REQUEST);
      res.type('text').send('Item already in cart.');
    } else {
      let insertQuery = "INSERT INTO cart (username, isbn) VALUES (?, ?)";
      await db.run(insertQuery, username, isbn);
      await db.close();
      res.status(OK);
      res.type('text').send('success');
    }
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

app.get('/inkflux/gethistory/:username', async (req, res) => {
  try {
    let username = req.params.username;
    const db = await getDBConnection();

    let userCheck = "SELECT * FROM users WHERE username = ?";
    let isUser = await db.all(userCheck, username);

    if (isUser.length <= 0) {
      await db.close();
      res.status(BAD_REQUEST);
      res.type('text').send('User does not exist.');
    } else {
      let historyQuery = "SELECT confirmation_number, isbn FROM transactions" +
        " WHERE username = ?";
      let history = await db.all(historyQuery, username);
      await db.close();
      res.json(history);
    }
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