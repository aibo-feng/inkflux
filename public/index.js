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
  let currSearchLink = "";
  let PRODUCTS = "/inkflux/products";
  let LOGIN = "/inkflux/login";
  let SIGNUP = "/inkflux/signup";
  let CART = "/inkflux/getcart/";
  let ADDCART = "/inkflux/addcart";
  let PURCHASE = "/inkflux/buy";
  let GETTRANSACTIONS = "/inkflux/gethistory";

  window.addEventListener("load", init);

  /**
   * Initializes majority of all the view changing functions along with the radio buttons
   * that control viewing experience.
   */
  async function init() {
    await showAllProducts();
    initializeHeaderButtons();
  }

  function initializeHeaderButtons() {
    id("search-btn").addEventListener("click", searchProduct);
    id("search-btn").addEventListener("click", filterReset);
    initializeLoginModal();
    initializeSignUpModal();
    initializeFilterOptions();
  }

  function initializeFilterOptions() {
    let updateFilters = id("filter-update");
    updateFilters.addEventListener("click", filterSearch);

    let resetFilters = id("filter-reset");
    resetFilters.addEventListener("click", filterReset);
  }

  function initializeLoginModal() {
    const loginModal = qs(".login.modal");
    const loginBtn = id("login-btn");
    const loginClose = qs(".login.modal-close");
    const submitLogin = qs(".login.modal-submit");

    loginBtn.addEventListener("click", () => {
      loginModal.showModal();
    });

    loginClose.addEventListener("click", () => {
      loginModal.close();
    });

    submitLogin.addEventListener("click", () => {
      login();
    });
  }

  function initializeSignUpModal() {
    const signUpModal = qs(".signup.modal");
    const signUpBtn = id("signup-btn");
    const signUpClose = qs(".signup.modal-close");
    const submitSignUp = qs(".signup.modal-submit");

    signUpBtn.addEventListener("click", () => {
      signUpModal.showModal();
    });

    signUpClose.addEventListener("click", () => {
      signUpModal.close();
    });

    submitSignUp.addEventListener("click", () => {
      signup();
    });
  }

  /**
   * Populates the search screen with all items in the database
   */
  async function showAllProducts() {
    try {
      let res = await fetch(PRODUCTS);
      await statusCheck(res);
      let itemJSON = await res.json();
      displayItems(itemJSON);
    } catch (err) {
      console.error(err);
      //TODO: Error handling
    }
  }

  function displayItems(itemArray) {
    for (const item of itemArray) {
      let itemDiv = gen("div");
      itemDiv.classList.add("item");
      itemDiv.id = item.isbn;

      let img = getItemImage(item);
      img.classList.add("item-img");

      let author = gen("p");
      author.textContent = item.author;
      author.classList.add("item-author");

      let name = gen("p");
      name.textContent = item.name;
      name.classList.add("item-name");

      let price = gen("p");
      price.textContent = "$" + item.price;
      price.classList.add("item-price");

      let description = gen("p");
      description.textContent = item.description;
      description.classList.add("item-description");

      itemDiv.appendChild(img);
      itemDiv.appendChild(name);
      itemDiv.appendChild(author);
      itemDiv.appendChild(description);
      itemDiv.appendChild(price);

      id("item-display").appendChild(itemDiv);
    }
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
    itemImgName = itemImgName.replace(':', '');
    itemImg.src = itemImgName;
    itemImg.alt = itemImgName;

    return itemImg;
  }

  /**
   * Populates the search screen with all items in the database
   */
  async function showAllProducts() {
    try {
      let res = await fetch(PRODUCTS);
      await statusCheck(res);
      let itemJSON = await res.json();
      displayItems(itemJSON);
    } catch (err) {
      console.error(err);
      //TODO: Error handling
    }
  }

  async function searchProduct() {
    try {
      let query = id("search-bar").value;
      let option = id("search-option").value.toLowerCase();
      currSearchLink = PRODUCTS + "/?" + option + "=" + query;
      let res = await fetch(currSearchLink);
      await statusCheck(res);
      let itemJSON = await res.json();
      createSearch(itemJSON);
    } catch {
      //TODO: Error handling
    }
  }

  function createSearch(itemJSON) {
    id("item-display").innerHTML = "";
    if (itemJSON.length === 0) {
      let noResults = gen("p");
      noResults.textContent = "No results found";
      id("item-display").appendChild(noResults);
    } else {
      displayItems(itemJSON);
    }
  }

  async function login() {
    try {
      let form = qs(".login.modal-form");
      let data = new FormData(form);
      let res = await fetch(LOGIN, {method: "POST", body: data});
      await statusCheck(res);
      let username = await res.text();
    } catch {
      // TODO: Error handling
    }
  }

  async function signup() {
    try {
      let form = qs(".signup.modal-form");
      let data = new FormData(form);
      let res = await fetch(SIGNUP, {method: "POST", body: data});
      await statusCheck(res);
      let username = await res.text();

      // edit this part
      currUser = username;
      let newP = gen("p");
      newP.textContent = "Welcome, " + username + "!";
      id("login-container").appendChild(newP);
    } catch {
      // TODO: Error handling
    }
  }

  async function filterSearch() {
    try {
      let filterLink = currSearchLink ? currSearchLink : PRODUCTS + "/?";
      let precedingQuery = currSearchLink ? "&" : "";

      for (const filter of qsa(".filter input")) {
        if (filter.checked) {
          filterLink += precedingQuery + filter.name + "=" + filter.value;
          precedingQuery = "&";
          let res = await fetch(filterLink);
          await statusCheck(res);
          let itemJSON = await res.json();
          createSearch(itemJSON);
        }
      }
    } catch (err) {
      // TODO: Error handling
      console.error(err);
    }
  }

  function filterReset() {
    for (const filter of qsa(".filter input")) {
      filter.checked = false;
    }
    searchProduct();
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
   * @returns {HTMLElement} a newly created element spe cified by the parameter
   */
  function gen(string) {
    return document.createElement(string);
  }
}());