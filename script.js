// Local Storage Key
const LOCAL_STORAGE_KEY = "flowtab_v1";

// State
let transactions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
let financeChart = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    // Set today's date in input
    if(document.getElementById("date")) {
        document.getElementById("date").valueAsDate = new Date();
    }
    // Set header date
    if(document.getElementById("current-date")) {
        document.getElementById("current-date").textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    updateUI();
});

function addTransaction() {
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;

    if (!description || !amount || isNaN(amount) || !date) {
        alert("Please fill in all fields.");
        return;
    }

    const transaction = {
        id: Date.now(),
        date,
        description,
        category,
        amount,
        type
    };

    transactions.push(transaction);
    saveAndRender();
    
    // Reset form (keep date)
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
}

function deleteTransaction(id) {
    if(confirm("Are you sure you want to delete this record?")) {
        transactions = transactions.filter(t => t.id !== id);
        saveAndRender();
    }
}

function saveAndRender() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    updateUI();
}

function updateUI() {
    renderTable();
    renderSummary();
    renderChart();
}

// Format Currency
const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function renderTable() {
    const list = document.getElementById("transaction-list");
    if(!list) return;

    list.innerHTML = "";

    // Sort by Date (Newest First)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.forEach(t => {
        const row = document.createElement("tr");
        
        const badgeClass = t.type === 'income' ? 'badge-income' : 'badge-expense';

        // Inline styles for text colors in the main dashboard
        const colorStyle = t.type === 'income' ? 'color: #10b981;' : 'color: #ef4444;';

        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td><span class="badge ${badgeClass}">${t.category}</span></td>
            <td style="text-transform: capitalize;">${t.type}</td>
            <td class="text-right" style="${colorStyle}"><strong>${formatCurrency(t.amount)}</strong></td>
            <td class="text-center">
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
            </td>
        `;
        list.appendChild(row);
    });
}

function renderSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    if(document.getElementById("total-income")) document.getElementById("total-income").textContent = formatCurrency(totalIncome);
    if(document.getElementById("total-expenses")) document.getElementById("total-expenses").textContent = formatCurrency(totalExpenses);
    if(document.getElementById("net-balance")) document.getElementById("net-balance").textContent = formatCurrency(netBalance);
}

function renderChart() {
    const ctx = document.getElementById('financeChart');
    if(!ctx) return;
    
    // Calculate totals for chart
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    if (financeChart) {
        financeChart.destroy();
    }

    financeChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Export to CSV
function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Description,Category,Type,Amount\n";

    transactions.forEach(t => {
        const row = `${t.date},${t.description},${t.category},${t.type},${t.amount}`;
        csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Flowtab_Data.csv");
    document.body.appendChild(link);
    link.click();
}

// ==========================================
//  PROFESSIONAL REPORT PRINTING FUNCTION
// ==========================================
function printReport() {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let printWindow = window.open("", "PRINT", "height=800,width=1000");

    printWindow.document.write(`
        <html>
        <head>
            <title>Financial Statement - Flowtab</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    color: #1e293b;
                    padding: 40px;
                    max-width: 900px;
                    margin: 0 auto;
                }
                
                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 20px;
                    margin-bottom: 40px;
                }
                .brand h1 { font-size: 24px; color: #0f172a; margin: 0; }
                .brand span { color: #2563eb; }
                .brand p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
                
                .report-info { text-align: right; }
                .report-info h2 { margin: 0; font-size: 20px; color: #334155; }
                .report-info p { margin: 5px 0 0; color: #64748b; }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .box {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    text-align: center;
                }
                .box h3 { font-size: 12px; text-transform: uppercase; color: #64748b; margin: 0 0 10px 0; letter-spacing: 0.5px; }
                .box p { font-size: 24px; font-weight: 700; margin: 0; }
                .text-green { color: #10b981; }
                .text-red { color: #ef4444; }
                .text-dark { color: #0f172a; }

                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                thead { background: #0f172a; color: white; }
                th { padding: 12px 15px; text-align: left; font-weight: 600; letter-spacing: 0.5px; }
                td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
                tr:nth-child(even) { background-color: #f8fafc; }
                
                .text-right { text-align: right; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
                .bg-inc { background: #dcfce7; color: #166534; }
                .bg-exp { background: #fee2e2; color: #991b1b; }

                .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
            </style>
        </head>
        <body>
            
            <div class="header-container">
                <div class="brand">
                    <h1>Flow<span>tab</span></h1>
                    <p>Simple Income & Expense Tracker</p>
                </div>
                <div class="report-info">
                    <h2>Statement of Accounts</h2>
                    <p>Generated on: ${dateStr}</p>
                </div>
            </div>

            <div class="summary-grid">
                <div class="box">
                    <h3>Total Income</h3>
                    <p class="text-green">${formatCurrency(totalIncome)}</p>
                </div>
                <div class="box">
                    <h3>Total Expenses</h3>
                    <p class="text-red">${formatCurrency(totalExpenses)}</p>
                </div>
                <div class="box">
                    <h3>Net Balance</h3>
                    <p class="text-dark">${formatCurrency(netBalance)}</p>
                </div>
            </div>

            <h3>Transaction History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
    `);

    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(t => {
        const badgeClass = t.type === 'income' ? 'bg-inc' : 'bg-exp';
        const amountColor = t.type === 'income' ? 'text-green' : 'text-red';
        
        printWindow.document.write(`
            <tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td><span class="badge ${badgeClass}">${t.category}</span></td>
                <td style="text-transform: capitalize;">${t.type}</td>
                <td class="text-right ${amountColor}"><strong>${formatCurrency(t.amount)}</strong></td>
            </tr>
        `);
    });

    printWindow.document.write(`
                </tbody>
            </table>

            <div class="footer">
                <p>&copy; 2026 Flowtab. This is a computer-generated document.</p>
            </div>

        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}
