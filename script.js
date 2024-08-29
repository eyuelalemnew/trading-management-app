import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPZm0-tg4cpMY2dCmzH6CGASjgsf23Hio",
  authDomain: "bingo-4abd7.firebaseapp.com",
  projectId: "bingo-4abd7",
  storageBucket: "bingo-4abd7.appspot.com",
  messagingSenderId: "210327372536",
  appId: "1:210327372536:web:a667cbb0dae97dc1e2710d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth).catch((error) => {
  console.error("Authentication error:", error);
});

const gameId = "bingoGame";

// Generate a unique ID for the current player or use a saved one from localStorage
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("userId", userId);
}

let opponentUserId = localStorage.getItem("opponentUserId");
if (!opponentUserId) {
  opponentUserId = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("opponentUserId", opponentUserId);
}

// Function to create and display a bingo card
function createCard(containerId, cardData, editable = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  cardData.forEach((number) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = number;
    if (editable) {
      cell.addEventListener("click", () => {
        const newValue = prompt("Enter a new number (1-25):", cell.textContent);
        if (newValue && newValue >= 1 && newValue <= 25) {
          cell.textContent = newValue;
          saveCard(containerId);
        }
      });
    } else {
      cell.addEventListener("click", () => {
        cell.classList.toggle("marked");
        saveCard(containerId);
      });
    }
    container.appendChild(cell);
  });
}

// Generate a random bingo card
function generateCard() {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

// Save the current card to Firebase
function saveCard(containerId) {
  const cardData = Array.from(
    document.getElementById(containerId).children
  ).map((cell) => cell.textContent);
  const userIdToSave = containerId === "arrangeCard" ? opponentUserId : userId;
  set(ref(database, `${gameId}/${containerId}/${userIdToSave}`), cardData);
}

// Load a card from Firebase
function loadCard(containerId) {
  const userIdToLoad = containerId === "arrangeCard" ? userId : opponentUserId;
  onValue(
    ref(database, `${gameId}/${containerId}/${userIdToLoad}`),
    (snapshot) => {
      const savedCard = snapshot.val();
      if (savedCard) {
        createCard(
          containerId,
          savedCard,
          containerId === "arrangeCard" || containerId === "arrangeCard2"
        );
      } else {
        const cardData = generateCard();
        createCard(
          containerId,
          cardData,
          containerId === "arrangeCard" || containerId === "arrangeCard2"
        );
        saveCard(containerId);
      }
    }
  );
}

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
  loadCard("arrangeCard");
  loadCard("playerCard");
  loadCard("arrangeCard2");
  loadCard("playerCard2");

  document.getElementById("submitCard").addEventListener("click", () => {
    saveCard("arrangeCard");
    alert("Card submitted! Player 2 should now see your card.");
  });

  document.getElementById("markNumber").addEventListener("click", () => {
    const markedNumbers = Array.from(
      document.getElementById("playerCard").children
    )
      .filter((cell) => cell.classList.contains("marked"))
      .map((cell) => cell.textContent);
    if (markedNumbers.length > 0) {
      alert(`Marked Numbers: ${markedNumbers.join(", ")}`);
    } else {
      alert("No numbers marked yet.");
    }
  });

  document.getElementById("submitCard2").addEventListener("click", () => {
    saveCard("arrangeCard2");
    alert("Card submitted! Player 1 should now see your card.");
  });

  document.getElementById("markNumber2").addEventListener("click", () => {
    const markedNumbers = Array.from(
      document.getElementById("playerCard2").children
    )
      .filter((cell) => cell.classList.contains("marked"))
      .map((cell) => cell.textContent);
    if (markedNumbers.length > 0) {
      alert(`Marked Numbers: ${markedNumbers.join(", ")}`);
    } else {
      alert("No numbers marked yet.");
    }
  });
});
