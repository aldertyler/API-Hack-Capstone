"use strict";

const proPubKey = "kR35gMi94d0O1yc4noLkECK7szDsmmCF8csX1cWX";

const apiKey = "AIzaSyAJr43LsKjJhyOQ53CYdNgTqoC8slox5to";

const options = {
  headers: new Headers({
    "X-Api-Key": proPubKey
  })
};

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
        <li class="phone">${responseJson.officials[i].phones}</li>
        <button id="get-record" class="${
          responseJson.officials[i].name
        }">Get Voting Record</button>`
    );
  }
  $("#results").removeClass("hidden");
  watchButton();
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

//you need an event listener that triggers the following functions

//makes a request for the most recent 20 votes in both chambers
function getRecentVotes() {
  const votesUrl =
    "https://api.propublica.org/congress/v1/both/votes/recent.json";
  fetch(votesUrl, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getRollCallVote(responseJson))
    .catch(err => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
  console.log("ran getRecentVotes");
}

//itereate through the response from getRecentVotes and return the individual votes for each roll call number
function getRollCallVote(responseJson) {
  for (let i = 0; i < responseJson.results.votes.length; i++) {
    const rollCallUrl = `https://api.propublica.org/congress/v1/${responseJson.results.votes[i].congress}/${responseJson.results.votes[i].chamber}/sessions/${responseJson.results.votes[i].session}/votes/${responseJson.results.votes[i].roll_call}.json`;

    fetch(rollCallUrl, options)
      .then(response => {
        if (response.ok) {
          return response.json();
          //console.log(response.json);
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => getIndividualVotes(responseJson))
      .catch(err => {
        $("#js-error-message").text(`Something went wrong: ${err.message}`);
      });
  }
  console.log("ran getRollCallVote");
}
//returns the specific reps position from the response from getInidividualVotesList
function getIndividualVotes() {}
//display the results
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

function watchButton() {
  $("#get-record").click(event => {
    event.preventDefault();
    getRecentVotes();
  });
}

$(watchForm);
