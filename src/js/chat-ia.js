// chat-ia.js
// === IMPORT FIREBASE ===
// === CONFIG GEMINI (GRATIS) ===
const GEMINI_API_KEY = "AIzaSyCsVrp7YRsORJ4PRnULdBiOOkUOEkiUeyM";
async function askGemini(message) {

  const url = `https://proxy.cors.sh/https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [
      { role: "user", parts: [{ text: message }] }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cors-api-key": "web"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  console.log("Gemini respuesta:", data);

  return data?.candidates?.[0]?.content?.parts?.[0]?.text 
    || "No pude responder ahora.";
}

// === UI ===
const btnOpen = document.getElementById("iaOpenBtn");
const btnClose = document.getElementById("iaCloseBtn");
const chatBox = document.getElementById("iaChatBox");
const messagesBox = document.getElementById("iaMessages");
const input = document.getElementById("iaInput");
const btnSend = document.getElementById("iaSendBtn");

btnOpen.onclick = () => chatBox.classList.remove("hidden");
btnClose.onclick = () => chatBox.classList.add("hidden");

btnSend.onclick = sendMessage;
input.addEventListener("keypress", e => { 
  if (e.key === "Enter") sendMessage(); 
});

function addMsg(content, type) {
  const div = document.createElement("div");
  div.className = type === "user" ? "msg-user" : "msg-bot";
  div.textContent = content;
  messagesBox.appendChild(div);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// === ENVIAR MENSAJE ===
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "user");
  input.value = "";

  let prompt = text;

  try {
    const response = await askGemini(prompt);
    addMsg(response, "bot");
  } catch (error) {
    console.error(error);
    addMsg("Ocurrió un error al responder.", "bot");
  }
}