// tests/logic.test.js
// Run with: node --test tests/logic.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { validateRequest, buildSystemPrompt } from "../lib/logic.js";

test("validateRequest rejects missing message", () => {
  const err = validateRequest({ message: undefined });
  assert.match(err, /message.*required/i);
});

test("validateRequest rejects non-string message", () => {
  const err = validateRequest({ message: 12345 });
  assert.match(err, /required/i);
});

test("validateRequest rejects message over max length", () => {
  const longMsg = "a".repeat(801);
  const err = validateRequest({ message: longMsg });
  assert.match(err, /too long/i);
});

test("validateRequest accepts message at exactly the max length", () => {
  const msg = "a".repeat(800);
  const err = validateRequest({ message: msg });
  assert.equal(err, null);
});

test("validateRequest rejects unknown mode", () => {
  const err = validateRequest({ message: "hi", mode: "hack" });
  assert.match(err, /invalid mode/i);
});

test("validateRequest rejects unsupported language", () => {
  const err = validateRequest({ message: "hi", language: "Klingon" });
  assert.match(err, /invalid language/i);
});

test("validateRequest passes for a normal, valid request", () => {
  const err = validateRequest({ message: "Where is gate C?", mode: "assistant", language: "English" });
  assert.equal(err, null);
});

test("buildSystemPrompt includes chosen language for assistant mode", () => {
  const prompt = buildSystemPrompt({ mode: "assistant", language: "French" });
  assert.match(prompt, /respond in French/);
  assert.match(prompt, /Stadium Copilot/);
});

test("buildSystemPrompt adds accessibility instructions when enabled", () => {
  const prompt = buildSystemPrompt({ mode: "assistant", language: "English", accessibility: true });
  assert.match(prompt, /Accessibility mode is ON/);
});

test("buildSystemPrompt omits accessibility instructions when disabled", () => {
  const prompt = buildSystemPrompt({ mode: "assistant", language: "English", accessibility: false });
  assert.doesNotMatch(prompt, /Accessibility mode is ON/);
});

test("buildSystemPrompt produces a distinct prompt for recommendation mode", () => {
  const prompt = buildSystemPrompt({ mode: "recommendation", language: "English" });
  assert.match(prompt, /Gate Board/);
  assert.match(prompt, /max 20 words/);
});

test("buildSystemPrompt produces a distinct, structured prompt for briefing mode", () => {
  const prompt = buildSystemPrompt({ mode: "briefing", language: "English" });
  assert.match(prompt, /PRIORITY:/);
  assert.match(prompt, /never invent details/i);
});
