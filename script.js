const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total-amount');

// Expandable UI Elements
const inputGroup = document.getElementById('input-group');
const toggleBtn = document.getElementById('toggle-input-btn');
const cancelBtn = document.getElementById('cancel-btn');

// Initialize State
let expenses = JSON.parse(localStorage.getItem('finance_expenses')) || [];

// Initial Render
renderAll();

// Event Listeners
form.addEventListener('submit', addExpense);
toggleBtn.addEventListener('click', showForm);
cancelBtn.addEventListener('click', hideForm);

function showForm() {
    toggleBtn.style.display = 'none';
    form.classList.remove('hidden');
    inputGroup.classList.add('expanded');
}

function hideForm() {
    form.classList.add('hidden');
    inputGroup.classList.remove('expanded');
    
    // Wait for animation to finish before showing button again
    setTimeout(() => {
        toggleBtn.style.display = 'flex';
    }, 100); // Matches CSS transition time roughly
    
    // Reset form on cancel if desired, or keep draft. Let's reset for clean UI.
    form.reset();
    document.getElementById('date').valueAsDate = new Date();
}

function addExpense(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if (!amount || !description || !category || !date) return;

  const expense = {
    id: Date.now(),
    amount,
    description,
    category,
    date,
  };

  expenses.unshift(expense); // Add to beginning of array
  saveData();
  renderAll();
  
  // Collapse form after adding
  hideForm();
}

function renderAll() {
  renderList();
  updateTotal();
}

function renderList() {
  list.innerHTML = '';
  
  if (expenses.length === 0) {
    list.innerHTML = `<li style="text-align:center; color: var(--text-secondary); padding: 20px;">No expenses yet.</li>`;
    return;
  }

  expenses.forEach(expense => {
    const item = document.createElement('li');
    item.classList.add('expense-item');
    
    // Format Date
    const dateObj = new Date(expense.date + 'T12:00:00'); // Fix Timezone issue by setting noon
    const dateStr = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Format Currency
    const amountStr = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(expense.amount);

    item.innerHTML = `
      <div class="item-left">
        <span class="item-desc">${expense.description}</span>
        <span class="item-category">${expense.category}</span>
        <span class="item-date">${dateStr}</span>
      </div>
      <span class="item-amount">-${amountStr}</span>
    `;

    list.appendChild(item);

    enableSwipeToDelete(item);
  });
}

function updateTotal() {
  const total = expenses.reduce((acc, item) => acc + item.amount, 0);
  
  totalDisplay.innerText = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(total);
}

function saveData() {
  localStorage.setItem('finance_expenses', JSON.stringify(expenses));
}

// Set today's date on load
document.getElementById('date').valueAsDate = new Date();

function enableSwipeToDelete(item) {
  let startX = 0;
  let currentX = 0;
  let isSwiping = false;

  item.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    isSwiping = true;
    item.style.transition = "none";
  });

  item.addEventListener("touchmove", e => {
    if (!isSwiping) return;

    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;

    if (deltaX < 0) {
      item.style.transform = `translateX(${deltaX}px)`;
    }
  });

  item.addEventListener("touchend", () => {
    isSwiping = false;
    item.style.transition = "transform 0.2s ease";

    const threshold = -80; // px to trigger delete
    const finalX = currentX - startX;

    if (finalX < threshold) {
      item.style.transform = "translateX(-100%)";
      item.style.opacity = "0";

      setTimeout(() => {
        item.remove();
        updateTotal(); // important if you track totals
      }, 200);
    } else {
      item.style.transform = "translateX(0)";
    }
  });
}
