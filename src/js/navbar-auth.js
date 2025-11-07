import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { auth } from "./firebase.js";

const loginLink = document.querySelector("[data-login-link]");
const logoutLink = document.querySelector("[data-logout]");
const drawerLogin = document.getElementById("drawerLogin");
const drawerLogout = document.getElementById("drawerLogout");

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Usuario logueado:", user.email);
    if (loginLink) loginLink.hidden = true;
    if (drawerLogin) drawerLogin.hidden = true;
    if (logoutLink) logoutLink.hidden = false;
    if (drawerLogout) drawerLogout.hidden = false;
  } else {
    console.log("🚫 No hay usuario logueado");
    if (loginLink) loginLink.hidden = false;
    if (drawerLogin) drawerLogin.hidden = false;
    if (logoutLink) logoutLink.hidden = true;
    if (drawerLogout) drawerLogout.hidden = true;
  }
});