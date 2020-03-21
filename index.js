"use strict";

const proPubKey = "kR35gMi94d0O1yc4noLkECK7szDsmmCF8csX1cWX";

const apiKey = "AIzaSyAJr43LsKjJhyOQ53CYdNgTqoC8slox5to";

const options = {
  headers: new Headers({
    "X-Api-Key": proPubKey
  })
};

let voteArray = [];

function displayResults(responseJson) {
  console.log(responseJson);
  $("#results-list").empty();
  for (let i = 0; i < responseJson.officials.length; i++) {
    console.log(responseJson.officials[i].name);

    $("#results-list").append(
      `<li class="title">
         ${i < 2 ? "U.S. Senator" : "U.S. Representative"}</li>
         <li id="name" class="${i}"> ${responseJson.officials[i].name}
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
        <button id="get-record" class="${i}">Get Voting Record</button>
        <section id="record"></section>`
    );
    watchButton(i);
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
function getRecentVotes(repName) {
  const votesUrl =
    "https://api.propublica.org/congress/v1/both/votes/recent.json";
  fetch(votesUrl, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getRollCallVote(responseJson, repName))
    .catch(err => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
  console.log("ran getRecentVotes" + repName);
}

//itereate through the response from getRecentVotes and return the individual votes for each roll call number
function getRollCallVote(responseJson, repName) {
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
      .then(responseJson => getIndividualVotes(responseJson, repName))
      .catch(err => {
        $("#js-error-message").text(`Something went wrong: ${err.message}`);
      });
  }

  console.log("ran getRollCallVote" + repName);
}

//returns the specific reps position from the response from getRollCallVote

//todo: create an array that stores the vote positions
//create the quiz app feature
//instead of updating and pushing voteOBject just saty voteArray[i] = {object keys and values}
function getIndividualVotes(responseJson, repName) {
  // console.log(responseJson);
  for (let i = 0; i < responseJson.results.votes.vote.positions.length; i++) {
    if (repName.trim() == responseJson.results.votes.vote.positions[i].name) {
      voteArray.push({
        id: responseJson.results.votes.vote.bill.number,
        title: responseJson.results.votes.vote.bill.title,
        description: responseJson.results.votes.vote.description,
        position: responseJson.results.votes.vote.positions[i].vote_position
      });
    }
    console.log(voteArray);
    console.log("ran getIndividualResults");
  }
}
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

function watchButton(i) {
  $(`#get-record.${i}`).click(event => {
    event.preventDefault();

    let repName = $(`#name.${i}`).text();
    console.log(repName);
    voteArray = [];
    getRecentVotes(repName);
  });
}

$(watchForm);
