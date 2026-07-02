const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const supabaseConfig = window.SPANISH_SUPABASE_CONFIG || {};
const hasSupabaseConfig =
  supabaseConfig.url &&
  supabaseConfig.anonKey &&
  !supabaseConfig.url.includes("YOUR_PROJECT_ID") &&
  !supabaseConfig.anonKey.includes("YOUR_SUPABASE_ANON_KEY");
const supabaseClient =
  hasSupabaseConfig && window.supabase
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : null;

const state = {
  checked: Number(localStorage.getItem("spanish.checked") || 0),
  correct: Number(localStorage.getItem("spanish.correct") || 0),
  cloze: null,
  tenses: [],
  reading: null,
  writingPrompt: null,
  listening: null,
  cardIndex: 0,
  cardFlipped: false,
  authMode: "signup",
  appReady: false
};

const clozeBank = [
  {
    topic: "environment",
    title: "Cuidar el planeta",
    focus: "prepositions, subjunctive, nouns",
    parts: [
      ["Hoy en dia, muchas personas estan mas preocupadas ", ["por"], " el medioambiente."],
      ["Es importante que todos ", ["hagamos", "actuemos", "colaboremos"], " algo para proteger la Tierra."],
      ["Una accion sencilla es reducir el ", ["uso", "consumo", "empleo"], " de plasticos."],
      ["Debemos separar los residuos ", ["en"], " cuatro categorias."],
      ["Usar el transporte publico reduce la ", ["contaminacion", "polucion"], " del aire."],
      ["Cada ", ["vez"], " mas gente compra productos locales."],
      ["Esto ayuda ", ["a", "para"], " reducir las emisiones."],
      ["Los alimentos no tienen que venir de lugares ", ["lejanos", "distantes", "remotos"], "."]
    ]
  },
  {
    topic: "leisure",
    title: "Tiempo libre y cultura",
    focus: "past tenses, fixed phrases, subjunctive",
    parts: [
      ["Durante el curso casi no ", ["tuve"], " tiempo para mis aficiones."],
      ["Siempre me ", ["habia"], " gustado hacer actividades al aire libre."],
      ["Queria apuntarme ", ["a"], " varias actividades culturales."],
      ["Mi amigo cree que es importante que yo ", ["haga", "realice"], " algo creativo."],
      ["No sabia si me ", ["iba"], " a gustar el ambiente."],
      ["Conoci a personas con intereses similares a los ", ["mios"], "."],
      ["Es fundamental tener tiempo libre ", ["de"], " forma equilibrada."],
      ["El curso me permite ", ["ampliar", "desarrollar"], " mis conocimientos culturales."]
    ]
  },
  {
    topic: "travel",
    title: "Vacaciones sin estres",
    focus: "indefinido/imperfecto, connectors, travel vocabulary",
    parts: [
      ["Lara y su familia ", ["decidieron"], " viajar en tren al norte de Espana."],
      ["Eligieron esa opcion porque ", ["querian"], " reducir el impacto ambiental."],
      ["El tren ", ["salio"], " puntual, pero luego hubo una averia."],
      ["Cuando llegaron, el cielo ", ["estaba"], " nublado."],
      ["Como ", ["llovia"], " por la tarde, buscaron alternativas."],
      ["Entraron ", ["en"], " una biblioteca con una exposicion."],
      ["Lara se dio cuenta ", ["de"], " que habia llevado demasiada ropa."],
      ["Lo mas importante fue aprender ", ["a"], " adaptarse."]
    ]
  }
];

const tenseBank = [
  {
    sentence: "Ayer Lara ___ los billetes con antelacion.",
    options: ["compro", "compraba"],
    answer: "compro",
    label: "indefinido",
    why: "Ayer marks a completed past event."
  },
  {
    sentence: "Antes, la mayoria de las personas solo ___ lo necesario.",
    options: ["compraron", "compraban"],
    answer: "compraban",
    label: "imperfecto",
    why: "Antes describes a repeated past habit."
  },
  {
    sentence: "El cielo ___ nublado cuando llegaron.",
    options: ["estuvo", "estaba"],
    answer: "estaba",
    label: "imperfecto",
    why: "Weather/background description uses imperfecto."
  },
  {
    sentence: "Finalmente, ellos ___ dar un paseo por el paseo maritimo.",
    options: ["decidieron", "decidian"],
    answer: "decidieron",
    label: "indefinido",
    why: "Finally advances the story with a completed decision."
  },
  {
    sentence: "Cuando era pequeno, Carlos ___ trabajar con las manos.",
    options: ["prefirio", "preferia"],
    answer: "preferia",
    label: "imperfecto",
    why: "A childhood preference or state is imperfecto."
  },
  {
    sentence: "El primer dia, el tren ___ casi una hora parado.",
    options: ["estuvo", "estaba"],
    answer: "estuvo",
    label: "indefinido",
    why: "A bounded duration in the past takes indefinido."
  },
  {
    sentence: "Mientras su madre leia, Lara ___ los horarios en el movil.",
    options: ["miro", "miraba"],
    answer: "miraba",
    label: "imperfecto",
    why: "Mientras often frames simultaneous ongoing actions."
  },
  {
    sentence: "De repente, los estudiantes ___ que cambiar su plan.",
    options: ["tuvieron", "tenian"],
    answer: "tuvieron",
    label: "indefinido",
    why: "De repente signals a new completed event."
  },
  {
    sentence: "La actividad cultural ___ beneficiosa para todos.",
    options: ["fue", "era"],
    answer: "era",
    label: "imperfecto",
    why: "Description/evaluation of a situation uses imperfecto."
  },
  {
    sentence: "El ano pasado el instituto ___ una feria cultural.",
    options: ["organizo", "organizaba"],
    answer: "organizo",
    label: "indefinido",
    why: "El ano pasado points to a completed event."
  }
];

const readingItems = {
  tf: [
    {
      title: "Redes sociales",
      text: "Las redes sociales permiten comunicarse e informarse con rapidez, pero tambien pueden causar problemas si se usan sin control. Muchos jovenes se comparan con los demas y sienten presion por mostrar una vida perfecta. Por eso, los expertos recomiendan limitar el tiempo de uso y practicar actividades fuera de internet.",
      statements: [
        { text: "Las redes sociales solo sirven para entretenerse.", answer: "F", correction: "Permiten comunicarse e informarse con rapidez." },
        { text: "Algunos jovenes sienten presion por mostrar una vida perfecta.", answer: "V", correction: "" },
        { text: "Los expertos recomiendan pasar mas tiempo conectado.", answer: "F", correction: "Recomiendan limitar el tiempo de uso." }
      ]
    },
    {
      title: "Consumo responsable",
      text: "En Espana, las rebajas tradicionales de enero y julio siguen siendo populares. Sin embargo, nuevas campanas como Black Friday tambien forman parte del calendario comercial. Al mismo tiempo, cada vez mas consumidores buscan productos locales, eticos o de segunda mano.",
      statements: [
        { text: "Black Friday ha sustituido completamente las rebajas tradicionales.", answer: "F", correction: "Se ha sumado a las rebajas tradicionales." },
        { text: "Hay mas interes por comprar productos locales o eticos.", answer: "V", correction: "" },
        { text: "Las rebajas de enero y julio ya no existen.", answer: "F", correction: "Siguen siendo populares." }
      ]
    }
  ],
  short: [
    {
      title: "Vacaciones con plan",
      text: "Este verano, una familia decidio viajar en tren para reducir su impacto ambiental y evitar las colas del aeropuerto. Reservaron un alojamiento con cocina para ahorrar dinero. Aunque el tren se retraso y llovio varios dias, buscaron actividades alternativas como visitar una exposicion y un mercado cubierto.",
      questions: [
        { q: "Da una razon por la que la familia eligio el tren.", keys: ["impacto ambiental", "colas", "aeropuerto", "reducir"] },
        { q: "Como les ayudo el alojamiento con cocina?", keys: ["ahorrar", "dinero", "desayunos", "cocina"] },
        { q: "Que hicieron cuando llovio?", keys: ["exposicion", "mercado", "alternativas"] }
      ]
    },
    {
      title: "Metodos de aprendizaje",
      text: "Daniel mejoro sus notas gracias a un programa de tutorias entre alumnos. Los estudiantes mayores le ensenaron tecnicas de estudio y planificacion. Al principio le costo adaptarse al aula invertida porque en casa se distraia con el movil.",
      questions: [
        { q: "Que cambio ayudo mas a Daniel?", keys: ["tutorias", "alumnos"] },
        { q: "Que le ensenaron los estudiantes mayores?", keys: ["tecnicas", "estudio", "planificacion"] },
        { q: "Por que le costo adaptarse al aula invertida?", keys: ["movil", "distraia", "casa"] }
      ]
    }
  ]
};

const writingPrompts = [
  {
    type: "Formal letter",
    prompt: "Escribe una carta formal al director/a para proponer nuevas actividades culturales el proximo curso.",
    bullets: [
      "motivo de la carta y referencia a la vida cultural del instituto",
      "una actividad cultural que se hizo en anos pasados",
      "una nueva actividad concreta y por que beneficiaria a los estudiantes",
      "tu opinion sobre la cultura en la educacion",
      "una recomendacion final respetuosa"
    ]
  },
  {
    type: "Past-tense story",
    prompt: "Cuenta una historia sobre un viaje o una salida que no salio como estaba planeada.",
    bullets: [
      "quien participo y donde estaban",
      "que plan tenian al principio",
      "que problema ocurrio",
      "como reaccionaron y que hicieron despues",
      "una reflexion final"
    ]
  },
  {
    type: "Opinion task",
    prompt: "Escribe sobre si los jovenes usan bien su tiempo libre.",
    bullets: [
      "introduce el tema",
      "menciona una actividad digital y un posible riesgo",
      "menciona una actividad cultural o deportiva",
      "da tu opinion con una razon",
      "termina con una recomendacion"
    ]
  }
];

const grammarCards = [
  { topic: "prepositions", title: "por", body: "Use with cause, exchange, duration, movement through: preocupado por, por dos semanas, pasar por el parque." },
  { topic: "prepositions", title: "para", body: "Use with purpose, recipient, deadline, opinion: para estudiar, para mi madre, para manana, para ser invierno." },
  { topic: "prepositions", title: "ayudar a + infinitive", body: "Esto ayuda a reducir las emisiones. Do not write ayuda reducir." },
  { topic: "serestar", title: "ser", body: "Identity, origin, material, time, permanent characteristic: soy estudiante, es de Espana, es importante." },
  { topic: "serestar", title: "estar", body: "Location, temporary state, progressive: estoy cansado, esta en clase, estoy estudiando." },
  { topic: "subjunctive", title: "es importante que", body: "Different subject plus wish/recommendation/necessity: Es importante que los jovenes hagan deporte." },
  { topic: "subjunctive", title: "para que", body: "Purpose with a new subject uses subjunctive: Lo explico para que todos entiendan." },
  { topic: "pronouns", title: "direct + indirect objects", body: "me/te/se/nos/os/se + lo/la/los/las: Te preparo la comida -> Te la preparo." },
  { topic: "pronouns", title: "possessives", body: "mio, tuyo, suyo, nuestro agree with the noun: intereses similares a los mios." }
];

const flashcards = [
  ["decir", "to say"],
  ["hacer", "to do / make"],
  ["darse cuenta de", "to realise"],
  ["apuntarse a", "to sign up for"],
  ["al aire libre", "outdoors"],
  ["de forma equilibrada", "in a balanced way"],
  ["sin embargo", "however"],
  ["por lo tanto", "therefore"],
  ["boquiabierto", "open-mouthed / shocked"],
  ["tacano", "stingy"],
  ["trabajador", "hardworking"],
  ["ampliar", "to broaden / expand"]
];

const listeningBank = [
  {
    topic: "technology",
    transcript: "La tecnologia ha cambiado la forma de comunicarnos y trabajar. La inteligencia artificial puede ayudar en medicina, por ejemplo en el diagnostico de enfermedades, pero necesita regulacion y educacion digital.",
    question: "Que ejemplo se menciona sobre la inteligencia artificial en medicina?",
    options: ["crear nuevos medicamentos", "diagnosticar enfermedades", "hacer cirugias a distancia"],
    answer: "diagnosticar enfermedades"
  },
  {
    topic: "leisure",
    transcript: "Marcos hizo senderismo en un parque natural cerca de Segovia porque llevaba meses sin ver a sus amigos. Lucia, en cambio, participo en una limpieza de playa con una asociacion local.",
    question: "Por que Marcos fue a hacer senderismo?",
    options: ["para ponerse al dia con sus amigos", "para ganar dinero", "para preparar un examen"],
    answer: "para ponerse al dia con sus amigos"
  },
  {
    topic: "work",
    transcript: "Carlos dejo su trabajo de camarero porque queria probar otros oficios. Ahora arregla cables y luces, pero en el futuro quiere dirigir su propio negocio.",
    question: "A que se dedica Carlos actualmente?",
    options: ["arregla cables y luces", "trabaja en una peluqueria", "estudia en la universidad"],
    answer: "arregla cables y luces"
  }
];

function setAuthMessage(message, type = "") {
  const messageNode = $("#auth-message");
  if (!messageNode) return;
  messageNode.textContent = message;
  messageNode.className = `result-note ${type}`;
}

function updateAuthMode() {
  const isSignup = state.authMode === "signup";
  $("#auth-title").textContent = isSignup ? "Create your account" : "Sign in";
  $("#auth-submit").textContent = isSignup ? "Create account" : "Sign in";
  $("#auth-mode-toggle").textContent = isSignup ? "Already have an account? Sign in" : "Need an account? Create one";
  $("#auth-password").autocomplete = isSignup ? "new-password" : "current-password";
  setAuthMessage("");
}

function showAuthScreen() {
  $("#auth-screen").classList.remove("hidden");
  $("#app-shell").classList.add("hidden");
}

function showApp(user) {
  $("#auth-screen").classList.add("hidden");
  $("#app-shell").classList.remove("hidden");
  $("#user-email").textContent = user?.email || "Signed in";
  initApp();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setAuthMessage("Supabase is not configured yet. Add your project URL and anon key in config.js.", "bad");
    return;
  }

  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;
  $("#auth-submit").disabled = true;
  setAuthMessage(state.authMode === "signup" ? "Creating account..." : "Signing in...");

  const authCall =
    state.authMode === "signup"
      ? supabaseClient.auth.signUp({ email, password })
      : supabaseClient.auth.signInWithPassword({ email, password });
  const { data, error } = await authCall;

  $("#auth-submit").disabled = false;
  if (error) {
    setAuthMessage(error.message, "bad");
    return;
  }

  if (data.session) {
    showApp(data.session.user);
    return;
  }

  setAuthMessage("Account created. Check your email to confirm it, then sign in.", "good");
  state.authMode = "signin";
  updateAuthMode();
}

function bindAuthEvents() {
  $("#auth-form").addEventListener("submit", handleAuthSubmit);
  $("#auth-mode-toggle").addEventListener("click", () => {
    state.authMode = state.authMode === "signup" ? "signin" : "signup";
    updateAuthMode();
  });
}

async function bootAuth() {
  bindAuthEvents();
  updateAuthMode();

  if (!hasSupabaseConfig) {
    $("#supabase-config-warning").classList.remove("hidden");
    $("#auth-submit").disabled = true;
    showAuthScreen();
    setAuthMessage("Add Supabase credentials first, then reload.");
    return;
  }

  if (!window.supabase) {
    $("#supabase-config-warning").classList.remove("hidden");
    $("#supabase-config-warning").textContent = "Supabase could not load. Check the CDN script or network connection, then reload.";
    $("#auth-submit").disabled = true;
    showAuthScreen();
    setAuthMessage("Supabase library failed to load.", "bad");
    return;
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      showApp(session.user);
    } else {
      showAuthScreen();
    }
  });

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    showAuthScreen();
    setAuthMessage(error.message, "bad");
    return;
  }

  if (data.session?.user) {
    showApp(data.session.user);
  } else {
    showAuthScreen();
  }
}

function sample(items, count) {
  const copy = [...items];
  const picked = [];
  while (copy.length && picked.length < count) {
    picked.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return picked;
}

function normalize(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function recordResult(total, correct) {
  state.checked += total;
  state.correct += correct;
  localStorage.setItem("spanish.checked", state.checked);
  localStorage.setItem("spanish.correct", state.correct);
  updateProgress();
}

function updateProgress() {
  $("#checked-count").textContent = state.checked;
  $("#correct-count").textContent = state.correct;
}

function switchTab(tabId) {
  $$(".tab-button").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabId));
  $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === tabId));
  $("#page-title").textContent = $(`.tab-button[data-tab="${tabId}"]`).textContent;
}

function renderCloze() {
  const topic = $("#cloze-topic").value;
  const pool = topic === "mixed" ? clozeBank : clozeBank.filter((item) => item.topic === topic);
  const source = pool[Math.floor(Math.random() * pool.length)];
  const parts = sample(source.parts, Math.min(8, source.parts.length));
  state.cloze = { ...source, parts };

  $("#cloze-practice").innerHTML = `
    <div class="mini-card">
      <span class="pill">${source.title}</span>
      <p class="result-note">Focus: ${source.focus}. Type one word per blank. Accents are accepted but not required.</p>
    </div>
    <div class="cloze-text">
      ${parts.map((part, index) => `${part[0]}<input class="blank-input" data-index="${index}" type="text" aria-label="Blank ${index + 1}">${part[2]}`).join(" ")}
    </div>
    <p class="result-note" id="cloze-result"></p>
  `;
}

function checkCloze(show = false) {
  if (!state.cloze) return;
  let correct = 0;
  state.cloze.parts.forEach((part, index) => {
    const input = $(`.blank-input[data-index="${index}"]`);
    const answers = part[1].map(normalize);
    const ok = answers.includes(normalize(input.value));
    if (show && !input.value.trim()) input.value = part[1][0];
    input.classList.toggle("correct", ok || show);
    input.classList.toggle("wrong", !ok && !show);
    if (ok) correct += 1;
  });
  $("#cloze-result").textContent = show ? "Answers shown. Regenerate to retry cleanly." : `${correct}/${state.cloze.parts.length} correct`;
  $("#cloze-result").className = `result-note ${correct === state.cloze.parts.length ? "good" : "bad"}`;
  if (!show) recordResult(state.cloze.parts.length, correct);
}

function renderTense() {
  state.tenses = sample(tenseBank, 6);
  $("#tense-practice").innerHTML = state.tenses.map((item, index) => `
    <div class="question-card">
      <strong>${index + 1}. ${item.sentence}</strong>
      <div class="choice-row">
        ${item.options.map((option) => `
          <label>
            <input type="radio" name="tense-${index}" value="${option}">
            ${option}
          </label>
        `).join("")}
      </div>
      <p class="result-note" id="tense-note-${index}"></p>
    </div>
  `).join("");
}

function checkTense() {
  let correct = 0;
  state.tenses.forEach((item, index) => {
    const selected = $(`input[name="tense-${index}"]:checked`);
    const ok = selected && selected.value === item.answer;
    if (ok) correct += 1;
    const note = $(`#tense-note-${index}`);
    note.textContent = ok ? `Correct: ${item.label}. ${item.why}` : `Answer: ${item.answer} (${item.label}). ${item.why}`;
    note.className = `result-note ${ok ? "good" : "bad"}`;
  });
  recordResult(state.tenses.length, correct);
}

function renderReading() {
  const mode = $("#reading-mode").value;
  const item = sample(readingItems[mode], 1)[0];
  state.reading = { mode, item };

  if (mode === "tf") {
    $("#reading-practice").innerHTML = `
      <div class="mini-card">
        <span class="pill">${item.title}</span>
        <p>${item.text}</p>
      </div>
      ${item.statements.map((statement, index) => `
        <div class="question-card">
          <strong>${index + 1}. ${statement.text}</strong>
          <div class="choice-row">
            <label><input type="radio" name="tf-${index}" value="V"> Verdadero</label>
            <label><input type="radio" name="tf-${index}" value="F"> Falso</label>
          </div>
          <input class="answer-input" data-reading="${index}" type="text" placeholder="If false, correct it in Spanish">
          <p class="result-note" id="reading-note-${index}"></p>
        </div>
      `).join("")}
    `;
  } else {
    $("#reading-practice").innerHTML = `
      <div class="mini-card">
        <span class="pill">${item.title}</span>
        <p>${item.text}</p>
      </div>
      ${item.questions.map((question, index) => `
        <div class="question-card">
          <strong>${index + 1}. ${question.q}</strong>
          <input class="answer-input" data-reading="${index}" type="text" placeholder="Short answer in Spanish">
          <p class="result-note" id="reading-note-${index}"></p>
        </div>
      `).join("")}
    `;
  }
}

function checkReading() {
  if (!state.reading) return;
  const { mode, item } = state.reading;
  let total = 0;
  let correct = 0;

  if (mode === "tf") {
    item.statements.forEach((statement, index) => {
      total += 1;
      const selected = $(`input[name="tf-${index}"]:checked`);
      const correction = normalize($(`.answer-input[data-reading="${index}"]`).value);
      const answerOk = selected && selected.value === statement.answer;
      const correctionOk = statement.answer === "V" || normalize(statement.correction).split(" ").some((word) => word.length > 4 && correction.includes(word));
      const ok = answerOk && correctionOk;
      if (ok) correct += 1;
      const note = $(`#reading-note-${index}`);
      note.textContent = ok ? "Correct." : `Answer: ${statement.answer}${statement.correction ? ` - ${statement.correction}` : ""}`;
      note.className = `result-note ${ok ? "good" : "bad"}`;
    });
  } else {
    item.questions.forEach((question, index) => {
      total += 1;
      const answer = normalize($(`.answer-input[data-reading="${index}"]`).value);
      const ok = question.keys.some((key) => answer.includes(normalize(key)));
      if (ok) correct += 1;
      const note = $(`#reading-note-${index}`);
      note.textContent = ok ? "Accepted." : `Include one of these ideas: ${question.keys.join(", ")}.`;
      note.className = `result-note ${ok ? "good" : "bad"}`;
    });
  }
  recordResult(total, correct);
}

function renderWriting() {
  state.writingPrompt = sample(writingPrompts, 1)[0];
  $("#writing-prompt").innerHTML = `
    <span class="pill">${state.writingPrompt.type}</span>
    <h4>${state.writingPrompt.prompt}</h4>
    <ul class="check-list">
      ${state.writingPrompt.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
    </ul>
  `;
  $("#writing-draft").value = "";
  $("#writing-feedback").innerHTML = "";
  updateWordCount();
}

function updateWordCount() {
  const words = $("#writing-draft").value.trim().split(/\s+/).filter(Boolean);
  $("#word-count").textContent = `${words.length} words`;
  $("#word-count").style.color = words.length >= 140 && words.length <= 150 ? "var(--good)" : "var(--muted)";
}

function analyseWriting() {
  const text = normalize($("#writing-draft").value);
  const words = text.split(/\s+/).filter(Boolean);
  const connectors = ["ademas", "por eso", "sin embargo", "por ultimo", "en mi opinion", "porque", "ya que"];
  const pastSignals = ["fui", "fue", "era", "estaba", "tuve", "hice", "decidi", "llegue", "queria", "habia", "organizo", "participe"];
  const formalSignals = ["estimado", "me dirijo", "usted", "atentamente", "le propongo", "solicito"];
  const hits = [
    [`Word limit`, words.length >= 140 && words.length <= 150],
    [`Connectors`, connectors.some((item) => text.includes(item))],
    [`Past tense`, pastSignals.some((item) => text.includes(item))],
    [`Formal register`, state.writingPrompt.type !== "Formal letter" || formalSignals.some((item) => text.includes(item))]
  ];

  $("#writing-feedback").innerHTML = `
    <h4>Draft check</h4>
    ${hits.map(([label, ok]) => `<p class="result-note ${ok ? "good" : "bad"}">${ok ? "OK" : "Needs work"}: ${label}</p>`).join("")}
  `;
}

function renderGrammar() {
  const filter = $("#grammar-filter").value;
  const cards = filter === "all" ? grammarCards : grammarCards.filter((card) => card.topic === filter);
  $("#grammar-bank").innerHTML = cards.map((card) => `
    <div class="mini-card">
      <span class="pill">${card.topic}</span>
      <h4>${card.title}</h4>
      <p>${card.body}</p>
    </div>
  `).join("");
}

function renderFlashcard() {
  const [front, back] = flashcards[state.cardIndex % flashcards.length];
  $("#card-front").textContent = front;
  $("#card-back").textContent = state.cardFlipped ? back : "";
}

function renderListening() {
  state.listening = sample(listeningBank, 1)[0];
  $("#listening-practice").innerHTML = `
    <div class="mini-card">
      <span class="pill">${state.listening.topic}</span>
      <p class="result-note">Read the question first, then play the Spanish audio twice.</p>
    </div>
    <div class="question-card">
      <strong>${state.listening.question}</strong>
      <div class="choice-row">
        ${state.listening.options.map((option) => `
          <label>
            <input type="radio" name="listening-answer" value="${option}">
            ${option}
          </label>
        `).join("")}
      </div>
      <p class="result-note hidden" id="listening-transcript">${state.listening.transcript}</p>
      <p class="result-note" id="listening-note"></p>
    </div>
  `;
}

function playListening() {
  if (!state.listening || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(state.listening.transcript);
  utterance.lang = "es-ES";
  utterance.rate = 0.86;
  window.speechSynthesis.speak(utterance);
}

function checkListening() {
  const selected = $("input[name='listening-answer']:checked");
  const ok = selected && selected.value === state.listening.answer;
  $("#listening-note").textContent = ok ? "Correct." : `Answer: ${state.listening.answer}`;
  $("#listening-note").className = `result-note ${ok ? "good" : "bad"}`;
  recordResult(1, ok ? 1 : 0);
}

function makePlan() {
  const plans = [
    ["8 min cloze: one environment or leisure passage", "12 min tense drill: 2 sets, write why each answer is right", "10 min reading: one true/false set", "10 min writing: plan five bullets, then write only the opening"],
    ["10 min grammar bank: por/para + ser/estar", "10 min cloze mixed set", "10 min short-answer reading", "10 min rewrite weak sentences with connectors"],
    ["6 min flashcards", "12 min listening simulator", "12 min indefinido/imperfecto", "10 min formal-letter paragraph practice"]
  ];
  const plan = sample(plans, 1)[0];
  $("#plan-output").innerHTML = `<ol>${plan.map((item) => `<li>${item}</li>`).join("")}</ol>`;
}

function bindEvents() {
  $$(".tab-button").forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));
  $$("[data-jump]").forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.jump)));
  $("#reset-progress").addEventListener("click", () => {
    state.checked = 0;
    state.correct = 0;
    localStorage.removeItem("spanish.checked");
    localStorage.removeItem("spanish.correct");
    updateProgress();
  });

  $("#make-plan").addEventListener("click", makePlan);
  $("#new-cloze").addEventListener("click", renderCloze);
  $("#check-cloze").addEventListener("click", () => checkCloze(false));
  $("#show-cloze").addEventListener("click", () => checkCloze(true));
  $("#new-tense").addEventListener("click", renderTense);
  $("#check-tense").addEventListener("click", checkTense);
  $("#new-reading").addEventListener("click", renderReading);
  $("#check-reading").addEventListener("click", checkReading);
  $("#new-writing").addEventListener("click", renderWriting);
  $("#writing-draft").addEventListener("input", updateWordCount);
  $("#analyse-writing").addEventListener("click", analyseWriting);
  $("#grammar-filter").addEventListener("change", renderGrammar);
  $("#next-card").addEventListener("click", () => {
    state.cardIndex += 1;
    state.cardFlipped = false;
    renderFlashcard();
  });
  $("#flashcard").addEventListener("click", () => {
    state.cardFlipped = !state.cardFlipped;
    renderFlashcard();
  });
  $("#new-listening").addEventListener("click", renderListening);
  $("#play-listening").addEventListener("click", playListening);
  $("#check-listening").addEventListener("click", checkListening);
  $("#show-transcript").addEventListener("click", () => $("#listening-transcript").classList.toggle("hidden"));
  $("#sign-out").addEventListener("click", async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
  });
}

function initApp() {
  if (state.appReady) return;
  state.appReady = true;
  bindEvents();
  updateProgress();
  renderCloze();
  renderTense();
  renderReading();
  renderWriting();
  renderGrammar();
  renderFlashcard();
  renderListening();
  makePlan();
}

bootAuth();
