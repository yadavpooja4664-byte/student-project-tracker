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

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    editButton.addEventListener('click', () => {
      editingId = project.id;
      nameInput.value = project.name;
      statusInput.value = project.status;
      formTitle.textContent = 'Edit Project';
      saveButton.textContent = 'Update Project';
      cancelButton.hidden = false;
      message.textContent = 'Edit the project and click Update Project.';
      nameInput.focus();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '8px';

    deleteButton.addEventListener('click', () => {
      const index = projects.findIndex(item => item.id === project.id);

      if (index !== -1) {
        projects.splice(index, 1);
      }

      if (editingId === project.id) {
        resetForm();
      }

      renderProjects();
      message.textContent = 'Project deleted.';
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
    const project = projects.find(item => item.id === editingId);

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