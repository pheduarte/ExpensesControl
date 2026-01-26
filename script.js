const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total-amount');

// Expandable UI Elements
const inputGroup = document.getElementById('input-group');
const toggleBtn = document.getElementById('toggle-input-btn');
const cancelBtn = document.getElementById('cancel-btn');

// Type Selection Elements
const expenseBtn = document.getElementById('expense-btn');
const incomeBtn = document.getElementById('income-btn');

// Initialize State
let expenses = JSON.parse(localStorage.getItem('finance_expenses')) || [];
let currentType = 'expense'; // Default type

// Initial Render
renderAll();

// Event Listeners
form.addEventListener('submit', addExpense);
toggleBtn.addEventListener('click', showForm);
cancelBtn.addEventListener('click', hideForm);

expenseBtn.addEventListener('click', () => setType('expense'));
incomeBtn.addEventListener('click', () => setType('income'));

function setType(type) {
    currentType = type;
    
    if (type === 'expense') {
        expenseBtn.classList.remove('inactive');
        incomeBtn.classList.remove('active');
    } else {
        expenseBtn.classList.add('inactive');
        incomeBtn.classList.add('active');
    }
}

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
    
    resetForm();
}

function resetForm() {
    form.reset();
    document.getElementById('date').valueAsDate = new Date();
    setType('expense'); // Reset to default type
}

function addExpense(e) {
  e.preventDefault();

  let amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if (!amount || !description || !category || !date) return;

  // Adjust logic based on currentType
  if (currentType === 'expense') {
      amount = -Math.abs(amount);
  } else {
      amount = Math.abs(amount);
  }

  const expense = {
    id: Date.now(),
    amount,
    description,
    category,
    date,
    type: currentType
  };

  expenses.unshift(expense); 
  saveData();
  renderAll();
  
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
        currency: 'USD',
        signDisplay: 'always'
    }).format(expense.amount);

    // Determine Logic for Colors
    const amountClass = expense.amount >= 0 ? 'positive' : 'negative';

    item.innerHTML = `
      <div class="item-left">
        <span class="item-desc">${expense.description}</span>
        <span class="item-category">${expense.category}</span>
        <span class="item-date">${dateStr}</span>
      </div>
      <span class="item-amount ${amountClass}">${amountStr}</span>
    `;

    list.appendChild(item);

    enableSwipeToDelete(item, expense.id);
  });
}

function updateTotal() {
  const total = expenses.reduce((acc, item) => acc + item.amount, 0);
  
  totalDisplay.innerText = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'USD'
  }).format(total);
}

function saveData() {
  localStorage.setItem('finance_expenses', JSON.stringify(expenses));
}

// Set today's date on load
document.getElementById('date').valueAsDate = new Date();

function enableSwipeToDelete(item, expenseId) {
  let startX = 0;
  let currentX = 0;
  let isSwiping = false;

  item.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    currentX = startX; // ✅ prevents tap = accidental delete
    isSwiping = true;

    item.style.transition = "none";
  }, { passive: true });

  item.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;

    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;

    // swipe left only
    if (deltaX < 0) {
      item.style.transform = `translateX(${deltaX}px)`;
    }
  }, { passive: true });

  item.addEventListener("touchend", () => {
    if (!isSwiping) return;
    isSwiping = false;

    const deltaX = currentX - startX;
    const threshold = -80;

    item.style.transition = "transform 0.2s ease, opacity 0.2s ease";

    if (deltaX < threshold) {
      item.style.transform = "translateX(-110%)";
      item.style.opacity = "0";

      setTimeout(() => {
        expenses = expenses.filter(x => x.id !== expenseId);
        saveData();
        renderAll();
      }, 200);
    } else {
      item.style.transform = "translateX(0)";
    }
  });

  item.addEventListener("touchcancel", () => {
    isSwiping = false;
    item.style.transition = "transform 0.2s ease";
    item.style.transform = "translateX(0)";
  });
}
