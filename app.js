const STORAGE_KEY = "campusfix_issues_v2";
const ADMIN_SESSION_KEY = "campusfix_admin_logged_in_v2";
 
function getIssues() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}
 
function saveIssues(issues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}
 
function generateTicketNumber(issues) {
  const next = issues.length + 1;
  return `CF-${String(next).padStart(3, "0")}`;
}
 
function seedDemoIssues() {
  const issues = getIssues();
  if (issues.length > 0) return;
 
  const demo = [
    {
      ticket: "CF-001",
      studentName: "Brenda A.",
      studentEmail: "24/U/1022",
      title: "Broken chair",
      category: "Furniture",
      location: "Lecture Room B12",
      priority: "Medium",
      description: "One chair is broken and unsafe for students.",
      photo: "",
      status: "Pending",
      createdAt: new Date().toLocaleString()
    },
    {
      ticket: "CF-002",
      studentName: "Joel K.",
      studentEmail: "23/U/8911",
      title: "Water leakage",
      category: "Water",
      location: "Hostel Entrance",
      priority: "Critical",
      description: "Water is leaking and making the floor slippery.",
      photo: "",
      status: "In Progress",
      createdAt: new Date().toLocaleString()
    },
    {
      ticket: "CF-003",
      studentName: "Rita N.",
      studentEmail: "rita@mail.com",
      title: "No internet in lab",
      category: "Internet/ICT",
      location: "Computer Lab 2",
      priority: "Medium",
      description: "The internet has not been working since morning.",
      photo: "",
      status: "Resolved",
      createdAt: new Date().toLocaleString()
    }
  ];
 
  saveIssues(demo);
}
 
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `inline-message ${type === "success" ? "success-message" : "error-message"}`;
}
 
function clearMessage(element) {
  element.textContent = "";
  element.className = "inline-message";
}
 
function createIssueCard(issue, showAdminActions = false) {
  const photoHtml = issue.photo
    ? `<div class="photo-preview"><img src="${issue.photo}" alt="Issue photo"></div>`
    : "";
 
  const statusOptions = ["Pending", "In Progress", "Resolved"]
    .map(status => `<option value="${status}" ${issue.status === status ? "selected" : ""}>${status}</option>`)
    .join("");
 
  return `
    <article class="${showAdminActions ? "issue-card" : "tracked-card"}">
      <h4>${issue.title}</h4>
      <div class="meta-row">
        <span class="meta-chip">${issue.ticket}</span>
        <span class="meta-chip">${issue.category}</span>
        <span class="meta-chip">${issue.location}</span>
        <span class="meta-chip">${issue.priority} Priority</span>
        <span class="meta-chip">${issue.status}</span>
      </div>
      <p><strong>Reported by:</strong> ${issue.studentName} (${issue.studentEmail})</p>
      <p><strong>Description:</strong> ${issue.description}</p>
      <p><strong>Submitted:</strong> ${issue.createdAt}</p>
      ${photoHtml}
      ${showAdminActions ? `
        <div class="status-select">
          <label for="status-${issue.ticket}">Update Status</label>
          <div class="form-actions">
            <select id="status-${issue.ticket}">
              ${statusOptions}
            </select>
            <button class="btn btn-primary" onclick="updateIssueStatus('${issue.ticket}')">Save Status</button>
          </div>
        </div>
      ` : ""}
    </article>
  `;
}
 
function resetPhotoPreview() {
  const photoPreviewWrap = document.getElementById("photoPreviewWrap");
  const photoPreview = document.getElementById("photoPreview");
  const issuePhoto = document.getElementById("issuePhoto");
 
  if (photoPreviewWrap) photoPreviewWrap.classList.add("hidden");
  if (photoPreview) photoPreview.src = "";
  if (issuePhoto) issuePhoto.value = "";
}
 
function initializeStudentPage() {
  const issueForm = document.getElementById("issueForm");
  if (!issueForm) return;
 
  const issuePhoto = document.getElementById("issuePhoto");
  const photoPreviewWrap = document.getElementById("photoPreviewWrap");
  const photoPreview = document.getElementById("photoPreview");
  const submissionMessage = document.getElementById("submissionMessage");
  const trackBtn = document.getElementById("trackBtn");
  const trackedIssue = document.getElementById("trackedIssue");
  const ticketSearch = document.getElementById("ticketSearch");
  const resetFormBtn = document.getElementById("resetFormBtn");
 
  let uploadedPhoto = "";
 
  issuePhoto.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) {
      uploadedPhoto = "";
      resetPhotoPreview();
      return;
    }
 
    const reader = new FileReader();
    reader.onload = e => {
      uploadedPhoto = e.target.result;
      photoPreview.src = uploadedPhoto;
      photoPreviewWrap.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });
 
  issueForm.addEventListener("submit", event => {
    event.preventDefault();
    const issues = getIssues();
 
    const issue = {
      ticket: generateTicketNumber(issues),
      studentName: document.getElementById("studentName").value.trim(),
      studentEmail: document.getElementById("studentEmail").value.trim(),
      title: document.getElementById("issueTitle").value.trim(),
      category: document.getElementById("issueCategory").value,
      location: document.getElementById("issueLocation").value.trim(),
      priority: document.getElementById("issuePriority").value,
      description: document.getElementById("issueDescription").value.trim(),
      photo: uploadedPhoto,
      status: "Pending",
      createdAt: new Date().toLocaleString()
    };
 
    issues.push(issue);
    saveIssues(issues);
 
    showMessage(
      submissionMessage,
      `Issue submitted successfully. Your ticket number is ${issue.ticket}. Please save it for tracking.`,
      "success"
    );
 
    issueForm.reset();
    uploadedPhoto = "";
    resetPhotoPreview();
    trackedIssue.innerHTML = createIssueCard(issue, false);
    trackedIssue.classList.remove("empty-state");
  });
 
  resetFormBtn.addEventListener("click", () => {
    uploadedPhoto = "";
    resetPhotoPreview();
    clearMessage(submissionMessage);
  });
 
  trackBtn.addEventListener("click", () => {
    const ticket = ticketSearch.value.trim().toUpperCase();
    const issue = getIssues().find(item => item.ticket.toUpperCase() === ticket);
 
    if (!issue) {
      trackedIssue.innerHTML = "No issue found with that ticket number.";
      trackedIssue.className = "tracked-issue empty-state";
      return;
    }
 
    trackedIssue.innerHTML = createIssueCard(issue, false);
    trackedIssue.className = "tracked-issue";
  });
}
 
function initializeAdminLoginPage() {
  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;
 
  const adminUsername = document.getElementById("adminUsername");
  const adminPassword = document.getElementById("adminPassword");
  const loginMessage = document.getElementById("loginMessage");
 
  loginBtn.addEventListener("click", () => {
    const username = adminUsername.value.trim();
    const password = adminPassword.value.trim();
 
    if (username === "admin" && password === "CampusFix2026") {
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      window.location.href = "admin.html";
      return;
    }
 
    showMessage(loginMessage, "Invalid login details.", "error");
  });
}
 
function protectAdminPage() {
  if (!document.getElementById("adminIssueList")) return true;
 
  if (localStorage.getItem(ADMIN_SESSION_KEY) !== "true") {
    window.location.href = "admin-login.html";
    return false;
  }
 
  return true;
}
 
function renderAdminStats(issues) {
  document.getElementById("totalIssues").textContent = issues.length;
  document.getElementById("pendingIssues").textContent = issues.filter(i => i.status === "Pending").length;
  document.getElementById("inProgressIssues").textContent = issues.filter(i => i.status === "In Progress").length;
  document.getElementById("resolvedIssues").textContent = issues.filter(i => i.status === "Resolved").length;
}
 
function renderAdminIssues() {
  const adminIssueList = document.getElementById("adminIssueList");
  if (!adminIssueList) return;
 
  const statusFilter = document.getElementById("statusFilter").value;
  const categoryFilter = document.getElementById("categoryFilter").value;
 
  let issues = getIssues();
  renderAdminStats(issues);
 
  issues = issues.filter(issue => {
    const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || issue.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });
 
  if (issues.length === 0) {
    adminIssueList.innerHTML = `<div class="empty-state">No issues found for the selected filters.</div>`;
    return;
  }
 
  adminIssueList.innerHTML = issues
    .slice()
    .reverse()
    .map(issue => createIssueCard(issue, true))
    .join("");
}
 
function updateIssueStatus(ticket) {
  const select = document.getElementById(`status-${ticket}`);
  const issues = getIssues();
  const issue = issues.find(item => item.ticket === ticket);
 
  if (!issue) return;
 
  issue.status = select.value;
  saveIssues(issues);
  renderAdminIssues();
}
 
function initializeAdminDashboard() {
  if (!protectAdminPage()) return;
 
  const adminIssueList = document.getElementById("adminIssueList");
  if (!adminIssueList) return;
 
  renderAdminIssues();
 
  document.getElementById("statusFilter").addEventListener("change", renderAdminIssues);
  document.getElementById("categoryFilter").addEventListener("change", renderAdminIssues);
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.href = "admin-login.html";
  });
}
 
seedDemoIssues();
initializeStudentPage();
initializeAdminLoginPage();
initializeAdminDashboard();
window.updateIssueStatus = updateIssueStatus;
