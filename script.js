// Local storage key
const LOCAL_STORAGE_KEY = "riska_finance_transactions";

// Load existing transactions
let transactions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

function addTransaction() {
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  if (description && amount && !isNaN(amount)) {
    const transaction = { id: Date.now(), description, amount, type };
    transactions.push(transaction);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));

    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";

    displayTransactions();
    displayReport();
  } else {
    alert("Please enter a valid description and amount.");
  }
}

function displayTransactions() {
  const transactionList = document.getElementById("transaction-list");
  transactionList.innerHTML = "";

  transactions.forEach((transaction) => {
    const transactionItem = document.createElement("li");
    transactionItem.textContent = `${transaction.description}: $${transaction.amount} (${transaction.type})`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteTransaction(transaction.id);

    transactionItem.appendChild(deleteBtn);
    transactionList.appendChild(transactionItem);
  });
}

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  displayTransactions();
  displayReport();
}

function displayReport() {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  document.getElementById("total-income").textContent = `$${totalIncome.toFixed(2)}`;
  document.getElementById("total-expenses").textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById("net-balance").textContent = `$${netBalance.toFixed(2)}`;
}

// Function to print the report
function printReport() {
  let reportWindow = window.open("", "PRINT", "height=600,width=800");

  reportWindow.document.write(`
    <html>
    <head>
      <title>Riska's Finance Report</title>
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #6a11cb; text-align: center; }
        .summary, .transaction-list {
          max-width: 600px;
          margin: 20px auto;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        .summary div, .transaction-list li {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }
        .transaction-list {
          list-style: none;
          padding: 0;
        }
      </style>
    </head>
    <body>
      <h1>Riska's Finance Report</h1>
      <div class="summary">
        <div><strong>Total Income:</strong> <span>$${document.getElementById("total-income").textContent}</span></div>
        <div><strong>Total Expenses:</strong> <span>$${document.getElementById("total-expenses").textContent}</span></div>
        <div><strong>Net Balance:</strong> <span>$${document.getElementById("net-balance").textContent}</span></div>
      </div>
      <h2 style="text-align: center;">Transactions</h2>
      <ul class="transaction-list">
  `);

  transactions.forEach(transaction => {
    reportWindow.document.write(`
      <li><span>${transaction.description}</span><span>$${transaction.amount.toFixed(2)} (${transaction.type})</span></li>
    `);
  });

  reportWindow.document.write(`
      </ul>
    </body>
    </html>
  `);

  reportWindow.document.close();
  reportWindow.print();
}

// Initialize display
displayTransactions();
displayReport();
