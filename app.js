'use strict';

const express = require('express');
const app = express();

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const multer = require('multer');
const crypto = require('crypto');

const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

require('dotenv').config();

const SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const OK = 200;

const DEFAULT_PORT = 8000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({
      db: 'sessions.db',
      tableName: 'sessions',
    }),
    cookie: {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  })
);

app.get('/inkflux/products', async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM items";
    let query = [];
    let prevQuery = false;

    if (req.query.name) {
      query.push("%" + req.query.name + "%");
      sqlQuery += " WHERE name LIKE ?";
      prevQuery = true;
    }

    if (req.query.price) {
      sqlQuery += prevQuery ? " AND " : " WHERE ";
      query.push(req.query.price);
      sqlQuery += "price < ?";
      prevQuery = true;
    }

    if (req.query.subject) {
      sqlQuery += prevQuery ? " AND " : " WHERE ";
      let subjectParams = req.query.subject;

      if (Array.isArray(subjectParams) && subjectParams.length > 1) {
        sqlQuery += "(";
        let notFirst = false;
        for (const subject of subjectParams) {
          sqlQuery = addSubjectQuery(subject, sqlQuery, query, notFirst);
          notFirst = true;
        }
        sqlQuery += ")";
      } else {
        sqlQuery = addSubjectQuery(subjectParams, sqlQuery, query, false);
      }
      prevQuery = true;
    }

    if (req.query.author) {
      sqlQuery += prevQuery ? " AND " : " WHERE ";
      query.push("%" + req.query.author + "%");
      sqlQuery += "author LIKE ?";
      prevQuery = true;
    }

    if (req.query.isbn) {
      sqlQuery += prevQuery ? " AND " : " WHERE ";
      query.push("%" + req.query.isbn + "%");
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

function addSubjectQuery(subject, queryStatement, queryArray, notFirst) {
  if (notFirst) {
    queryStatement += " OR ";
  }
  queryStatement += "subject = ?";
  queryArray.push(subject.toLowerCase());
  return queryStatement;
}

app.post('/inkflux/login', async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;

    let userCheck = "SELECT * FROM users WHERE username = ?";

    const db = await getDBConnection();

    let user = await db.get(userCheck, username);

    if (user) {
      const hashedPassword = hashPassword(password, user.salt);

      if (hashedPassword === user.password) {

        req.session.uuid = user.uuid;
        req.session.username = user.username;
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session:', err);
            res.status(SERVER_ERROR).send('An error occurred while saving the session.');
          } else {
            res.redirect('/inkflux/account');
          }
        });
      } else {
        res.status(BAD_REQUEST);
        res.type('text').send('Invalid username or password');
      }

    } else {
      await db.close();
      res.status(BAD_REQUEST);
      res.type('text').send('User does not exist.');
    }

  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

app.post('/inkflux/signup', async (req, res) => {
  try {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    if (!email || !username || !password) {
      res.status(BAD_REQUEST);
      res.type('text').send('Missing required fields.');

    } else {

      let userCheck = "SELECT * FROM users WHERE username = ?";
      let emailCheck = "SELECT * FROM users WHERE email = ?";

      const db = await getDBConnection();
      let userExists = await db.get(userCheck, username);
      let emailExists = await db.get(emailCheck, email);

      if (emailExists) {
        await db.close();
        res.status(BAD_REQUEST);
        res.type('text').send('Email already exists.');

      } else if (userExists) {
        await db.close();
        res.status(BAD_REQUEST);
        res.type('text').send('Username already exists.');

      } else {

        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = hashPassword(password, salt);

        let uuid = crypto.randomUUID();
        let checkUUID = "SELECT * FROM users WHERE uuid = ?";
        while (await db.get(checkUUID, uuid)) {
          uuid = crypto.randomUUID();
        }

        let insertQuery = "INSERT INTO users (uuid, email, username, password, salt) VALUES (?, ?, ?, ?, ?)";
        await db.run(insertQuery, uuid, email, username, hashedPassword, salt);
        await db.close();

        res.status(OK);
        res.type('text').send(username);
      }
    }

  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

// Function to hash the password with the salt
function hashPassword(password, salt) {
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return hashedPassword;
}

app.get('/inkflux/account', async (req, res) => {
  try {
    if (req.session.uuid) {
      const uuid = req.session.uuid;
      const username = req.session.username;

      const getCartInfo = "SELECT * FROM cart c, items i WHERE c.isbn = i.isbn AND c.uuid = ?";
      const getTransactionInfo = "SELECT * FROM transactions WHERE uuid = ?";

      const db = await getDBConnection();

      const cartInfo = await db.all(getCartInfo, uuid);
      const transactionInfo = await db.all(getTransactionInfo, uuid);

      await db.close();

      const infoJson = {
        username: username,
        cart: cartInfo,
        transactions: transactionInfo
      };

      res.status(OK);
      res.json(infoJson);

    } else {
      res.status(OK);
      res.json(null);
    }
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR);
    res.type('text').send('An error occurred on the server. Try again later.');
  }
});

app.get('/inkflux/logout', (req, res) => {
  // Clear the session data
  req.session.destroy((err) => {
    if (err) {
      res.status(SERVER_ERROR)
      res.type('text').send('An error occurred while logging out.');
    } else {
      res.status(OK);
      res.type('text').send('Logged out successfully.');
    }
  });
});

app.get('/inkflux/getcart/', async (req, res) => {
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