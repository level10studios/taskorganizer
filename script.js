document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskDesc = document.getElementById('taskDesc');
    const titleCounter = document.getElementById('titleCounter');
    const descCounter = document.getElementById('descCounter');
    const priorityButtons = document.querySelectorAll('.btn-priority');
    const btnTrash = document.querySelector('.btn-trash');
    const addBtn = document.getElementById('addBtn');
    
    // Lists and Counts
    const columns = {
        'todo': { list: document.getElementById('list-todo'), count: document.getElementById('count-todo') },
        'in-progress': { list: document.getElementById('list-in-progress'), count: document.getElementById('count-in-progress') },
        'done': { list: document.getElementById('list-done'), count: document.getElementById('count-done') }
    };
    
    // State
    let selectedPriority = 'media';
    let draggedTask = null;

    // --- Form Handlers ---
    
    taskInput.addEventListener('input', () => {
        titleCounter.textContent = taskInput.value.length;
        // Validate
        if(taskInput.value.trim().length > 0) {
            addBtn.disabled = false;
        } else {
            addBtn.disabled = true;
        }
    });

    taskDesc.addEventListener('input', () => {
        descCounter.textContent = taskDesc.value.length;
    });

    priorityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            priorityButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPriority = btn.dataset.priority;
        });
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskInput.value.trim();
        const desc = taskDesc.value.trim();
        
        if (!title) return;

        // Verificar si la tarea ya existe (sin distinguir mayúsculas/minúsculas)
        const isDuplicate = Array.from(document.querySelectorAll('.task-title'))
            .some(el => el.textContent.trim().toLowerCase() === title.toLowerCase());
            
        if (isDuplicate) {
            alert('La tarea ya existe.');
            return;
        }

        createTask(title, desc, selectedPriority);
        
        // Reset form
        taskInput.value = '';
        taskDesc.value = '';
        titleCounter.textContent = '0';
        descCounter.textContent = '0';
        addBtn.disabled = true;
    });

    // Trash all
    btnTrash.addEventListener('click', () => {
        if(confirm('¿Estás seguro de que quieres borrar todas las tareas?')) {
            Object.values(columns).forEach(col => {
                const tasks = col.list.querySelectorAll('.task-card');
                tasks.forEach(t => t.remove());
            });
            updateAllColumns();
        }
    });

    // --- Task Creation ---

    function createTask(title, desc, priority) {
        const taskId = 'task-' + Date.now();
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.dataset.testid = `task-card-${taskId}`;
        
        // Priority label mapping
        const priorityLabels = { 'alta': 'Alta', 'media': 'Media', 'baja': 'Baja' };
        
        card.innerHTML = `
            <div class="task-card-header">
                <h4 class="task-title" data-testid="task-title-${taskId}">${title}</h4>
            </div>
            ${desc ? `<p class="task-desc" data-testid="task-desc-${taskId}">${desc}</p>` : ''}
            <div class="task-footer">
                <span class="badge-priority badge-${priority}">${priorityLabels[priority]}</span>
                <button class="btn-delete-task" data-testid="btn-delete-${taskId}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        // Delete Event
        card.querySelector('.btn-delete-task').addEventListener('click', () => {
            const list = card.parentElement;
            card.remove();
            updateColumn(list.parentElement.dataset.status);
        });

        // Drag Events
        card.addEventListener('dragstart', (e) => {
            draggedTask = card;
            setTimeout(() => card.classList.add('dragging'), 0);
        });

        card.addEventListener('dragend', () => {
            draggedTask = null;
            card.classList.remove('dragging');
        });

        // Append to Todo
        columns['todo'].list.appendChild(card);
        updateColumn('todo');
    }

    // --- Drag and Drop ---
    
    document.querySelectorAll('.board-column').forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', e => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            if (draggedTask) {
                const list = column.querySelector('.task-list');
                const previousColumnStatus = draggedTask.closest('.board-column').dataset.status;
                
                list.appendChild(draggedTask);
                
                updateColumn(previousColumnStatus);
                updateColumn(column.dataset.status);
            }
        });
    });

    // --- UI Updates ---
    
    function updateColumn(status) {
        const col = columns[status];
        const tasks = col.list.querySelectorAll('.task-card');
        col.count.textContent = tasks.length;

        // Handle Empty State
        let emptyState = col.list.querySelector('.empty-state');
        
        if (tasks.length === 0) {
            if (!emptyState) {
                const template = document.getElementById('empty-state-template').content.cloneNode(true);
                // Adjust icon based on column status
                const iconSvg = template.querySelector('.empty-icon-circle svg');
                if(status === 'todo') iconSvg.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
                if(status === 'in-progress') iconSvg.innerHTML = '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>';
                if(status === 'done') iconSvg.innerHTML = '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>';
                
                col.list.appendChild(template);
            }
        } else {
            if (emptyState) {
                emptyState.remove();
            }
        }
    }

    function updateAllColumns() {
        updateColumn('todo');
        updateColumn('in-progress');
        updateColumn('done');
    }

    // Initialize
    addBtn.disabled = true;
    updateAllColumns();
});
