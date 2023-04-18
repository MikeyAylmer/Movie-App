const API_URL = "https://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;

let categories = [];




async function getCategoryIds() {
  let res = await axios.get(`${API_URL}categories?count=100`);
  let catIds = res.data.map(c => c.id);
  return _.sampleSize(catIds, NUM_CATEGORIES);
}

async function getCategory(catId) {
  let res = await axios.get(`${API_URL}category?id=${catId}`);
  let cat = res.data;
  let allClues = cat.clues;
  let randomClues = _.sampleSize(allClues, NUM_CLUES);
  let clues = randomClues.map(c => ({
    question: c.question,
    answer: c.answer,
    showing: null,
  }));

  return { title: cat.title, clues };
}


async function fillTable() {
  $("#gameBoard thead").empty();
  let $tr = $("<tr>");
  for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
    $tr.append($("<th>").text(categories[catIdx].title));
  }
  $("#gameBoard thead").append($tr);

  $("#gameBoard tbody").empty();
  for (let clueIdx = 0; clueIdx < NUM_CLUES; clueIdx++) {
    let $tr = $("<tr>");
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
    }
    $("#gameBoard tbody").append($tr);
  }
}


function playGame(evt) {
  let id = evt.target.id;
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    return
  }

  $(`#${catId}-${clueId}`).html(msg);
}

async function startGame() {
  let catIds = await getCategoryIds();

  categories = [];

  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }

  fillTable();
}

$("#restart").on("click", startGame);

$(async function () {
    startGame();
    $("#gameBoard").on("click", "td", playGame);
  }
);
