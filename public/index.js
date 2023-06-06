/*
 * Name: Alexander Yuan
 * Date: April 20, 2023
 * Section: AF (Donovan & Sonia)
 *
 * This is the JS to implement the interactivity of my Prototype Pokedex. Allows for the
 * searching of pokemon. It grabs the sprites of pokemon. It displays the pokemon from
 * given regeions.
 */

"use strict";

(function() {
  let prevPage = "search";
  let prevLoginSignUp = "login";
  let prevViewOption = "cozy";
  let currUser = "";
  let PRODUCTS = "/inkflux/products";
  let LOGIN = "/inkflux/login";
  let SIGNUP = "/inkflux/signup";
  let CART = "/influx/getcart/";
  let PURCHASE = "/inkflux/buy"

  window.addEventListener("load",init);

  /**
   *
   */
  async function init() {
    await showAllProducts();
    id("search-btn").addEventListener("click", search)
    id("cart").addEventListener("click", displayCart);
    id("user-profile").addEventListener("click", function() {
      showPage("user");
    });
    id("transaction-history").addEventListener("click", function() {
      showPage("history");
    })
    id("back-btn").addEventListener("click", function() {
      showPage("search");
    });
    id("check-out").addEventListener("click", buySelected);
    id("check-out-all").addEventListener("click", buyAll);
    qs("#login button").addEventListener("click", login);
    qs("#signup button").addEventListener("click", signup);

    let loginRadioArray = qsa("#options input");
    loginRadioArray.forEach(function(button) {
      button.addEventListener("change", showLoginOrSignUp);
    });

    let viewRadioArray = qsa("#search input");
    viewRadioArray.forEach(function(button) {
      button.addEventListener("change", changeProductView);
    });
  }

  async function displayCart() {
    showPage("check-out");

    try {
      let result = await fetch(CART + "")
    } catch {

    }
  }

  /**
   * Performs the actions that log a user in
   */
  async function login() {
    let username = id("login-username").textContent;
    let password = id("login-password").textContent;

    try {
      let result = await fetch(LOGIN + username + "/" + password);
      await statusCheck(result);
      result = await result.text();
      currUser = username;
      id("resultmsg").textContent = result;
    } catch {

    }
  }

  /**
   * Performs the actions that signs up a user
   */
  async function signup() {
    let email = id("signup-email").textContent;
    let username = id("signup-username").textContent;
    let password = id("signup-password").textContent;
    let confirmPassword = id("confirm-password").textContent;

    let data = new FormData();
    data.append("email", email);
    data.append("username", username);
    data.append("password", password);
    data.append("confirmPassword", confirmPassword);

    try {
      let response = await fetch(SIGNUP, {method: "POST", body: data});
      await statusCheck(response);
      result = await result.text();
      id("resultmsg").textContent = result;;
    } catch {

    }
  }

  /**
   * Populates the search screen with all items in the database
   */
  async function showAllProducts() {
    try {
      let res = await fetch(PRODUCTS);
      await statusCheck(res);
      let itemJSON = await res.json();
      displayItems(itemJSON.items, false);
    } catch {
      //TODO: Error handling
    }
  }

  /**
   * Displays the item or items that the passed in json belongs to
   * @param {Array} itemArray array of json information of the items to be displayed
   * @param {boolean} isSpecific whether or not we need more specific data
   */
  function displayItems(itemArray, isSpecific) {
    for(itemJson of itemArray) {
      let itemCard = gen("article");
      if (isSpecific) {
      } else {
        itemCard.classList.add("main-item");
        itemCard.id = itemJson.isbn;
      }
      itemGetAndSet(itemCard, itemJson, isSpecific);
      if (isSpecific) {
        let addCardButton = gen("button");
        addCardButton.id = "add-cart";
        addCardButton.textContent = "Add to Cart";
        id("specific-display").appendChild(itemCard);
        id("specific-display").appendChild(addCardButton);
      } else {
        itemCard.addEventListener("click", function() {
          getItemSpecifics(this.id);
        });
        id("item-display").appendChild(itemCard);
      }
    }
  }

  /**
   * Gets a varying number of textbook fields depending on whether or not the display is
   * meant to be specific. Additionally appends the fields onto the user provided item card.
   * @param {HTMLElement} itemCard The article containing the item's information
   * @param {JSON} itemJson The item's json
   * @param {boolean} isSpecific whether or not the display should be specific
   */
  function itemGetAndSet(itemCard, itemJson, isSpecific) {
    let itemHeader = getItemName(itemJson);
    let itemImg = getItemImage(itemJson);
    let itemAuthor = getItemTextField("Author", itemJson.author);
    let itemSubject = getItemTextField("Subject", itemJson.subject);
    let itemPrice = getItemTextField("Price", itemJson.price);

    itemCard.appendChild(itemHeader);
    itemCard.appendChild(itemImg);
    itemCard.appendChild(itemAuthor);
    itemCard.appendChild(itemSubject);
    itemCard.appendChild(itemPrice);

    if(isSpecific) {
      let itemPages = getItemTextField("Pages", itemJson.pages);
      let itemISBN = getItemTextField("ISBN", itemJson.isbn);
      let itemDescription = getItemTextField("Description", itemJson.description);

      let isInStock = gen("p");
      if (itemJson.amount_in_stock > 0) {
        isInStock.textContent = "This item is in stock.";
      } else {
        isInStock.textContent = "This item is out of stock.";
      }

      itemCard.appendChild(itemPages);
      itemCard.appendChild(itemISBN);
      itemCard.appendChild(itemDescription);
      itemCard.appendChild(isInStock);
    }
  }

  async function getItemSpecifics(isbnNumber) {
    try {
      let result = await fetch(PRODUCTS + "?isbn=" + isbnNumber);
      await statusCheck(result);
      result = await result.json();
      displayItems(result, true);
    } catch {

    }
  }



  /**
   * Returns a header element containing the name of the item whose json is passed in
   * @param {JSON} itemJson json of the item
   * @returns {HTMLElement} header element containing name of item
   */
  function getItemName(itemJson) {
    let itemHeader = gen("h1");
    itemHeader.textContent = itemJson.name;

    return itemHeader;
  }

  /**
   * Returns an image element containing an image of the item whose json is passed in
   * @param {JSON} itemJson json of the item
   * @returns {HTMLElement} image element of item
   */
  function getItemImage(itemJson) {
    let itemImg = gen("img");
    let itemImgNameArray = itemJson.name.split(" ");
    let itemImgName = "img/" + itemImgNameArray[0].toLowerCase();
    for (let i = 1; i < itemImgNameArray.length; i++) {
      itemImgName += "-" + itemImgNameArray[i].toLowerCase();
    }
    itemImgName += ".png";
    itemImg.src = itemImgName;
    itemImg.alt = itemImgName;

    return itemImg;
  }

  /**
   * Returns a text element containing the user provided data of an item
   * @param {JSON} value value of the item
   * @param {JSON} fieldname the field that the value belongs to
   * @returns {HTMLElement} text element containing the user provided data of an item
   */
  function getItemTextField(fieldname, value) {
    let itemField = gen("p");
    itemField.textContent = fieldname + ": " + value;
    return itemField;
  }


  /**
   * Shows the login or sign up option depending on which radio button is selected
   */
  function showLoginOrSignUp() {
    let loginType = this.value;
    if(loginType !== prevLoginSignUp) {
      id("resultmsg").innerHTML = "";
      id(loginType).classList.remove("hidden");
      id(prevLoginSignUp).classList.add("hidden");
      prevLoginSignUp = loginType;
    }
  }

  /**
   * Changes the view of the product display depending on which radio button is selected
   */
  function changeProductView() {
    let view = this.value;
    if(view !== prevViewOption) {
      let productArray = qsa(".main-item");
      for(item of productArray) {
        item.classList.remove(prevViewOption);
        item.classList.add(view);
      }
      prevViewOption = view;
    }
  }

  /**
   * Searches for items containing the name specified in the search bar and displays them
   */
  async function search() {
    showPage("search");
    let item = id("search-bar").textContent;

    //Will pull from the database to display the items
  }

  /**
   * Displays the specified page for the user and hides the previous page
   */
  function showPage(page) {
    if(page !== prevPage) {
      if(page === "user") {
        id("resultmsg").innerHTML = "";
      }
      id(page).classList.remove("hidden");
      id(prevPage).classList.add("hidden");
      prevPage = page;
    }
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.json());
    }
    return res;
  }

  /**
   * Helper function used as a shorthand for document.getElementById
   *
   * @param {string} string the id of the element to be selected
   * @returns {HTMLElement} the element that is selected by the ID, or null if the element
   * with id does not exist
   */
  function id(string) {
    return document.getElementById(string);
  }

  /**
   * Helper function used as a shorthand for document.querySelector
   *
   * @param {string} string the selector of the element to be selected
   * @returns {HTMLElement} the first element that is specified by the selector, or null if
   * the element with id does not exist
   */
  function qs(string) {
    return document.querySelector(string);
  }

  /**
   * Helper function used as a shorthand for document.querySelectorAll
   *
   * @param {string} string the selector of the elements to be selected
   * @returns {NodeList} A NodeList containing the elements that are specified by the selector, or
   * an empty NodeList if there are no elements matching the specific selector
   */
  function qsa(string) {
    return document.querySelectorAll(string);
  }

  /**
   * Helper function used as a shorthand for document.createElement
   *
   * @param {string} string the tag of the element to be created
   * @returns {HTMLElement} a newly created element specified by the parameter
   */
  function gen(string) {
    return document.createElement(string);
  }
}());