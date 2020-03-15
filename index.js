"use strict";

const apiKey = "AIzaSyAJr43LsKjJhyOQ53CYdNgTqoC8slox5to";

function displayResults(responseJson) {
  console.log(responseJson);

  $("#results-list").empty();

  for (let i = 0; i < responseJson.officials.length; i++) {
    console.log(responseJson.officials[i].name);
    if (i < 2) {
      $("#results-list").append(
        `<li>
         <p>U.S Senator ${responseJson.officials[i].name}</p>

        </li>`
      );
    } else {
      $("#results-list").append(
        `<li>
         <p>U.S. Representative ${responseJson.officials[i].name}</p>

        </li>`
      );
    }
  }

  $("#results").removeClass("hidden");
}

function getResults(userAddress) {
  const address = userAddress.split(" ").join("%20");
  const url = `https://www.googleapis.com/civicinfo/v2/representatives?key=${apiKey}&address=${address}&roles=legislatorLowerBody&roles=legislatorUpperBody`;
  console.log(url);
  fetch(url)
    .then(response => {
      if (response.ok) {
        //console.log(response.json());
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
  $("form").submit(event => {
    event.preventDefault();
    const userAddress = $("#js-address-input").val();
    console.log(userAddress);
    getResults(userAddress);
  });
}

$(watchForm);
