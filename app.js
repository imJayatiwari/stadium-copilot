// app.js — Stadium Copilot frontend
// No API key ever lives here. All AI calls go through /api/chat (server-side).

const GATES = ["Gate A", "Gate B", "Gate C", "Gate D", "Gate E", "Gate F"];
let gateLevels = {};
GATES.forEach((g) => (gateLevels[g] = Math.floor(20 + Math.random() * 40)));

let currentLanguage = "English";
let accessibilityOn = false;

// ---------- Utility ----------
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function callAI({ message, mode, language, accessibility }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode, language, accessibility }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data.reply;
}

// ---------- Tabs ----------
const tabs = document.querySelectorAll(".tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    document.querySelectorAll(".panel").forEach((p) => {
      p.classList.remove("is-active");
      p.hidden = true;
    });
    const panel = document.getElementById(tab.dataset.panel);
    panel.hidden = false;
    panel.classList.add("is-active");
  });
});

// ---------- Language & accessibility ----------
document.getElementById("languageSelect").addEventListener("change", (e) => {
  currentLanguage = e.target.value;
});

const a11yBtn = document.getElementById("a11yToggle");
a11yBtn.addEventListener("click", () => {
  accessibilityOn = !accessibilityOn;
  a11yBtn.setAttribute("aria-pressed", String(accessibilityOn));
  document.body.classList.toggle("a11y-on", accessibilityOn);
});

// ---------- Chat ----------
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");

function appendMessage(text, cls) {
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  div.innerHTML = escapeHTML(text).replace(/\n/g, "<br>");
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;

  if (accessibilityOn && cls === "bot" && "speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }
}

async function sendQuestion(text) {
  if (!text.trim()) return;
  appendMessage(text, "user");
  chatInput.value = "";
  chatSend.disabled = true;

  try {
    const reply = await callAI({
      message: text,
      mode: "assistant",
      language: currentLanguage,
      accessibility: accessibilityOn,
    });
    appendMessage(reply, "bot");
  } catch (err) {
    appendMessage("Sorry — I couldn't reach the assistant. " + err.message, "error");
  } finally {
    chatSend.disabled = false;
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendQuestion(chatInput.value);
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => sendQuestion(chip.textContent));
});

appendMessage(
  "Hi! I'm Stadium Copilot. Ask me about gates, seating, accessibility, transport, food, or medical points — I'll answer in your selected language.",
  "bot"
);

// ---------- Gate board ----------
const gateBoard = document.getElementById("gateBoard");
const opsTableBody = document.getElementById("opsTableBody");
const gateRecommendationText = document.getElementById("gateRecommendationText");

function levelClass(v) {
  if (v < 40) return "level-low";
  if (v < 70) return "level-med";
  return "level-high";
}
function levelLabel(v) {
  if (v < 40) return "Light";
  if (v < 70) return "Moderate";
  return "Busy";
}

function renderGateBoard() {
  gateBoard.innerHTML = "";
  opsTableBody.innerHTML = "";

  GATES.forEach((gate) => {
    const v = gateLevels[gate];
    const cls = levelClass(v);

    const card = document.createElement("div");
    card.className = `gate-card ${cls}`;
    card.setAttribute("role", "row");
    card.innerHTML = `
      <div class="gate-name">${gate}</div>
      <div class="gate-value">${v}</div>
      <div class="gate-status">${levelLabel(v)}</div>
    `;
    gateBoard.appendChild(card);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${gate}</td>
      <td class="mono">${v}/100</td>
      <td>${levelLabel(v)}</td>
    `;
    opsTableBody.appendChild(row);
  });
}

function driftGateLevels() {
  GATES.forEach((gate) => {
    const delta = Math.floor(Math.random() * 15) - 7;
    gateLevels[gate] = Math.max(5, Math.min(98, gateLevels[gate] + delta));
  });
  renderGateBoard();
}

async function refreshRecommendation() {
  const summary = GATES.map((g) => `${g}: ${gateLevels[g]}/100`).join(", ");
  try {
    const reply = await callAI({
      message: `Current gate crowd levels — ${summary}. Which gate should a fan use right now?`,
      mode: "recommendation",
      language: currentLanguage,
    });
    gateRecommendationText.textContent = reply;
  } catch (err) {
    gateRecommendationText.textContent =
      "AI recommendation unavailable right now — check the board above for the lowest number.";
  }
}

renderGateBoard();
refreshRecommendation();
setInterval(() => {
  driftGateLevels();
}, 6000);
setInterval(refreshRecommendation, 15000);

// ---------- Volunteer briefing ----------
const briefingForm = document.getElementById("briefingForm");
const briefingInput = document.getElementById("briefingInput");
const briefingOutput = document.getElementById("briefingOutput");

briefingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const note = briefingInput.value.trim();
  if (!note) return;

  briefingOutput.hidden = false;
  briefingOutput.textContent = "Generating dispatch message…";

  try {
    const reply = await callAI({
      message: note,
      mode: "briefing",
      language: currentLanguage,
    });
    briefingOutput.textContent = reply;
  } catch (err) {
    briefingOutput.textContent = "Couldn't generate a briefing: " + err.message;
  }
});
