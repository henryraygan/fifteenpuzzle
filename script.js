document.addEventListener("DOMContentLoaded", function () {
  // Variables globales
  const cells = document.querySelectorAll(".cell");
  const startButton = document.getElementById("startButton");
  const timerDisplay = document.getElementById("timer");
  const pauseButton = document.getElementById("pauseButton");
  const saveGameButton = document.getElementById("saveGameButton");
  const savedGamesSelect = document.getElementById("savedGamesSelect");
  let emptyCellIndex;
  let startTime;
  let timerInterval;
  let savedSessions = JSON.parse(localStorage.getItem("savedSessions")) || [];
  let victories = JSON.parse(localStorage.getItem("victories")) || [];
  let paused = false;

  // Función para iniciar el juego
  function startGame() {
    startTimer();
    shuffleNumbers();
    paused = false;
    pauseButton.disabled = false;
    saveGameButton.disabled = false;
  }

  // Función para mezclar las celdas aleatoriamente
  function shuffleNumbers() {
    console.log("Mezclando celdas...");
    const numbers = Array.from({ length: 15 }, (_, i) => i + 1);
    numbers.push(null); // Representa la celda vacía
    numbers.sort(() => Math.random() - 0.5);
    console.log("Números mezclados:", numbers);
    numbers.forEach((number, index) => {
      cells[index].textContent = number;
      if (number === null) {
        emptyCellIndex = index;
        cells[index].classList.add("empty");
      } else {
        cells[index].classList.remove("empty");
      }
    });
  }

  // Función para manejar el clic en una celda
  function handleClick(event) {
    const clickedIndex = Array.from(cells).indexOf(event.target);
    const rowIndex = Math.floor(emptyCellIndex / 4);
    const clickedRow = Math.floor(clickedIndex / 4);
    const colIndex = emptyCellIndex % 4;
    const clickedCol = clickedIndex % 4;

    if (
      (rowIndex === clickedRow && Math.abs(colIndex - clickedCol) === 1) ||
      (colIndex === clickedCol && Math.abs(rowIndex - clickedRow) === 1)
    ) {
      // Movimiento válido
      cells[emptyCellIndex].textContent = event.target.textContent;
      cells[emptyCellIndex].classList.remove("empty");
      cells[emptyCellIndex].classList.add("moving"); // Agregamos una clase "moving" temporalmente
      event.target.textContent = "";
      event.target.classList.add("empty");
      emptyCellIndex = clickedIndex;
      setTimeout(() => {
        cells[emptyCellIndex].classList.remove("moving");
      }, 100);

      if (!paused && checkWin()) {
        stopTimer();
        const gameDuration = timerDisplay.textContent;
        saveScore(gameDuration);
        alert("¡Felicidades, has ganado!");
        loadSavedGames();
      }
    }
  }

  // Función para verificar si se ha ganado el juego
  function checkWin() {
    for (let i = 0; i < cells.length - 1; i++) {
      if (parseInt(cells[i].textContent) !== i + 1) {
        return false;
      }
    }
    return cells[15].classList.contains("empty");
  }

  // Función para iniciar el temporizador
  function startTimer(startTime) {
    // Iniciar el temporizador desde startTime o desde cero si no se proporciona startTime
    startTime = startTime || Date.now();

    // Actualizar el temporizador cada segundo
    timerInterval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      timerDisplay.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
  }

  // Función para detener el temporizador
  function stopTimer() {
    clearInterval(timerInterval);
  }

  // Función para guardar la puntuación de la partida completada
  function saveScore(gameDuration) {
    victories.push({
      gameDuration,
      cellOrder: Array.from(cells).map((cell) => cell.textContent),
    });
    localStorage.setItem("victories", JSON.stringify(victories));
  }

  // Función para guardar la partida actual
  function saveGame() {
    stopTimer();
    const gameDuration = timerDisplay.textContent;
    if (gameDuration) {
      // Guardar el orden de las celdas
      const cellOrder = [];
      cells.forEach((cell) => {
        cellOrder.push(cell.textContent);
      });

      savedSessions.push({
        gameDuration,
        cellOrder,
      });
      localStorage.setItem("savedSessions", JSON.stringify(savedSessions));
      alert("Partida guardada correctamente.");
      loadSavedGames();
    } else {
      alert("No se puede guardar la partida antes de completarla.");
    }
  }

  // Función para pausar el juego
  function pauseGame() {
    paused = true;
    stopTimer();
    saveGameButton.disabled = false;
  }

  // Función para cargar una partida guardada
  function loadSavedGame(gameData) {
    cells.forEach((cell, index) => {
      cell.textContent = gameData.cellOrder[index];
      if (cell.textContent === "") {
        cell.classList.add("empty");
        emptyCellIndex = index;
      } else {
        cell.classList.remove("empty");
      }
    });

    // Iniciar el temporizador con el tiempo guardado
    const elapsedTime = Math.floor((Date.now() - gameData.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    // Iniciar el temporizador con el tiempo guardado
    startTimer(gameData.startTime);
  }

  // Función para cargar la lista de partidas guardadas en un select
  function loadSavedGames() {
    savedGamesSelect.innerHTML =
      '<option value="">Selecciona una partida guardada</option>';
    const completedGamesList = document.getElementById("completedGamesList");
    completedGamesList.innerHTML = ""; // Limpiar la lista de partidas completadas

    savedSessions.forEach((game, index) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = `Partida guardada - ${game.gameDuration}`;
      savedGamesSelect.appendChild(option);
    });

    victories.forEach((game, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Partida completada - Duración: ${game.gameDuration}`;
      completedGamesList.appendChild(listItem);
    });
  }

  // Evento click en el botón de iniciar juego
  startButton.addEventListener("click", startGame);

  // Evento click en las celdas
  cells.forEach((cell) => cell.addEventListener("click", handleClick));

  // Evento click en el botón de pausa
  pauseButton.addEventListener("click", pauseGame);

  // Evento click en el botón de guardar partida
  saveGameButton.addEventListener("click", saveGame);

  // Evento change en el select para cargar la partida seleccionada
  savedGamesSelect.addEventListener("change", function () {
    const selectedIndex = parseInt(savedGamesSelect.value);
    if (
      !isNaN(selectedIndex) &&
      selectedIndex >= 0 &&
      selectedIndex < savedSessions.length
    ) {
      loadSavedGame(savedSessions[selectedIndex]);
    }
  });

  // Cargar la lista de partidas guardadas al cargar la página
  loadSavedGames();
});
