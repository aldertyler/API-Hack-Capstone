"use strict";
//const proPubKey = "kR35gMi94d0O1yc4noLkECK7szDsmmCF8csX1cWX";
// const options = {
//   headers: new Headers({
//     "X-Api-Key": proPubKey
//   })
// };

const apiKey = "AIzaSyAJr43LsKjJhyOQ53CYdNgTqoC8slox5to";

function displayResults(responseJson) {
  console.log(responseJson);
  $("#results-list").empty();
  for (let i = 0; i < responseJson.officials.length; i++) {
    console.log(responseJson.officials[i].name);

    $("#results-list").append(
      `<li class="full-name">
         ${i < 2 ? "U.S. Senator" : "U.S. Representative"} ${
        responseJson.officials[i].name
      }
        </li>
        <li class="photo"><img src=${responseJson.officials[i].photoUrl} ></li>
        <li class="address">
            <ul>
                <li>${
                  responseJson.officials[i].address
                    ? responseJson.officials[i].address[0].line1
                    : ""
                },</li>
                <li>${
                  responseJson.officials[i].address
                    ? responseJson.officials[i].address[0].city
                    : ""
                },</li>
                <li>${
                  responseJson.officials[i].address
                    ? responseJson.officials[i].address[0].state
                    : ""
                },</li>
                <li>${
                  responseJson.officials[i].address
                    ? responseJson.officials[i].address[0].zip
                    : ""
                }</li>
            </ul>   
        </li>
        <li class="phone">${responseJson.officials[i].phones}</li>`
    );
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
//---------------------------------------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------//
//makes a request for the most recent 20 votes in both chambers
function getRecentVotes() {
  const url = "https://api.propublica.org/congress/v1/both/votes/recent.json";
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getIndividualVotesList(responseJson))
    .catch(err => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}
//iterate through response from getRecentVotes and for each role call number, makes a request for the specific role call vote
function getIndividualVotesList(responseJson) {
  const url = "";
}
//returns the specific reps position from the response from getInidividualVotesList
function getIndividualVotes() {}
function displayVotingRecord() {}

//---------------------------------------------------------------------------------------------//
//------------------------------------------------------------------------------------------//
function watchForm() {
  $("form").submit(event => {
    event.preventDefault();
    const userAddress = $("#js-address-input").val();
    console.log(userAddress);
    getResults(userAddress);
  });
}

$(watchForm);
