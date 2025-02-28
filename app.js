// ### api ###
const API = "http://localhost:3000/api/v1";

const getGameStateFromDb = async () => {
  try {
    const response = await axios.get(`${API}/game-state`);
    return response.data;
  } catch (error) {
    alert("localhost is not runing on port 3000");
    return null;
  }
};
// /game-state/sequence
const isValidRound = async (playerArray) => {
  try {
    const response = await axios.post(`${API}/game-state/sequence`, {
      sequence: playerArray,
    });
    return response.data.gameState;
  } catch (error) {
    console.error(error.response.data.message);
    alert(error.response.data.message);
    return null;
  }
};

const onStart = async () => {
  let db = await getGameStateFromDb();
  let scoreValue = db.level;
  let highScoreValue = db.highScore;
  levelScore.innerText = scoreValue;
  highScore.innerText = highScoreValue;
  startBtn.addEventListener("click", () => mainGame());
  replayBtn.addEventListener("click", async () => {
    let db = await getGameStateFromDb();
    let gameSpeed = setGameSpeed(db.level);
    gameRound(db.sequence, gameSpeed);
  });
};

// ### Sound ###
const synths = {
  sine: new Tone.Synth({ oscillator: { type: "sine" } }).toDestination(),
  square: new Tone.Synth({ oscillator: { type: "square" } }).toDestination(),
  triangle: new Tone.Synth({
    oscillator: { type: "triangle" },
  }).toDestination(),
};

let sound = synths.sine;

const soundSelect = document.getElementById("sound-select");
soundSelect.addEventListener("change", (event) => {
  const currentSound = event.target.value;
  sound = synths[currentSound];
});

const playSound = (btnValue, event) => {
  let btnSound;
  const now = Tone.now();
  if (event === "click") {
    btnSound = {
      red: "c4",
      yellow: "d4",
      green: "e4",
      blue: "f4",
    };
  } else if (event === "key") {
    btnSound = {
      q: "c4",
      w: "d4",
      a: "e4",
      s: "f4",
    };
  }
  sound.triggerAttackRelease(btnSound[btnValue], "8n", now);
};

// ### replay and start btn
const startBtn = document.getElementById("start-btn");
const replayBtn = document.getElementById("replay-btn");

// ### score counter ###
const levelScore = document.getElementById("level-indicator");
const highScore = document.getElementById("high-score");

// ### Buttons for main game ###
const redContainer = document.getElementById("pad-red");
const yellowContainer = document.getElementById("pad-yellow");
const greenContainer = document.getElementById("pad-green");
const blueContainer = document.getElementById("pad-blue");

const mainGame = async () => {
  let validGame = 1;
  while (validGame != null) {
    const db = await getGameStateFromDb();
    const gameArray = db.sequence;
    const scoreValue = db.level;
    const highScoreValue = db.highScore;
    levelScore.innerText = scoreValue;
    highScore.innerText = highScoreValue;
    startBtn.disabled = true;
    await new Promise((resolve) => setTimeout(resolve, 750));
    validGame = await playGame(gameArray, scoreValue);
  }
  resetGame();
  return 0;
};

const resetGame = async () => {
  const db = await getGameStateFromDb();
  const scoreValue = db.level;
  const highScoreValue = db.highScore;
  levelScore.innerText = scoreValue;
  highScore.innerText = highScoreValue;
  startBtn.disabled = false;
};

const playGame = async (gameArray, scoreValue) => {
  const gameSpeed = setGameSpeed(scoreValue);
  replayBtn.disabled = true;
  await gameRound(gameArray, gameSpeed);
  replayBtn.disabled = false;
  const playerArray = await playerRound(scoreValue);
  const validRound = await isValidRound(playerArray);
  if (validRound == null) {
    scoreValue = 0;
    return null;
  } else {
    return 1;
  }
};

const gameRound = (array, gameSpeed) => {
  return new Promise((resolve) => {
    for (let i = 0; i < array.length; i++) {
      setTimeout(() => {
        displayColors(array[i], gameSpeed);
        if (i === array.length - 1) {
          setTimeout(resolve, gameSpeed);
        }
      }, i * gameSpeed);
    }
  });
};

const displayColors = (value, gameSpeed) => {
  let container;
  let originalColor;
  let activeColor;
  if (value === "red") {
    container = redContainer;
    originalColor = "#e74c3c";
    activeColor = "#73261e";
  } else if (value === "yellow") {
    container = yellowContainer;
    originalColor = "#f1c40f";
    activeColor = "#776209";
  } else if (value === "green") {
    container = greenContainer;
    originalColor = "#2ecc71";
    activeColor = "#186639";
  } else if (value === "blue") {
    container = blueContainer;
    originalColor = "#3498db";
    activeColor = "#1a4c6d";
  }

  if (container) {
    container.style.backgroundColor = activeColor;
    setTimeout(() => {
      container.style.backgroundColor = originalColor;
    }, gameSpeed / 2);
  }
};

const playerRound = (scoreValue) => {
  return new Promise((resolve) => {
    let playerChoiceArray = [];

    const handleClick = (event) => {
      replayBtn.disabled = true;
      const activeClick = "50%";
      const originalOpacity = "100%";

      if (event.key == undefined) {
        playSound(event.target.value, "click");
      } else {
        playSound(event.key, "key");
      }

      if (event.key === "q" || event.target.value === "red") {
        playerChoiceArray.push(redContainer.value);
        redContainer.style.opacity = activeClick;
        setTimeout(() => {
          redContainer.style.opacity = originalOpacity;
        }, 250);
      } else if (event.key === "w" || event.target.value === "yellow") {
        playerChoiceArray.push(yellowContainer.value);
        yellowContainer.style.opacity = activeClick;
        setTimeout(() => {
          yellowContainer.style.opacity = originalOpacity;
        }, 250);
      } else if (event.key === "a" || event.target.value === "green") {
        playerChoiceArray.push(greenContainer.value);
        greenContainer.style.opacity = activeClick;
        setTimeout(() => {
          greenContainer.style.opacity = originalOpacity;
        }, 250);
      } else if (event.key === "s" || event.target.value === "blue") {
        playerChoiceArray.push(blueContainer.value);
        blueContainer.style.opacity = activeClick;
        setTimeout(() => {
          blueContainer.style.opacity = originalOpacity;
        }, 250);
      }

      if (playerChoiceArray.length === scoreValue) {
        window.removeEventListener("keydown", handleClick);
        redContainer.removeEventListener("click", handleClick);
        yellowContainer.removeEventListener("click", handleClick);
        greenContainer.removeEventListener("click", handleClick);
        blueContainer.removeEventListener("click", handleClick);
        resolve(playerChoiceArray);
      }
    };

    window.addEventListener("keydown", handleClick);
    redContainer.addEventListener("click", handleClick);
    yellowContainer.addEventListener("click", handleClick);
    greenContainer.addEventListener("click", handleClick);
    blueContainer.addEventListener("click", handleClick);
  });
};

const setGameSpeed = (gameScore) => {
  if (gameScore <= 0) return 2000;
  if (gameScore <= 3) return 2000;
  if (gameScore <= 6) return 1500;
  if (gameScore <= 9) return 1000;
  if (gameScore <= 12) return 500;
  return 350;
};

onStart();
