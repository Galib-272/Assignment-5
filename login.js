// Handle login authentication
function handleLogin() {
  // Get input values
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  // Check admin credentials
  if (username === "admin" && password === "admin123") {
    // Save login state
    localStorage.setItem("isLoggedIn", "true");
    // Redirect to issues page
    window.location.href = "issues.html";
  } else {
    // Error message
    document.getElementById("error-msg").classList.remove("hidden");
  }
}
// Login when Enter key is pressed
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") handleLogin();
});
