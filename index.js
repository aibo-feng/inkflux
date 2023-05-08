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
  let loggedIn = false;

  window.addEventListener("load",init);

  /**
   * Initializes the search button once loaded
   */
  function init() {
    id("search-btn").addEventListener("click", search)
    id("cart").addEventListener("click", function() {
      showPage("check-out");
    })
    qs("#user-profile p").addEventListener("click", function() {
      showPage("user");
    });
    id("back-btn").addEventListener("click", function() {
      showPage("search");
    });

    let radioArray = qsa("#options input");
    radioArray.forEach(function(button) {
      button.addEventListener("change", showLoginOrSignUp)
    })
  }

  /**
   * Shows the login or sign up option depending on which radio button is selected
   */
  function showLoginOrSignUp() {
    let loginType = this.value;
    if(loginType !== prevLoginSignUp) {
      id(loginType).classList.remove("hidden");
      id(prevLoginSignUp).classList.add("hidden");
      prevLoginSignUp = loginType;
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