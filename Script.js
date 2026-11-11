
/* =================================
   WATCHEARN AUTHENTICATION & APP
   FRONT-END DEMONSTRATION ONLY
================================= */

const REWARD = 10; // 10 cents
const DAILY_LIMIT = 3;
const MIN_WITHDRAWAL = 1600;
const WATCH_SECONDS = 10;

const $ = id => document.getElementById(id);

let currentUser = null;
let timer = null;

// LOCAL STORAGE HELPERS

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem("we_accounts")) || [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  localStorage.setItem("we_accounts", JSON.stringify(accounts));
}

function getUsersData() {
  try {
    return JSON.parse(localStorage.getItem("we_wallets")) || {};
  } catch {
    return {};
  }
}

function saveUsersData(wallets) {
  localStorage.setItem("we_wallets", JSON.stringify(wallets));
}

// DATE

function today() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

// MONEY

function formatMoney(cents) {
  return "$" + (cents / 100).toFixed(2);
}

// USER WALLET

function getWallet() {
  const wallets = getUsersData();

  if (!wallets[currentUser.email]) {
    wallets[currentUser.email] = {
      balance: 0,
      total: 0,
      date: today(),
      watched: []
    };

    saveUsersData(wallets);
  }

  const wallet = wallets[currentUser.email];

  if (wallet.date !== today()) {
    wallet.date = today();
    wallet.watched = [];
    saveUsersData(wallets);
  }

  return wallet;
}

function updateWallet(wallet) {
  const wallets = getUsersData();

  wallets[currentUser.email] = wallet;

  saveUsersData(wallets);
}

// PASSWORD HASH FOR DEMO ONLY

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

// SHOW AUTH MESSAGE

function showMessage(message, color = "#f2c76a") {
  $("authMessage").textContent = message;
  $("authMessage").style.color = color;
}

function showAuth(type) {
  $("authSection").classList.remove("hidden");
  $("dashboard").classList.add("hidden");

  $("signupForm").classList.toggle("hidden", type !== "signup");
  $("loginForm").classList.toggle("hidden", type !== "login");

  $("authTitle").textContent =
    type === "signup" ? "Create Your Account" : "Welcome Back";

  $("authSubtitle").textContent =
    type === "signup"
      ? "Join WatchEarn and explore video rewards."
      : "Login to access your WatchEarn dashboard.";

  showMessage("");
}

// SIGN UP

$("signupForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = $("signupName").value.trim();
  const email = $("signupEmail").value.trim().toLowerCase();
  const password = $("signupPassword").value;
  const confirm = $("confirmPassword").value;

  if (password.length < 6) {
    showMessage("Password must contain at least 6 characters.");
    return;
  }

  if (password !== confirm) {
    showMessage("Passwords do not match.");
    return;
  }

  const accounts = getAccounts();

  if (accounts.some(user => user.email === email)) {
    showMessage("This email already has an account. Please login.");
    return;
  }

  if (!crypto.subtle) {
    showMessage("Secure browser functions unavailable. Open the site using HTTPS.");
    return;
  }

  const passwordHash = await hashPassword(password);

  accounts.push({
    name,
    email,
    passwordHash
  });

  saveAccounts(accounts);

  $("signupForm").reset();

  showAuth("login");
  $("loginEmail").value = email;

  showMessage(
    "Account created successfully! Please login.",
    "#10d99a"
  );
});

// LOGIN

$("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;

  const accounts = getAccounts();

  const user = accounts.find(item => item.email === email);

  if (!user) {
    showMessage("Account not found. Please create an account first.");
    return;
  }

  if (!crypto.subtle) {
    showMessage("Secure browser functions unavailable. Open using HTTPS.");
    return;
  }

  const passwordHash = await hashPassword(password);

  if (user.passwordHash !== passwordHash) {
    showMessage("Incorrect password. Please try again.");
    return;
  }

  currentUser = user;

  sessionStorage.setItem("we_session", email);

  $("loginForm").reset();

  openDashboard();
});

// SWITCH AUTHENTICATION

$("showLogin").addEventListener("click", function(e) {
  e.preventDefault();
  showAuth("login");
});

$("showSignup").addEventListener("click", function(e) {
  e.preventDefault();
  showAuth("signup");
});

// OPEN DASHBOARD

function openDashboard() {
  $("authSection").classList.add("hidden");
  $("dashboard").classList.remove("hidden");

  $("userName").textContent = currentUser.name;
  $("headerUser").textContent = currentUser.email;

  updateDashboard();

  window.scrollTo(0, 0);
}

// DASHBOARD

function updateDashboard() {
  if (!currentUser) return;

  const wallet = getWallet();

  $("balance").textContent = formatMoney(wallet.balance);
  $("walletBalance").textContent = formatMoney(wallet.balance);
  $("total").textContent = formatMoney(wallet.total);

  $("watched").textContent =
    wallet.watched.length + " / " + DAILY_LIMIT;

  for (let i = 1; i <= DAILY_LIMIT; i++) {
    const button = $("btn" + i);

    if (wallet.watched.includes(i)) {
      button.textContent = "Completed";
      button.disabled = true;
    } else if (wallet.watched.length >= DAILY_LIMIT) {
      button.textContent = "Daily Limit Reached";
      button.disabled = true;
    } else {
      button.textContent = "Start Watching";
      button.disabled = false;
    }
  }
}

// DEMO VIDEO REWARD

function watchVideo(id) {
  if (!currentUser || timer) return;

  const wallet = getWallet();

  if (
    wallet.watched.includes(id) ||
    wallet.watched.length >= DAILY_LIMIT
  ) {
    return;
  }

  const button = $("btn" + id);

  button.disabled = true;

  let seconds = WATCH_SECONDS;

  button.textContent = "Watching: " + seconds + "s";

  timer = setInterval(function() {
    seconds--;

    button.textContent = "Watching: " + seconds + "s";

    if (seconds <= 0) {
      clearInterval(timer);
      timer = null;

      const updatedWallet = getWallet();

      if (
        updatedWallet.watched.includes(id) ||
        updatedWallet.watched.length >= DAILY_LIMIT
      ) {
        updateDashboard();
        return;
      }

      updatedWallet.watched.push(id);
      updatedWallet.balance += REWARD;
      updatedWallet.total += REWARD;

      updateWallet(updatedWallet);
      updateDashboard();

      alert("Demo reward added: $0.10");
    }
  }, 1000);
}

// WITHDRAWAL ELIGIBILITY DEMO

$("withdrawForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const message = $("withdrawMessage");
  const wallet = getWallet();

  if (wallet.balance < MIN_WITHDRAWAL) {
    message.style.color = "#f2c76a";

    message.textContent =
      "Your demo balance is " +
      formatMoney(wallet.balance) +
      ". You need $16.00 to meet the demo threshold.";

    return;
  }

  message.style.color = "#10d99a";

  message.textContent =
    "Your demo balance meets the $16 threshold. " +
    "Real withdrawals are not available in this demonstration.";

  $("withdrawForm").reset();
});

// LOGOUT

$("logoutBtn").addEventListener("click", function() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  sessionStorage.removeItem("we_session");

  currentUser = null;

  $("headerUser").textContent = "";

  showAuth("login");

  window.scrollTo(0, 0);
});

// RESTORE SESSION FOR CURRENT TAB

async function restoreSession() {
  const email = sessionStorage.getItem("we_session");

  if (!email) {
    showAuth("signup");
    return;
  }

  const user = getAccounts().find(item => item.email === email);

  if (!user) {
    sessionStorage.removeItem("we_session");
    showAuth("signup");
    return;
  }

  currentUser = user;
  openDashboard();
}

// START

restoreSession();
