const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const clearCompletedButton = document.getElementById("clearCompleted");

let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem("focusflow-tasks")) || [];
} catch {
  tasks = [];
}

let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("focusflow-tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });

  const completed = tasks.filter(task => task.completed).length;
  const total = tasks.length;
  const active = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("totalCount").textContent = total;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("progressPercent").textContent = `${percentage}%`;
  document.getElementById("progressBar").style.width = `${percentage}%`;
  document.getElementById("allFilterCount").textContent = total;
  document.getElementById("activeFilterCount").textContent = active;
  document.getElementById("doneFilterCount").textContent = completed;

  emptyState.hidden = visibleTasks.length > 0;
  clearCompletedButton.disabled = completed === 0;
  clearCompletedButton.style.opacity = completed === 0 ? "0.45" : "1";

  document.querySelectorAll(".filter-button").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    id: Date.now() + Math.random(),
    text,
    completed: false
  });

  taskInput.value = "";
  saveTasks();
  renderTasks();
  taskInput.focus();
});

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

document.getElementById("todayDate").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

renderTasks();
