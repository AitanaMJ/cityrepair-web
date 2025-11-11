// src/js/logout.js
import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const btnLogout = document.querySelector("[data-logout]");
if (btnLogout) {
  btnLogout.addEventListener("click", async (e) => {
    e.preventDefault();

    // ⚠️ avisamos al guard que esto es un logout voluntario
    sessionStorage.setItem("cr_logging_out", "1");

    await signOut(auth);
    window.location.href = "../index.html"; // o la página que quieras
  });
}
