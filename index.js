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
  const POKEMON_API_URL = "https://pokeapi.co/api/v2/";

  window.addEventListener("load",init);

  /**
   * Initializes the search button once loaded
   */
  function init() {
    qs("button").addEventListener("click", searchGeneration);
  }

  /**
   * Fetches the data of the selected generation and adds the pokemon
   */
  async function searchGeneration() {
    id("display-all").innerHTML = "";
    showBoard();
    try {
      let result = await fetch(POKEMON_API_URL + qs("select").value);
      await statusCheck(result);
      result = await result.json();

      await addPokemon(result.pokemon_species);
    } catch {
      handleError();
    }
  }

  /**
   * Creates a "card" for each pokemon in the pokemon array containing the name and a sprite
   * image.
   * @param {Array} pokemon Array containing all the pokemon from a user-selected generation
   */
  async function addPokemon(pokemon) {
    pokemon.forEach(async function(poke) {
      let article = gen("article");
      article.addEventListener("click", showSpecifics);

      let pTag = gen("p");
      pTag.textContent = poke.name;

      article.appendChild(pTag);
      article.appendChild(await grabSprite(poke.name));
      id("display-all").appendChild(article);
    })
  }

  /**
   * Grabs the sprite of a pokemon name passed in and returns an image containing that sprite
   * @param {String} name name of the pokemon whose sprite is to be grabbed
   * @returns an img HTML tag of the pokemon's sprite
   */
  async function grabSprite(name) {
    try {
      let result = await fetch(POKEMON_API_URL + "pokemon\\" + name);
      await statusCheck(result);
      result = await result.json();

      let img = gen("img");
      img.src = result.sprites.front_default;
      img.alt = name;
      return img;
    } catch {
      handleError();
    }
  }

  /**
   * Handles displaying the pokedex entries from all regions of the pokemon clicked on by the
   * user
   */
  async function showSpecifics() {
    id("specific-display").innerHTML = "";
    qs("button").disabled = true;
    swapViews();

    try {
      let result = await fetch(POKEMON_API_URL + "pokemon-species\\" + this.querySelector("p").textContent);
      await statusCheck(result);
      result = await result.json();
      result = result.flavor_text_entries;

      let article = gen("article");
      for(let i = 0; i < result.length; i++) {
        if(result[i].language.name == "en") {
          let entry = result[i++];
          let description = gen("p");
          description.textContent = "Pokemon " + entry.version.name + ": " + entry.flavor_text;
          article.appendChild(description);
        }
      }

      id("specific-display").appendChild(article);
    } catch {
      handleError();
    }

    let backButton = gen("button");
    backButton.textContent = "Back Button";
    backButton.addEventListener("click", function() {
      swapViews();
      qs("button").disabled = false;
    });
    id("specific-display").appendChild(backButton);
  }

  /**
   * Swaps the views between the pokemon display and the specific pokemon display
   */
  function swapViews() {
    id("display-wrapper").classList.toggle("hidden");
    id("specific-display").classList.toggle("hidden");
  }

  /**
   * Hides the error message and shows the main website content
   */
  function showBoard() {
    id("display").classList.remove("hidden");
    id("error").classList.add("hidden");
  }

  /**
   * Displays the error message in case of an error and hides the main website content
   */
  function handleError() {
    id("display").classList.add("hidden");
    id("error").classList.remove("hidden");
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