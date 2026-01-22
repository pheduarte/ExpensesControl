const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total-amount');

// Initialize State
let expenses = JSON.parse(localStorage.getItem('finance_expenses')) || [];

// Initial Render
renderAll();

// Event Listeners
form.addEventListener('submit', addExpense);

function addExpense(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value;
  const date = document.getElementById('date').value;

  if (!amount || !description || !date) return;

  const expense = {
    id: Date.now(),
    amount,
    description,
    date,
  };

  expenses.unshift(expense); // Add to beginning of array
  saveData();
  renderAll();
  form.reset();
  
  // Set default date to today after reset (UX improvement)
  document.getElementById('date').valueAsDate = new Date();
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
        <span class="item-date">${dateStr}</span>
      </div>
      <span class="item-amount">-${amountStr}</span>
    `;

    list.appendChild(item);
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
