"use strict";

const proPubKey = "kR35gMi94d0O1yc4noLkECK7szDsmmCF8csX1cWX";

const apiKey = "AIzaSyAJr43LsKjJhyOQ53CYdNgTqoC8slox5to";

const options = {
  headers: new Headers({
    "X-Api-Key": proPubKey
  })
};

let voteArray = [];
let userArray = [];
let questions = [];
let currentQuestion = 0;
let score = 0;
let rep = "";

function displayResults(responseJson) {
  $("#results-list").empty();
  for (let i = 0; i < responseJson.officials.length; i++) {
    if (i === 3) {
      break;
    }

    $("#results-list").append(
      `<ul class="reps">
      <li class="title">
         ${i < 2 ? "U.S. Senator" : "U.S. Representative"}</li>
         <li id="name" class="${i}"> ${responseJson.officials[i].name}
        </li>
        <li class="photo"><img src=${responseJson.officials[i].photoUrl} alt="${
        responseJson.officials[i].name
      }" style="width: 175px; height: 175px;"></li>
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
        <button id="get-record" class="${i}">How do you compare</button>
        <li class="${responseJson.officials[i].name
          .replace(/\s/g, "")
          .replace(/\./g, "")}"></li>
        </ul>     
        `
    );
    watchButton(i);
  }
  $("#results").removeClass("hidden");
}

function getResults(userAddress) {
  const address = userAddress.split(" ").join("%20");
  const url = `https://www.googleapis.com/civicinfo/v2/representatives?key=${apiKey}&address=${address}&roles=legislatorLowerBody&roles=legislatorUpperBody`;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
      $(".error-message").show();
    });
}

//makes a request for the most recent votes in both chambers
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
      $(".error-message").show();
    });
}

//itereate through the response from getRecentVotes and return the individual votes for each roll call number
function getRollCallVote(responseJson, repName) {
  for (let i = 0; i < responseJson.results.votes.length; i++) {
    const rollCallUrl = `https://api.propublica.org/congress/v1/${responseJson.results.votes[i].congress}/${responseJson.results.votes[i].chamber}/sessions/${responseJson.results.votes[i].session}/votes/${responseJson.results.votes[i].roll_call}.json`;

    fetch(rollCallUrl, options)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => getIndividualVotes(responseJson, repName))
      .catch(err => {
        $("#js-error-message").text(`Something went wrong: ${err.message}`);
        $(".error-message").show();
      });
  }
}

//returns the specific reps position from the response from getRollCallVote and adds the results to the voteArray

function getIndividualVotes(responseJson, repName) {
  for (let i = 0; i < responseJson.results.votes.vote.positions.length; i++) {
    if (repName.trim() == responseJson.results.votes.vote.positions[i].name) {
      voteArray.push({
        id: responseJson.results.votes.vote.bill.number,
        title: responseJson.results.votes.vote.bill.title,
        description: responseJson.results.votes.vote.description,
        url: responseJson.results.votes.vote.url,
        position: responseJson.results.votes.vote.positions[i].vote_position
      });
    }
    if (i == voteArray.length - 1) {
      setTimeout(function() {
        $(".loader").hide();
        $(".start").show();
      }, 4000);
    }
    rep = repName.replace(/\s/g, "").replace(/\./g, "");
  }
}
function watchForm() {
  $("#form").submit(event => {
    event.preventDefault();
    const userAddress = $("#js-address-input").val();

    getResults(userAddress);
  });
}

function watchButton(i) {
  $(`#get-record.${i}`).click(event => {
    event.preventDefault();
    let repName = $(`#name.${i}`).text();

    voteArray = [];
    generateModal();
    getRecentVotes(repName);
  });
}

//watch start button
$(".start").click(event => {
  event.preventDefault();
  $(".start-screen").hide();
  generateQuestions();
  // $(".loader").show();
  // setTimeout(function() {
  //   $(".loader").hide();
  //   $(".question-screen").show();
  // }, 3000);
  showQuestion();
  $(".question-screen").show();
});

// watch next button
$(".question-screen").submit(event => {
  event.preventDefault();

  let selectedAnswer = $("input[name=radio]:checked").val();
  userArray.push(selectedAnswer);
  currentQuestion++;

  $("input:radio[name=radio]").prop("checked", false);

  if (currentQuestion >= voteArray.length) {
    $(".question-screen").hide();
    generateResults();

    $(".results").show();
  }
  showQuestion();
});

function generateResults() {
  for (let i = 0; i < voteArray.length; i++) {
    if (userArray[i] == voteArray[i].position) {
      score++;
    }
  }
  let percentage = Math.floor((score / voteArray.length) * 100);
  $(".results").append(
    `<p class="percentage">You are ${percentage}% aligned with this member of Congress.</p>`
  );
  $(`.${rep}`).text(`${percentage}% Aligned`);
}

function generateQuestions() {
  for (let i = 0; i < voteArray.length; i++) {
    if (voteArray[i].id == undefined) {
      questions.push(`How would you vote on "${voteArray[i].description}"?`);
    } else {
      questions.push(
        `How would you vote on ${voteArray[i].id}: ${voteArray[i].description}?`
      );
    }
  }
}

function showQuestion() {
  $("#question-text").text(`${questions[currentQuestion]}`);
  $(".more-info").text("");
  if (currentQuestion < voteArray.length) {
    $(".more-info").append(
      `<a href="${voteArray[currentQuestion].url}" target="blank">For more information</a>`
    );
  }
}

function generateModal() {
  let modal = document.getElementById("myModal");
  // // Get the <span> element that closes the modal
  let span = document.getElementsByClassName("close")[0];
  // open the modal
  modal.style.display = "block";
  // // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
    voteArray = [];
    userArray = [];
    questions = [];
    currentQuestion = 0;
    score = 0;
    $(".results").hide();
    $(".start-screen").show();
    $(".question-screen").hide();
    $(".percentage").text("");
    $(".start").hide();
    $(".loader").show();
  };
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
      voteArray = [];
      userArray = [];
      questions = [];
      currentQuestion = 0;
      score = 0;
      $(".results").hide();
      $(".start-screen").show();
      $(".question-screen").hide();
      $(".percentage").text("");
      $(".start").hide();
      $(".loader").show();
    }
  };
}

$(watchForm);
