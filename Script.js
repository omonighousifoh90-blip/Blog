
/* =========================
   WATCHEARN JAVASCRIPT
========================= */

const REWARD_CENTS = 10;
const DAILY_LIMIT = 3;
const MIN_WITHDRAWAL_CENTS = 1600;
const WATCH_SECONDS = 10;

// Get today's date
function getToday() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

// Load saved demo information
function loadData() {
  try {
    return JSON.parse(
      localStorage.getItem("watchEarnData")
    ) || null;
  } catch {
    return null;
  }
}

let data = loadData() || {
  balance: 0,
  total: 0,
  date: getToday(),
  watched: []
};

// Save information
function saveData() {
  localStorage.setItem(
    "watchEarnData",
    JSON.stringify(data)
  );
}

// Reset daily video count
function checkNewDay() {
  if (data.date !== getToday()) {
    data.date = getToday();
    data.watched = [];
    saveData();
  }
}

// Format money
function money(cents) {
  return "$" + (cents / 100).toFixed(2);
}

// Update dashboard
function updateDashboard() {
  checkNewDay();

  document.getElementById("balance").textContent =
    money(data.balance);

  document.getElementById("walletBalance").textContent =
    money(data.balance);

  document.getElementById("total").textContent =
    money(data.total);

  document.getElementById("watched").textContent =
    data.watched.length + " / " + DAILY_LIMIT;

  for (let i = 1; i <= DAILY_LIMIT; i++) {
    const button = document.getElementById("btn" + i);

    if (!button) continue;

    if (data.watched.includes(i)) {
      button.textContent = "Completed";
      button.disabled = true;
    } else if (data.watched.length >= DAILY_LIMIT) {
      button.textContent = "Daily Limit Reached";
      button.disabled = true;
    } else {
      button.textContent = "Start Watching";
      button.disabled = false;
    }
  }
}

// Demo video reward
function watchVideo(id) {
  checkNewDay();

  if (
    data.watched.includes(id) ||
    data.watched.length >= DAILY_LIMIT
  ) {
    return;
  }

  const button = document.getElementById("btn" + id);

  button.disabled = true;

  let seconds = WATCH_SECONDS;

  button.textContent = "Watching: " + seconds + "s";

  const timer = setInterval(function() {
    seconds--;

    button.textContent = "Watching: " + seconds + "s";

    if (seconds <= 0) {
      clearInterval(timer);

      // Record demo completion
      checkNewDay();

      if (
        data.watched.includes(id) ||
        data.watched.length >= DAILY_LIMIT
      ) {
        updateDashboard();
        return;
      }

      data.watched.push(id);

      data.balance += REWARD_CENTS;
      data.total += REWARD_CENTS;

      saveData();
      updateDashboard();

      alert(
        "Congratulations!\n\n" +
        "$0.10 demo reward added to your wallet."
      );
    }
  }, 1000);
}

// Demo withdrawal interface
function withdraw() {
  const bank =
    document.getElementById("account").value.trim();

  const accountNumber =
    document.getElementById("accountNumber").value.trim();

  const accountName =
    document.getElementById("accountName").value.trim();

  const message =
    document.getElementById("withdrawMessage");

  if (!bank || !accountNumber || !accountName) {
    message.textContent =
      "Please complete all withdrawal fields.";

    message.style.color = "#f3c969";
    return;
  }

  if (!/^\d{6,20}$/.test(accountNumber)) {
    message.textContent =
      "Please enter a valid account number.";

    message.style.color = "#ff7676";
    return;
  }

  if (data.balance < MIN_WITHDRAWAL_CENTS) {
    message.textContent =
      "Minimum withdrawal is $16.00. Your current demo balance is " +
      money(data.balance);

    message.style.color = "#f3c969";
    return;
  }

  message.textContent =
    "This is a demonstration. No real withdrawal request or payment has been made.";

  message.style.color = "#10d99a";
}

// Initialize website
document.addEventListener("DOMContentLoaded", function() {
  updateDashboard();
});
      
