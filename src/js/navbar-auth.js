(function () {
  let raw = null;
  try {
    raw = localStorage.getItem('cr_auth');
  } catch (e) {}

  const isLogged = !!raw && raw !== 'null';

  const loginLinks  = document.querySelectorAll('[data-login-link]');
  const logoutLinks = document.querySelectorAll('[data-logout]');

  if (isLogged) {
    loginLinks.forEach(el => el.style.display = 'none');
    logoutLinks.forEach(el => el.style.display = 'flex');
  } else {
    loginLinks.forEach(el => el.style.display = 'flex');
    logoutLinks.forEach(el => el.style.display = 'none');
  }
})();
