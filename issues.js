// =============================================
// issues.js — All logic for the issues page
// =============================================

// --- API URLs ---
const API_ALL_ISSUES = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const API_SEARCH =
  "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";
const API_SINGLE = "https://phi-lab-server.vercel.app/api/v1/lab/issue/";

// --- App State ---
let allIssues = [];
let currentTab = "all";
let searchTimer = null;

// =============================================
// ON PAGE LOAD
// =============================================
window.onload = function () {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }
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
      if (Array.isArray(data)) {
        allIssues = data;
      } else if (data.issues && Array.isArray(data.issues)) {
        allIssues = data.issues;
      } else if (data.data && Array.isArray(data.data)) {
        allIssues = data.data;
      } else {
        allIssues = [];
      }
      renderIssues(allIssues);
      showLoading(false);
    })
    .catch(function (error) {
      console.log("Error:", error);
      showLoading(false);
    });
}

// =============================================
// TAB SWITCHING
// =============================================
function switchTab(tab) {
  currentTab = tab;

  const tabNames = ["all", "open", "closed"];
  tabNames.forEach(function (t) {
    const btn = document.getElementById("tab-" + t);
    if (t === tab) {
      btn.className = "btn btn-sm btn-primary text-white px-5";
    } else {
      btn.className =
        "btn btn-sm btn-ghost border border-gray-200 bg-white text-gray-700 px-5";
    }
  });

  document.getElementById("search-input").value = "";
  renderIssues(filterByTab(allIssues, tab));
}

// =============================================
// FILTER BY TAB
// =============================================
function filterByTab(issues, tab) {
  if (tab === "all") return issues;
  return issues.filter(function (issue) {
    return (issue.status || "").toLowerCase() === tab;
  });
}

// =============================================
// SEARCH
// =============================================
function handleSearch(query) {
  clearTimeout(searchTimer);

  if (query.trim() === "") {
    renderIssues(filterByTab(allIssues, currentTab));
    return;
  }

  searchTimer = setTimeout(function () {
    showLoading(true);
    fetch(API_SEARCH + encodeURIComponent(query.trim()))
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        const results = Array.isArray(data)
          ? data
          : data.issues || data.data || [];
        renderIssues(filterByTab(results, currentTab));
        showLoading(false);
      })
      .catch(function () {
        showLoading(false);
      });
  }, 400);
}

// =============================================
// RENDER ISSUES
// =============================================
function renderIssues(issues) {
  const grid = document.getElementById("issues-grid");
  const noResults = document.getElementById("no-results");

  document.getElementById("issue-count").textContent =
    issues.length + " Issues";
  grid.innerHTML = "";

  if (issues.length === 0) {
    grid.classList.add("hidden");
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");
  grid.classList.remove("hidden");

  issues.forEach(function (issue) {
    grid.appendChild(buildCard(issue));
  });
}

// =============================================
// BUILD ONE CARD — using DOM methods, no innerHTML for labels
// =============================================
function buildCard(issue) {
  const status = (issue.status || "").toLowerCase();
  const isOpen = status === "open";

  // --- Card wrapper ---
  const card = document.createElement("div");
  card.style.cssText =
    "background:#fff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.08); border-top:4px solid " +
    (isOpen ? "#22c55e" : "#a855f7") +
    "; padding:16px; cursor:pointer; transition:box-shadow 0.2s; display:flex; flex-direction:column; height:100%;";
  card.addEventListener("mouseenter", function () {
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
  });
  card.addEventListener("mouseleave", function () {
    card.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
  });

  // --- Top row: status icon + priority badge ---
  const topRow = document.createElement("div");
  topRow.style.cssText =
    "display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;";

  const iconImg = document.createElement("img");
  iconImg.src = isOpen
    ? "assets/Open-Status.png"
    : "assets/Closed- Status .png";
  iconImg.style.cssText = "width:20px; height:20px;";

  const priorityInfo = getPriorityStyle(issue.priority);
  const prioritySpan = document.createElement("span");
  prioritySpan.textContent = (issue.priority || "N/A").toUpperCase();
  prioritySpan.style.cssText =
    "background:" +
    priorityInfo.bg +
    "; color:" +
    priorityInfo.color +
    "; border-radius:999px; padding:3px 10px; font-size:11px; font-weight:700;";

  topRow.appendChild(iconImg);
  topRow.appendChild(prioritySpan);
  card.appendChild(topRow);

  // --- Title ---
  const title = document.createElement("h3");
  title.textContent = issue.title || "Untitled";
  title.style.cssText =
    "font-weight:700; color:#1f2937; font-size:13px; line-height:1.4; margin-bottom:6px;";
  card.appendChild(title);

  // --- Description ---
  const desc = document.createElement("p");
  desc.textContent = issue.description || "No description.";
  desc.style.cssText =
    "color:#9ca3af; font-size:11px; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;";
  card.appendChild(desc);

  // --- Labels row ---
  const labelsRow = document.createElement("div");
  labelsRow.style.cssText =
    "display:flex; flex-direction:row; flex-wrap:wrap; align-items:center; gap:6px; margin-bottom:12px; margin-top:auto;";

  const labelsArray = getLabelsArray(issue.labels);
  labelsArray.forEach(function (label) {
    const info = getLabelStyle(label);

    const badge = document.createElement("span");
    badge.style.cssText =
      "display:flex; flex-direction:row; align-items:center; background:" +
      info.bg +
      "; color:" +
      info.color +
      "; border:1px solid " +
      info.border +
      "; border-radius:999px; padding:4px 10px; font-size:11px; font-weight:600; white-space:nowrap;";

    if (info.iconSrc) {
      const iconEl = document.createElement("img");
      iconEl.src = info.iconSrc;
      iconEl.style.cssText =
        "width:12px; height:12px; margin-right:5px; display:block;";
      badge.appendChild(iconEl);
    }

    const labelText = document.createTextNode(label);
    badge.appendChild(labelText);

    labelsRow.appendChild(badge);
  });

  card.appendChild(labelsRow);

  // --- Divider line ---
  const divider = document.createElement("hr");
  divider.style.cssText =
    "border:none; border-top:1px solid #e5e7eb; margin-bottom:10px;";
  card.appendChild(divider);

  // --- Footer: issue number, author, date ---
  const footer = document.createElement("div");
  footer.style.cssText = "color:#9ca3af; font-size:11px;";

  const author = issue.author || issue.user || issue.createdBy || "unknown";
  const issueNum = issue.id || issue._id || issue.number || "?";
  const dateText = formatDate(issue.createdAt || issue.created_at);

  footer.innerHTML =
    "<p>#" + issueNum + " by " + author + "</p><p>" + dateText + "</p>";
  card.appendChild(footer);

  // Click opens modal
  card.addEventListener("click", function () {
    openModal(issue);
  });

  return card;
}

// =============================================
// OPEN MODAL — shows spinner first, then fills content
// =============================================
function openModal(issue) {
  const modal = document.getElementById("issue-modal");
  const modalBox = modal.querySelector(".modal-box");

  // Remove any leftover spinner
  const old = document.getElementById("modal-spinner");
  if (old) old.remove();

  // Inject spinner overlay
  const spinner = document.createElement("div");
  spinner.id = "modal-spinner";
  spinner.style.cssText =
    "position:absolute; inset:0; background:rgba(255,255,255,0.92); display:flex; align-items:center; justify-content:center; border-radius:12px; z-index:10;";
  spinner.innerHTML =
    '<span class="loading loading-spinner loading-lg text-primary"></span>';
  modalBox.style.position = "relative";
  modalBox.appendChild(spinner);

  // Open modal — spinner shows immediately
  modal.showModal();

  // After 500ms remove spinner and populate content
  setTimeout(function () {
    const spinnerEl = document.getElementById("modal-spinner");
    if (spinnerEl) spinnerEl.remove();

    const issueData = issue.data ? issue.data : issue;

    document.getElementById("modal-title").textContent =
      issueData.title || "No Title";

    const statusBadge = document.getElementById("modal-status-badge");
    const status = (issueData.status || "").toLowerCase();
    const isOpen = status === "open";
    statusBadge.textContent = isOpen ? "Opened" : "Closed";
    statusBadge.className =
      "badge text-white font-semibold px-3 py-1 rounded-full " +
      (isOpen ? "bg-green-500" : "bg-purple-500");

    document.getElementById("modal-author").textContent =
      issueData.author || issueData.user || "Unknown";
    document.getElementById("modal-date").textContent = formatDate(
      issueData.createdAt || issueData.created_at,
    );
    document.getElementById("modal-description").textContent =
      issueData.description || "No description.";
    document.getElementById("modal-assignee").textContent =
      issueData.assignee || "—";

    const priorityBadge = document.getElementById("modal-priority-badge");
    priorityBadge.textContent = (issueData.priority || "N/A").toUpperCase();
    const p = (issueData.priority || "").toLowerCase();
    if (p === "high") {
      priorityBadge.className =
        "badge text-white font-semibold px-3 rounded-full bg-red-500";
    } else if (p === "medium") {
      priorityBadge.className =
        "badge font-semibold px-3 rounded-full bg-yellow-100 text-yellow-600";
    } else if (p === "low") {
      priorityBadge.className =
        "badge font-semibold px-3 rounded-full bg-gray-200 text-gray-500";
    } else {
      priorityBadge.className =
        "badge font-semibold px-3 rounded-full bg-gray-200 text-gray-500";
    }

    // Labels
    const labelsContainer = document.getElementById("modal-labels");
    labelsContainer.innerHTML = "";
    labelsContainer.style.cssText =
      "display:flex; flex-direction:row; flex-wrap:wrap; align-items:center; gap:6px; margin-bottom:16px;";

    getLabelsArray(issueData.labels).forEach(function (label) {
      const info = getLabelStyle(label);
      const badge = document.createElement("span");
      badge.style.cssText =
        "display:flex; flex-direction:row; align-items:center; background:" +
        info.bg +
        "; color:" +
        info.color +
        "; border:1px solid " +
        info.border +
        "; border-radius:999px; padding:4px 10px; font-size:11px; font-weight:600; white-space:nowrap;";

      if (info.iconSrc) {
        const iconEl = document.createElement("img");
        iconEl.src = info.iconSrc;
        iconEl.style.cssText =
          "width:12px; height:12px; margin-right:5px; display:block;";
        badge.appendChild(iconEl);
      }
      badge.appendChild(document.createTextNode(label));
      labelsContainer.appendChild(badge);
    });
  }, 500);
}

// =============================================
// HELPER: Extract labels as string array
// =============================================
function getLabelsArray(labels) {
  if (!labels) return [];
  if (Array.isArray(labels)) {
    return labels.map(function (l) {
      return typeof l === "object" ? l.name || l.label || "" : String(l);
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
// HELPER: Show / Hide loading spinner
// =============================================
function showLoading(show) {
  const loadingEl = document.getElementById("loading");
  const gridEl = document.getElementById("issues-grid");
  const noResults = document.getElementById("no-results");

  if (show) {
    loadingEl.classList.remove("hidden");
    gridEl.classList.add("hidden");
    noResults.classList.add("hidden");
  } else {
    loadingEl.classList.add("hidden");
  }
}

// =============================================
// HELPER: Format date as M/D/YYYY
// =============================================
function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
}

// =============================================
// HELPER: Priority style for cards (returns object with bg + color)
// =============================================
function getPriorityStyle(priority) {
  const p = (priority || "").toLowerCase();
  if (p === "high") return { bg: "#fee2e2", color: "#f87171" };
  if (p === "medium") return { bg: "#fef9c3", color: "#ca8a04" };
  if (p === "low") return { bg: "#f3f4f6", color: "#9ca3af" };
  return { bg: "#f3f4f6", color: "#9ca3af" };
}

// =============================================
// HELPER: Priority class for modal badge
// =============================================
function getModalPriorityClass(priority) {
  const p = (priority || "").toLowerCase();
  if (p === "high") return "bg-red-500";
  if (p === "medium") return "bg-yellow-400";
  if (p === "low") return "bg-gray-200 !text-gray-500";
  return "bg-gray-200 !text-gray-500";
}

// =============================================
// HELPER: Label style — returns bg, color, border, iconSrc
// =============================================
function getLabelStyle(label) {
  const l = (label || "").toLowerCase();

  if (l === "bug") {
    return {
      bg: "#fee2e2",
      color: "#ef4444",
      border: "#fca5a5",
      iconSrc: "assets/bug.png",
    };
  }
  if (l === "help wanted") {
    return {
      bg: "#fef9c3",
      color: "#ca8a04",
      border: "#fde047",
      iconSrc: "assets/help_wanted.png",
    };
  }
  if (l === "enhancement") {
    return {
      bg: "#dcfce7",
      color: "#16a34a",
      border: "#86efac",
      iconSrc: "assets/enhancement.png",
    };
  }
  if (l === "feature") {
    return { bg: "#dbeafe", color: "#2563eb", border: "#93c5fd", iconSrc: "" };
  }
  if (l === "documentation") {
    return { bg: "#fef3c7", color: "#d97706", border: "#fcd34d", iconSrc: "" };
  }

  return { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", iconSrc: "" };
}
