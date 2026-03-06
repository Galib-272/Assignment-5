function handleLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "admin123") {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "issues.html";
  } else {
    document.getElementById("error-msg").classList.remove("hidden");
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") handleLogin();
});
