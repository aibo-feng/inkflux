  # Our API Documentation
  Our API gives information about both the users that are using the website along with the
  information about the products that can be bought

  ## Get a list of all products in this service.
  **Request Format:** /all-products

  **Request Type:** GET

  **Returned Data Format**: JSON

  **Description:** Return a list of all of the products that you can look up in this API.

**Example Request:** /inkflux/products

**Example Response:**
```json
[
  {
    "name": "Calculus: Early Transcendentals",
    "subject": "math",
    "pages": 881,
    "isbn": "978-1-234567-89-0",
    "description": "A comprehensive calculus textbook covering topics like limits, derivatives, and integrals.",
    "author": "James Stewart",
    "price": 90,
    "amount_in_stock": 69
  },
  {
    "name": "Linear Algebra and Its Applications",
    "subject": "math",
    "pages": 613,
    "isbn": "978-2-345678-90-1",
    "description": "This textbook explores the fundamentals of linear algebra, including matrices, vector spaces, and linear transformations.",
    "author": "David C. Lay",
    "price": 75,
    "amount_in_stock": 35
  },
  {
    "name": "Discrete Mathematics and Its Applications",
    "subject": "math",
    "pages": 573,
    "isbn": "978-3-456789-01-2",
    "description": "An introduction to discrete mathematics, covering topics such as logic, sets, combinatorics, and graph theory.",
    "author": "Kenneth H. Rosen",
    "price": 60,
    "amount_in_stock": 85
  },
  ...
]
```

  **Error Handling:**
  - N/A

  ## Lookup a Products's Information
  **Request Format:** /:product

  **Request Type:** GET

  **Returned Data Format**: JSON

  **Description:** Given a valid product name, it returns a JSON of the basic product information. A
  valid product name does not contain any spaces or capitalized letters.

  **Example Request:** /lawnmower

  **Example Response:**
  ```json
  {
      "name": "Lawn Mower",
      "price": "100.00",
      "img": "https://m.media-amazon.com/images/I/71cTi4JENtS._AC_SX466_.jpg",
      "colors": ["blue", "green", "red"],
      "description": "Some long description of a lawnmower including its strength"
  }
  ```

  **Error Handling:**
  - Possible 400 (invalid request) errors (all plain text):
    - If passed in an invalid product name, returns an error with the message: `Given name {name} is not a valid product`
  - Possible 500 errors (all plain text):
    - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

  ## Login or Sign up for the website
  **Request Format:** /login/:isLogin endpoint with POST parameters of `username` and `password` and (if signing up) `confirmpassword`

  **Request Type**: POST

  **Returned Data Format**: Plain Text

  **Description:** Given a valid `username` and `password`, the API will return whether or not
  the user successfully logged/signed in. Login or Signed in is determined by a boolean isLogin

  **Example Request:** /login/true with POST parameters of `username=someusername` and `password=mypassword123`

  **Example Response:**
  ```
  Successfully logged in
  ```

  **Error Handling:**
  - Possible 400 (invalid request) errors (all plain text):
    - If missing username, an error is returned with the message: `Please pass in a username`
    - If passed in an invalid username/password combination, an error is returned with: `Either username or password is incorrect`
    - If username already exists in database when signing in: `username {username} is already taken, please use another username`
    - If password and confirmpassword are not the same: `password and confirm password are not the same, please try again`
  - Possible 500 errors (all plain text):
    - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`
