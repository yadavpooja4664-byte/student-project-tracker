
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');
const formTitle = document.querySelector('#form-title');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');

const STORAGE_KEY = 'workshop-projects-v1';

let projects = [];
let nextId = 1;
let editingId = null;
let storageReady = false;

// Load saved projects when the page starts
function loadProjects() {
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);

    if (savedText === null) {
      projects = [];
      storageReady = true;
      renderProjects();
      return;
    }

    const savedProjects = JSON.parse(savedText);

    const valid =
      Array.isArray(savedProjects) &&
      savedProjects.every(project =>
        project !== null &&
        typeof project === 'object' &&
        Number.isSafeInteger(project.id) &&
        project.id > 0 &&
        typeof project.name === 'string' &&
        ['Planned', 'In Progress', 'Completed'].includes(project.status)
      ) &&
      new Set(savedProjects.map(project => project.id)).size ===
        savedProjects.length;

    if (!valid) {
      message.textContent =
        'Saved project data is invalid. Existing saved data was not changed.';
      renderProjects();
      return;
    }

    projects = savedProjects;
    nextId = projects.reduce(
      (largest, project) => Math.max(largest, project.id),
      0
    ) + 1;

    storageReady = true;
    renderProjects();
  } catch (error) {
    message.textContent =
      'Could not load saved projects. Check browser storage and try again.';
    renderProjects();
  }
}

// Convert projects to text and save them
function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (error) {
    message.textContent =
      'Changes could not be saved. Check browser storage space or permissions.';
    return false;
  }
}

function renderProjects() {
  projectList.replaceChildren();

  projects.forEach(project => {
    const listItem = document.createElement('li');
    const details = document.createElement('span');

    details.textContent = `${project.name} - ${project.status} `;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    editButton.addEventListener('click', () => {
      editingId = project.id;
      nameInput.value = project.name;
      statusInput.value = project.status;

      formTitle.textContent = 'Edit Project';
      saveButton.textContent = 'Save changes';
      cancelButton.hidden = false;

      message.textContent = 'Edit the project and save your changes.';
      nameInput.focus();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.dataset.projectId = String(project.id);

    deleteButton.addEventListener('click', () => {
      const selectedId = Number(deleteButton.dataset.projectId);

      const selectedProject = projects.find(
        item => item.id === selectedId
      );

      if (!selectedProject) {
        return;
      }

      const confirmed = window.confirm(
        `Delete project "${selectedProject.name}"?`
      );

      if (!confirmed) {
        message.textContent = 'Deletion cancelled.';
        return;
      }

      const index = projects.findIndex(
        item => item.id === selectedId
      );

      if (index === -1) {
        return;
      }

      const deletedProject = projects[index];
      projects.splice(index, 1);

      if (editingId === selectedId) {
        resetForm();
      }

      if (saveProjects()) {
        message.textContent = 'Project deleted successfully.';
      } else {
        // Restore the project if saving failed
        projects.splice(index, 0, deletedProject);
        renderProjects();
        return;
      }

      renderProjects();
    });

    listItem.append(details, editButton, deleteButton);
    projectList.appendChild(listItem);
  });

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

function resetForm() {
  form.reset();
  editingId = null;

  formTitle.textContent = 'Add a Project';
  saveButton.textContent = 'Save Project';
  cancelButton.hidden = true;
}

form.addEventListener('submit', event => {
  event.preventDefault();

  if (!storageReady) {
    message.textContent =
      'Projects are not loaded safely. Refresh or check the saved data before making changes.';
    return;
  }

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    message.textContent = 'Please enter a project name.';
    nameInput.focus();
    return;
  }

  if (editingId !== null) {
    const project = projects.find(
      item => item.id === editingId
    );

    if (!project) {
      resetForm();
      renderProjects();
      message.textContent = 'Project not found. Please try again.';
      return;
    }

    const oldName = project.name;
    const oldStatus = project.status;

    project.name = name;
    project.status = status;

    if (!saveProjects()) {
      project.name = oldName;
      project.status = oldStatus;
      renderProjects();
      return;
    }

    message.textContent = 'Project updated and saved successfully.';
  } else {
    const newProject = {
      id: nextId,
      name: name,
      status: status
    };

    projects.push(newProject);

    if (!saveProjects()) {
      projects.pop();
      renderProjects();
      return;
    }

    nextId++;
    message.textContent = 'Project added and saved successfully.';
  }

  resetForm();
  renderProjects();
});

cancelButton.addEventListener('click', () => {
  resetForm();
  message.textContent = 'Edit cancelled.';
});

loadProjects();
