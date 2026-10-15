
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');
const formTitle = document.querySelector('#form-title');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');

const projects = [];
let nextId = 1;
let editingId = null;

function renderProjects() {
  projectList.replaceChildren();

  projects.forEach(project => {
    const listItem = document.createElement('li');
    const details = document.createElement('span');

    details.textContent = `${project.name} - ${project.status} `;

    // Edit button
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

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    // Store the stable project ID on the button
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

      // Cancel: do not change the collection
      if (!confirmed) {
        message.textContent = 'Deletion cancelled.';
        return;
      }

      // Confirm: remove only the selected ID
      const index = projects.findIndex(
        item => item.id === selectedId
      );

      if (index === -1) {
        return;
      }

      projects.splice(index, 1);

      // If the deleted project was being edited, reset the form
      if (editingId === selectedId) {
        resetForm();
      }

      message.textContent = 'Project deleted successfully.';
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

    if (project) {
      project.name = name;
      project.status = status;
    }

    message.textContent = 'Project updated successfully.';
  } else {
    projects.push({
      id: nextId++,
      name: name,
      status: status
    });

    message.textContent = 'Project added successfully.';
  }

  resetForm();
  renderProjects();
});

cancelButton.addEventListener('click', () => {
  resetForm();
  message.textContent = 'Edit cancelled.';
});

renderProjects();
