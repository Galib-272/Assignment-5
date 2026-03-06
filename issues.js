// =============================================
// issues.js — All logic for the issues page
// =============================================

// --- API URLs ---
var API_ALL_ISSUES = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
var API_SEARCH =
  "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";
var API_SINGLE = "https://phi-lab-server.vercel.app/api/v1/lab/issue/";

// --- App State ---
var allIssues = []; // stores all fetched issues
var currentTab = "all"; // active tab: "all", "open", "closed"
var searchTimer = null; // used to delay search so we don't call API on every keystroke

// =============================================
// ON PAGE LOAD
// =============================================
window.onload = function () {
  // If user is not logged in, send them back to login page
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }

  // Start loading all issues from the API
  loadAllIssues();
};

// =============================================
// SIGN OUT
// =============================================
function signOut() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "index.html";
}

// =============================================
// FETCH ALL ISSUES FROM THE API
// =============================================
function loadAllIssues() {
  showLoading(true);

  fetch(API_ALL_ISSUES)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // The API might return an array directly, or inside a property
      if (Array.isArray(data)) {
        allIssues = data;
      } else if (data.issues && Array.isArray(data.issues)) {
        allIssues = data.issues;
      } else if (data.data && Array.isArray(data.data)) {
        allIssues = data.data;
      } else {
        allIssues = [];
        console.log("Unexpected API response format:", data);
      }

      renderIssues(allIssues);
      showLoading(false);
    })
    .catch(function (error) {
      console.log("Error fetching issues:", error);
      showLoading(false);
    });
}

// =============================================
// TAB SWITCHING — All / Open / Closed
// =============================================
function switchTab(tab) {
  currentTab = tab;

  // Update button styles — active tab gets blue, others get plain
  var tabNames = ["all", "open", "closed"];
  tabNames.forEach(function (t) {
    var btn = document.getElementById("tab-" + t);
    if (t === tab) {
      btn.className = "btn btn-sm btn-primary text-white px-5";
    } else {
      btn.className =
        "btn btn-sm btn-ghost border border-gray-200 bg-white text-gray-700 px-5";
    }
  });

  // Clear search input when switching tabs
  document.getElementById("search-input").value = "";

  // Filter and show issues for this tab
  var filtered = filterByTab(allIssues, tab);
  renderIssues(filtered);
}

// =============================================
// FILTER ISSUES BY STATUS
// =============================================
function filterByTab(issues, tab) {
  if (tab === "all") return issues;

  return issues.filter(function (issue) {
    var status = (issue.status || "").toLowerCase();
    return status === tab;
  });
}

// =============================================
// SEARCH — runs every time user types in search box
// =============================================
function handleSearch(query) {
  clearTimeout(searchTimer);

  // If search box is empty, just show current tab's issues
  if (query.trim() === "") {
    var filtered = filterByTab(allIssues, currentTab);
    renderIssues(filtered);
    return;
  }

  // Wait 400ms after user stops typing, then call the search API
  searchTimer = setTimeout(function () {
    showLoading(true);

    fetch(API_SEARCH + encodeURIComponent(query.trim()))
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var results = [];

        if (Array.isArray(data)) {
          results = data;
        } else if (data.issues && Array.isArray(data.issues)) {
          results = data.issues;
        } else if (data.data && Array.isArray(data.data)) {
          results = data.data;
        }

        // Also filter by current tab
        var filtered = filterByTab(results, currentTab);
        renderIssues(filtered);
        showLoading(false);
      })
      .catch(function () {
        showLoading(false);
      });
  }, 400);
}

// =============================================
// RENDER ALL ISSUE CARDS TO THE SCREEN
// =============================================
function renderIssues(issues) {
  var grid = document.getElementById("issues-grid");
  var noResults = document.getElementById("no-results");

  // Update the count number
  document.getElementById("issue-count").textContent =
    issues.length + " Issues";

  // Clear old cards
  grid.innerHTML = "";

  if (issues.length === 0) {
    grid.classList.add("hidden");
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");
  grid.classList.remove("hidden");

  // Create a card for each issue
  issues.forEach(function (issue) {
    var card = buildCard(issue);
    grid.appendChild(card);
  });
}

// =============================================
// BUILD ONE ISSUE CARD
// =============================================
function buildCard(issue) {
  var card = document.createElement("div");

  var status = (issue.status || "").toLowerCase();
  var isOpen = status === "open";

  // Green top border for open, purple for closed
  var borderColor = isOpen ? "border-green-500" : "border-purple-500";

  card.className =
    "bg-white rounded-lg shadow-sm border-t-4 " +
    borderColor +
    " p-4 cursor-pointer hover:shadow-md transition-shadow duration-200";

  // Build labels HTML
  var labelsHTML = "";
  var labelsArray = getLabelsArray(issue.labels);

  labelsArray.forEach(function (label) {
    var style = getLabelStyle(label);
    labelsHTML +=
      '<span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ' +
      style.classes +
      '">' +
      style.icon +
      label +
      "</span>";
  });

  // Priority badge style
  var priorityStyle = getPriorityStyle(issue.priority);
  var priorityText = (issue.priority || "N/A").toUpperCase();

  // Use Open-Status.png for open issues, Closed- Status .png for closed issues
  var statusIcon = isOpen
    ? '<img src="assets/Open-Status.png" alt="Open" class="w-5 h-5" />'
    : '<img src="assets/Closed- Status .png" alt="Closed" class="w-5 h-5" />';

  // Date, author, id
  var dateText = formatDate(issue.createdAt || issue.created_at);
  var author = issue.author || issue.user || issue.createdBy || "unknown";
  var issueNum = issue.id || issue._id || issue.number || "?";

  card.innerHTML =
    '<div class="flex justify-between items-center mb-3">' +
    statusIcon +
    '<span class="text-xs font-semibold px-3 py-0.5 ' +
    priorityStyle +
    '">' +
    priorityText +
    "</span>" +
    "</div>" +
    '<h3 class="font-bold text-gray-800 text-sm leading-snug mb-1">' +
    (issue.title || "Untitled") +
    "</h3>" +
    '<p class="text-gray-400 text-xs mb-3 line-clamp-2">' +
    (issue.description || "No description provided.") +
    "</p>" +
    '<div class="flex flex-wrap gap-1 mb-3">' +
    labelsHTML +
    "</div>" +
    '<div class="text-xs text-gray-400">' +
    "<p>#" +
    issueNum +
    " by " +
    author +
    "</p>" +
    "<p>" +
    dateText +
    "</p>" +
    "</div>";

  // Click opens modal
  card.addEventListener("click", function () {
    openModal(issue);
  });

  return card;
}

// =============================================
// OPEN THE ISSUE DETAIL MODAL
// =============================================
function openModal(issue) {
  var status = (issue.status || "").toLowerCase();
  var isOpen = status === "open";

  // Title
  document.getElementById("modal-title").textContent =
    issue.title || "No Title";

  // Status badge
  var statusBadge = document.getElementById("modal-status-badge");
  statusBadge.textContent = isOpen ? "Opened" : "Closed";
  statusBadge.className =
    "badge text-white font-semibold px-3 py-1 rounded-full " +
    (isOpen ? "bg-green-500" : "bg-purple-500");

  // Author + Date
  var author = issue.author || issue.user || issue.createdBy || "Unknown";
  document.getElementById("modal-author").textContent = author;
  document.getElementById("modal-date").textContent = formatDate(
    issue.createdAt || issue.created_at,
  );

  // Description
  document.getElementById("modal-description").textContent =
    issue.description || "No description provided.";

  // Assignee
  document.getElementById("modal-assignee").textContent = issue.assignee || "—";

  // Priority badge
  var priorityBadge = document.getElementById("modal-priority-badge");
  priorityBadge.textContent = (issue.priority || "N/A").toUpperCase();
  priorityBadge.className =
    "badge text-white font-semibold px-3 rounded " +
    getModalPriorityStyle(issue.priority);

  // Labels
  var labelsContainer = document.getElementById("modal-labels");
  labelsContainer.innerHTML = "";
  var labelsArray = getLabelsArray(issue.labels);

  labelsArray.forEach(function (label) {
    var style = getLabelStyle(label);
    var span = document.createElement("span");
    span.className =
      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium " +
      style.classes;
    span.innerHTML = style.icon + label;
    labelsContainer.appendChild(span);
  });

  // Show the modal
  document.getElementById("issue-modal").showModal();
}

// =============================================
// HELPER: Extract Labels as Array of Strings
// Handles: array of strings, array of objects, or a comma-separated string
// =============================================
function getLabelsArray(labels) {
  if (!labels) return [];

  if (Array.isArray(labels)) {
    return labels.map(function (l) {
      if (typeof l === "object" && l !== null) {
        return l.name || l.label || String(l);
      }
      return String(l);
    });
  }

  if (typeof labels === "string") {
    return labels
      .split(",")
      .map(function (l) {
        return l.trim();
      })
      .filter(Boolean);
  }

  return [];
}

// =============================================
// HELPER: Show or Hide the Loading Spinner
// =============================================
function showLoading(show) {
  var loadingEl = document.getElementById("loading");
  var gridEl = document.getElementById("issues-grid");
  var noResults = document.getElementById("no-results");

  if (show) {
    loadingEl.classList.remove("hidden");
    gridEl.classList.add("hidden");
    noResults.classList.add("hidden");
  } else {
    loadingEl.classList.add("hidden");
  }
}

// =============================================
// HELPER: Format Date as M/D/YYYY
// =============================================
function formatDate(dateString) {
  if (!dateString) return "Unknown date";

  var date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  var month = date.getMonth() + 1;
  var day = date.getDate();
  var year = date.getFullYear();

  return month + "/" + day + "/" + year;
}

// =============================================
// HELPER: Priority Badge Style for Cards
// Matches the screenshot — colored text on light bg
// =============================================
function getPriorityStyle(priority) {
  if (!priority) return "bg-gray-100 text-gray-400";

  var p = priority.toLowerCase();
  if (p === "high") return "bg-red-100 text-red-400 rounded-full";
  if (p === "medium") return "bg-orange-100 text-orange-400 rounded-full";
  if (p === "low") return "bg-gray-100 text-gray-400 rounded-full";

  return "bg-gray-100 text-gray-400 rounded-full";
}

// =============================================
// HELPER: Priority Badge Style for Modal
// =============================================
function getModalPriorityStyle(priority) {
  if (!priority) return "bg-gray-400";

  var p = priority.toLowerCase();
  if (p === "high") return "bg-red-500";
  if (p === "medium") return "bg-orange-400";
  if (p === "low") return "bg-blue-400";

  return "bg-gray-400";
}

// =============================================
// HELPER: Label Badge Style + Icon
// =============================================
function getLabelStyle(label) {
  if (!label)
    return { classes: "bg-gray-100 text-gray-500 border-gray-300", icon: "" };

  var l = label.toLowerCase();

  if (l === "bug") {
    return {
      classes: "bg-red-50 text-red-500 border-red-200",
      icon: '<span class="mr-0.5">🐛</span>',
    };
  }
  if (l === "help wanted") {
    return {
      classes: "bg-green-50 text-green-600 border-green-200",
      icon: '<span class="mr-0.5">🙌</span>',
    };
  }
  if (l === "enhancement") {
    return {
      classes: "bg-purple-50 text-purple-600 border-purple-200",
      icon: '<span class="mr-0.5">✨</span>',
    };
  }
  if (l === "feature") {
    return {
      classes: "bg-blue-50 text-blue-600 border-blue-200",
      icon: '<span class="mr-0.5">🚀</span>',
    };
  }
  if (l === "documentation") {
    return {
      classes: "bg-yellow-50 text-yellow-600 border-yellow-200",
      icon: '<span class="mr-0.5">📄</span>',
    };
  }

  return { classes: "bg-gray-100 text-gray-500 border-gray-300", icon: "" };
}
