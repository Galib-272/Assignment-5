// =============================================
// login.js — Handles login form logic
// =============================================

// This function runs when user clicks "Sign In"
function handleLogin() {
  // Get the values the user typed in
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  // Check if the credentials match the demo credentials
  if (username === "admin" && password === "admin123") {
    // Show spinner on the button
    var btn = document.querySelector("button[onclick='handleLogin()']");
    btn.disabled = true;
    btn.innerHTML =
      '<span class="loading loading-spinner loading-sm"></span> Signing in...';

    // Save login status so issues.html knows the user is logged in
    localStorage.setItem("isLoggedIn", "true");

    // Short delay so spinner is visible, then redirect
    setTimeout(function () {
      window.location.href = "issues.html";
    }, 600);
  } else {
    // Show error message if credentials are wrong
    document.getElementById("error-msg").classList.remove("hidden");
  }
}

// Allow pressing Enter key to trigger login
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    handleLogin();
  }
});
