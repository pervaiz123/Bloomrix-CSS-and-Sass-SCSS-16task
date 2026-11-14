import "../scss/main.scss";

const initialTasks = [
  {
    id: 1,
    name: "Design dashboard interface",
    assignee: "Sarah Khan",
    dueDate: "2026-11-18",
    priority: "High",
    status: "In Progress"
  },
  {
    id: 2,
    name: "Update project documentation",
    assignee: "Ali Ahmed",
    dueDate: "2026-11-20",
    priority: "Medium",
    status: "Pending"
  },
  {
    id: 3,
    name: "Review responsive layout",
    assignee: "Pervaiz Ahmed",
    dueDate: "2026-11-16",
    priority: "High",
    status: "Completed"
  },
  {
    id: 4,
    name: "Prepare team presentation",
    assignee: "Fatima Noor",
    dueDate: "2026-11-22",
    priority: "Low",
    status: "Pending"
  },
  {
    id: 5,
    name: "Test dashboard functionality",
    assignee: "Usman Ali",
    dueDate: "2026-11-19",
    priority: "Medium",
    status: "In Progress"
  }
];

const elements = {
  sidebar: document.querySelector("#sidebar"),
  menuToggle: document.querySelector("#menuToggle"),
  themeToggle: document.querySelector("#themeToggle"),
  taskSearch: document.querySelector("#taskSearch"),
  globalSearch: document.querySelector("#globalSearch"),
  statusFilter: document.querySelector("#statusFilter"),
  tableBody: document.querySelector("#taskTableBody"),
  emptyState: document.querySelector("#emptyState"),
  taskCount: document.querySelector("#taskCount"),
  totalProjects: document.querySelector("#totalProjects"),
  activeTasks: document.querySelector("#activeTasks"),
  completedTasks: document.querySelector("#completedTasks"),
  modal: document.querySelector("#taskModal"),
  openModal: document.querySelector("#openModal"),
  closeModal: document.querySelector("#closeModal"),
  cancelModal: document.querySelector("#cancelModal"),
  taskForm: document.querySelector("#taskForm"),
  taskName: document.querySelector("#taskName"),
  nameError: document.querySelector("#nameError"),
  formMessage: document.querySelector("#formMessage"),
  submitTask: document.querySelector("#submitTask"),
  exportButton: document.querySelector("#exportButton"),
  toast: document.querySelector("#toast")
};

let tasks = [...initialTasks];
let toastTimer;

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("toast--visible");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("toast--visible");
  }, 2600);
}

function getStatusClass(status) {
  const classes = {
    "Completed": "badge--completed",
    "In Progress": "badge--progress",
    "Pending": "badge--pending"
  };

  return classes[status] || "badge--pending";
}

function getPriorityClass(priority) {
  const classes = {
    "High": "badge--high",
    "Medium": "badge--medium",
    "Low": "badge--low"
  };

  return classes[priority] || "badge--medium";
}

function createTaskRow(task) {
  const row = document.createElement("tr");

  const values = [
    task.name,
    task.assignee,
    task.dueDate,
    task.priority,
    task.status
  ];

  values.forEach((value, index) => {
    const cell = document.createElement("td");

    if (index === 3 || index === 4) {
      const badge = document.createElement("span");
      badge.classList.add("badge");

      badge.classList.add(
        index === 3
          ? getPriorityClass(task.priority)
          : getStatusClass(task.status)
      );

      badge.textContent = value;
      cell.append(badge);
    } else {
      cell.textContent = value;
    }

    row.append(cell);
  });

  return row;
}

function renderTasks() {
  const searchTerm = elements.taskSearch.value.trim().toLowerCase();
  const selectedStatus = elements.statusFilter.value;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm) ||
      task.assignee.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || task.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  elements.tableBody.replaceChildren();

  filteredTasks.forEach((task) => {
    elements.tableBody.append(createTaskRow(task));
  });

  elements.emptyState.hidden = filteredTasks.length > 0;
  elements.taskCount.textContent =
    `Showing ${filteredTasks.length} of ${tasks.length} tasks`;

  updateStatistics();
}

function updateStatistics() {
  elements.totalProjects.textContent = "12";

  elements.activeTasks.textContent = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  elements.completedTasks.textContent = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
}

function openTaskModal() {
  elements.modal.hidden = false;
  document.body.style.overflow = "hidden";
  elements.taskName.focus();
}

function closeTaskModal() {
  elements.modal.hidden = true;
  document.body.style.overflow = "";
  elements.openModal.focus();
}

function validateTaskName() {
  const value = elements.taskName.value.trim();

  if (value.length < 3) {
    elements.nameError.textContent =
      "Task name must contain at least 3 characters.";

    elements.taskName.setAttribute("aria-invalid", "true");
    return false;
  }

  elements.nameError.textContent = "";
  elements.taskName.removeAttribute("aria-invalid");

  return true;
}

function handleTaskSubmit(event) {
  event.preventDefault();

  if (!validateTaskName()) {
    elements.taskName.focus();
    return;
  }

  if (!elements.taskForm.reportValidity()) {
    return;
  }

  const formData = new FormData(elements.taskForm);

  const newTask = {
    id: Date.now(),
    name: formData.get("taskName").trim(),
    assignee: formData.get("assignee").trim(),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    status: formData.get("status")
  };

  elements.submitTask.disabled = true;
  elements.submitTask.textContent = "Creating...";

  tasks.unshift(newTask);

  renderTasks();
  elements.taskForm.reset();

  elements.submitTask.disabled = false;
  elements.submitTask.textContent = "Create task";

  elements.formMessage.textContent = "";
  closeTaskModal();

  showToast("Task created successfully.");
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("dashboard-theme", theme);
}

function toggleTheme() {
  const currentTheme =
    document.documentElement.dataset.theme || "light";

  setTheme(currentTheme === "light" ? "dark" : "light");
}

function toggleSidebar() {
  const isOpen = elements.sidebar.classList.toggle("sidebar--open");

  elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
}

function exportTasks() {
  if (tasks.length === 0) {
    showToast("There are no tasks to export.");
    return;
  }

  const headers = ["Task name", "Assignee", "Due date", "Priority", "Status"];

  const rows = tasks.map((task) => [
    task.name,
    task.assignee,
    task.dueDate,
    task.priority,
    task.status
  ]);

  const escapeCSV = (value) =>
    `"${String(value).replaceAll('"', '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "bloomrix-tasks.csv";
  link.click();

  URL.revokeObjectURL(url);

  showToast("CSV export completed.");
}

function handleGlobalSearch() {
  elements.taskSearch.value = elements.globalSearch.value;
  renderTasks();

  document.querySelector("#tasks").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function closeSidebarOnOutsideClick(event) {
  const clickedOutside =
    !elements.sidebar.contains(event.target) &&
    !elements.menuToggle.contains(event.target);

  if (clickedOutside && window.innerWidth < 768) {
    elements.sidebar.classList.remove("sidebar--open");
    elements.menuToggle.setAttribute("aria-expanded", "false");
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("dashboard-theme");

  if (savedTheme === "dark" || savedTheme === "light") {
    setTheme(savedTheme);
  }
}

function initializeEvents() {
  elements.taskSearch.addEventListener("input", renderTasks);
  elements.statusFilter.addEventListener("change", renderTasks);

  elements.globalSearch.addEventListener("input", handleGlobalSearch);

  elements.menuToggle.addEventListener("click", toggleSidebar);
  elements.themeToggle.addEventListener("click", toggleTheme);

  elements.openModal.addEventListener("click", openTaskModal);
  elements.closeModal.addEventListener("click", closeTaskModal);
  elements.cancelModal.addEventListener("click", closeTaskModal);

  elements.taskForm.addEventListener("submit", handleTaskSubmit);
  elements.taskName.addEventListener("input", validateTaskName);

  elements.exportButton.addEventListener("click", exportTasks);

  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeTaskModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.modal.hidden) {
      closeTaskModal();
    }
  });

  document.addEventListener("click", closeSidebarOnOutsideClick);
}

function initializeDashboard() {
  initializeTheme();
  initializeEvents();
  renderTasks();
}

initializeDashboard();