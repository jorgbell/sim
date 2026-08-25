"use strict";

/*
 * Simulador de Examen
 * ---------------------------------------------------------
 * Formato esperado de questions.json: un array de objetos así:
 * {
 *   "pregunta": "Texto de la pregunta",
 *   "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
 *   "correcta": 0   // índice (0-3) de la opción correcta
 * }
 *
 * Toda la "memoria" de qué preguntas ya han salido vive únicamente
 * en variables de JS (en RAM). Al recargar la página se pierde y
 * se vuelve al estado inicial, tal y como se pidió.
 */

const state = {
  pool: [],              // todas las preguntas cargadas del JSON
  usedIndices: new Set(),// índices del pool ya usados en exámenes anteriores (memoria en RAM)
  currentQuestions: [],  // preguntas del examen actual (con su índice original y estado de respuesta)
};

const els = {
  setupScreen: document.getElementById("setup-screen"),
  examScreen: document.getElementById("exam-screen"),
  poolInfo: document.getElementById("pool-info"),
  numQuestions: document.getElementById("num-questions"),
  startBtn: document.getElementById("start-btn"),
  setupError: document.getElementById("setup-error"),
  questionCount: document.getElementById("question-count"),
  scoreSummary: document.getElementById("score-summary"),
  newExamBtn: document.getElementById("new-exam-btn"),
  newExamCount: document.getElementById("new-exam-count"),
  revealAllBtn: document.getElementById("reveal-all-btn"),
  questionsContainer: document.getElementById("questions-container"),
};

init();

async function init() {
  try {
    const res = await fetch("questions.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("El archivo questions.json está vacío o mal formado.");
    }

    state.pool = data;
    els.poolInfo.textContent =
      `Banco de preguntas cargado: ${data.length} preguntas disponibles.`;
    els.numQuestions.max = String(data.length);
  } catch (err) {
    console.error(err);
    els.poolInfo.textContent =
      "⚠️ No se pudo cargar questions.json. Revisa que el archivo exista y tenga el formato correcto.";
    els.startBtn.disabled = true;
  }

  els.startBtn.addEventListener("click", handleStartExam);
  els.newExamBtn.addEventListener("click", handleNewExam);
  els.revealAllBtn.addEventListener("click", handleRevealAll);
}

function handleStartExam() {
  const n = parseInt(els.numQuestions.value, 10);
  const error = validateCount(n);
  if (error) {
    els.setupError.textContent = error;
    return;
  }
  els.setupError.textContent = "";

  els.newExamCount.max = els.numQuestions.max;
  els.newExamCount.value = String(n);

  buildExam(n);
  showExamScreen();
}

function handleNewExam() {
  const n = parseInt(els.newExamCount.value, 10);
  const error = validateCount(n);
  if (error) {
    alert(error);
    return;
  }
  buildExam(n);
  renderExam();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Revela de golpe la respuesta de todas las preguntas del examen actual
 * que todavía no se hayan corregido individualmente.
 */
function handleRevealAll() {
  const cards = els.questionsContainer.querySelectorAll(".question-card");
  cards.forEach((card, qIndex) => {
    const q = state.currentQuestions[qIndex];
    if (!q || q.answered) return;

    const title = card.querySelector(".question-title");
    const list = card.querySelector(".options-list");
    const revealBtn = card.querySelector(".btn-reveal");
    revealAnswer(q, title, list, revealBtn);
  });
}

function validateCount(n) {
  if (!Number.isInteger(n) || n <= 0) {
    return "Introduce un número entero mayor que 0.";
  }
  if (n > state.pool.length) {
    return `Solo hay ${state.pool.length} preguntas disponibles en el banco.`;
  }
  return null;
}

/**
 * Elige N preguntas al azar del pool, evitando repetir las que ya
 * salieron en exámenes anteriores de esta misma sesión (mientras
 * queden suficientes preguntas sin usar). Si no hay suficientes
 * preguntas "frescas", se reinicia la memoria de usadas.
 */
function buildExam(n) {
  const allIndices = state.pool.map((_, i) => i);
  let available = allIndices.filter((i) => !state.usedIndices.has(i));

  if (available.length < n) {
    // Ya no quedan suficientes preguntas nuevas: reiniciamos la memoria
    state.usedIndices.clear();
    available = allIndices.slice();
  }

  const chosenIndices = shuffle(available).slice(0, n);
  chosenIndices.forEach((i) => state.usedIndices.add(i));

  state.currentQuestions = chosenIndices.map((originalIndex) => ({
    originalIndex,
    pregunta: state.pool[originalIndex].pregunta,
    opciones: state.pool[originalIndex].opciones,
    correcta: state.pool[originalIndex].correcta,
    answered: false,
    selected: null,
  }));
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showExamScreen() {
  els.setupScreen.classList.add("hidden");
  els.examScreen.classList.remove("hidden");
  renderExam();
}

function renderExam() {
  els.questionCount.textContent = String(state.currentQuestions.length);
  els.questionsContainer.innerHTML = "";

  state.currentQuestions.forEach((q, qIndex) => {
    els.questionsContainer.appendChild(renderQuestionCard(q, qIndex));
  });

  updateScoreSummary();
}

function renderQuestionCard(q, qIndex) {
  const card = document.createElement("div");
  card.className = "question-card";

  // --- Cabecera: título + botón revelar ---
  const header = document.createElement("div");
  header.className = "question-header";

  const title = document.createElement("h3");
  title.className = "question-title";
  title.textContent = `${qIndex + 1}. ${q.pregunta}`;
  header.appendChild(title);

  const revealBtn = document.createElement("button");
  revealBtn.className = "btn btn-reveal";
  revealBtn.textContent = "Revelar respuesta";
  header.appendChild(revealBtn);

  card.appendChild(header);

  // --- Lista de opciones ---
  const list = document.createElement("ul");
  list.className = "options-list";
  const groupName = `question-${qIndex}`;

  q.opciones.forEach((optionText, optIndex) => {
    const li = document.createElement("li");

    const label = document.createElement("label");

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = groupName;
    radio.value = String(optIndex);
    radio.addEventListener("change", () => {
      q.selected = optIndex;
    });

    label.appendChild(radio);
    label.appendChild(document.createTextNode(optionText));
    li.appendChild(label);
    list.appendChild(li);
  });

  card.appendChild(list);

  revealBtn.addEventListener("click", () => {
    revealAnswer(q, title, list, revealBtn);
  });

  // Si esta pregunta ya se había respondido (p. ej. al re-renderizar),
  // restauramos el estado visual.
  if (q.answered) {
    applyRevealedStyles(q, title, list, revealBtn);
  }

  return card;
}

function revealAnswer(q, title, list, revealBtn) {
  if (q.answered) return;

  const checked = list.querySelector('input[type="radio"]:checked');
  q.selected = checked ? parseInt(checked.value, 10) : null;
  q.answered = true;

  applyRevealedStyles(q, title, list, revealBtn);
  updateScoreSummary();
}

function applyRevealedStyles(q, title, list, revealBtn) {
  const isCorrect = q.selected === q.correcta;

  title.classList.remove("title-correct", "title-incorrect");
  title.classList.add(isCorrect ? "title-correct" : "title-incorrect");

  const items = list.querySelectorAll("li");
  items.forEach((li, optIndex) => {
    const radio = li.querySelector('input[type="radio"]');
    radio.disabled = true;

    if (optIndex === q.correcta) {
      li.classList.add("opt-correct");
    } else if (optIndex === q.selected) {
      li.classList.add("opt-incorrect");
    }
  });

  list.classList.add("answered");
  revealBtn.disabled = true;
  revealBtn.textContent = isCorrect ? "✔ Correcta" : "✘ Incorrecta";
}

function updateScoreSummary() {
  const answered = state.currentQuestions.filter((q) => q.answered);
  const correct = answered.filter((q) => q.selected === q.correcta);
  els.scoreSummary.textContent =
    `Aciertos: ${correct.length} / ${answered.length} corregidas` +
    ` (de ${state.currentQuestions.length} preguntas)`;
}
