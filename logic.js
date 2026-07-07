// lib/logic.js
// Pure functions, no network calls — kept separate from api/chat.js so they
// can be unit tested without mocking HTTP or requiring an API key.

export const ALLOWED_MODES = new Set(["assistant", "recommendation", "briefing"]);
export const ALLOWED_LANGUAGES = new Set([
  "English", "Spanish", "Portuguese", "French",
  "Arabic", "Hindi", "German", "Japanese", "Korean",
]);
export const MAX_MESSAGE_LENGTH = 800;

export function validateRequest({ message, mode, language }) {
  if (!message || typeof message !== "string") {
    return "Field 'message' (string) is required.";
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return `Message too long. Max ${MAX_MESSAGE_LENGTH} characters.`;
  }
  if (mode !== undefined && !ALLOWED_MODES.has(mode)) {
    return `Invalid mode. Allowed: ${[...ALLOWED_MODES].join(", ")}`;
  }
  if (language !== undefined && !ALLOWED_LANGUAGES.has(language)) {
    return `Invalid language. Allowed: ${[...ALLOWED_LANGUAGES].join(", ")}`;
  }
  return null; // valid
}

export function buildSystemPrompt({ mode = "assistant", language = "English", accessibility = false }) {
  const langLine = `Always respond in ${language}, regardless of what language the question is asked in.`;
  const a11yLine = accessibility
    ? "Accessibility mode is ON: use short sentences, plain everyday words, avoid jargon, and structure longer answers as a numbered list."
    : "Keep answers clear and concise.";

  if (mode === "recommendation") {
    return `You are the operational intelligence layer for a FIFA World Cup 2026 stadium's "Gate Board" display.
You will receive live (simulated) crowd density numbers for each stadium gate (0-100 scale).
Write ONE short sentence (max 20 words) recommending the best gate to use right now and why, in a friendly, confident tone.
${langLine}`;
  }

  if (mode === "briefing") {
    return `You are an assistant for stadium volunteers and staff during a FIFA World Cup 2026 match.
A volunteer will give you a short, informal incident note. Turn it into a clear, professional dispatch message for the operations team, in this format:
PRIORITY: [Low/Medium/High]
LOCATION: [extract or say "not specified"]
SUMMARY: [1-2 sentences]
RECOMMENDED ACTION: [1 sentence]
Be factual. Never invent details the volunteer did not mention.
${langLine}`;
  }

  return `You are Stadium Copilot, a helpful GenAI assistant for fans and visitors at a FIFA World Cup 2026 stadium.
You help with: gate/seat navigation, restrooms, accessibility routes, transport (metro/bus/rideshare/parking), food & water points, medical/first-aid, lost & found, and general match-day questions.
If you don't know a specific real-world detail (e.g. exact gate numbers for a real stadium), say so honestly and suggest asking on-site staff or checking official signage — never invent specific facts.
${a11yLine}
${langLine}`;
}
