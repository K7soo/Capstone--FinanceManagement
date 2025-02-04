document.addEventListener('DOMContentLoaded', function () {
    fetch('/total-income/')
        .then(response => response.json())
        .then(data => {
            // Assuming the backend returns { "total_income": 76500, "growth_percentage": 5.8 }
            document.getElementById('totalRevenue').innerText = `₱${data.total_income.toLocaleString()}`;

            const growthElement = document.getElementById('growthPercentage');
            growthElement.innerHTML = `<i class="mdi mdi-arrow-top-right"></i> ${data.growth_percentage}%`;
            growthElement.classList.add(data.growth_percentage >= 0 ? 'text-success' : 'text-danger');

        })
        .catch(error => console.error('Error fetching total income:', error));
        
    // Income vs Expenses Chart
    const incomeExpensesCtx = document.getElementById('incomeExpensesChart').getContext('2d');
    new Chart(incomeExpensesCtx, {
        type: 'bar',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May'],
            datasets: [
                {
                    label: 'Income (₱)',
                    data: [120000, 130000, 125000, 140000, 150000],
                    backgroundColor: '#28a745',
                },
                {
                    label: 'Expenses (₱)',
                    data: [80000, 85000, 90000, 95000, 100000],
                    backgroundColor: '#dc3545',
                }
            ]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `₱${context.raw.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });

    // Outstanding Invoices Chart
    const outstandingInvoicesCtx = document.getElementById('outstandingInvoicesChart').getContext('2d');
    new Chart(outstandingInvoicesCtx, {
        type: 'pie',
        data: {
            labels: ['Paid', 'Unpaid', 'Overdue'],
            datasets: [{
                data: [70, 20, 10],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
            }]
        }
    });

    // Account Balances Chart
    const accountBalancesCtx = document.getElementById('accountBalancesChart').getContext('2d');
    new Chart(accountBalancesCtx, {
        type: 'bar',
        data: {
            labels: ['Checking', 'Savings', 'Credit'],
            datasets: [{
                label: 'Balance (₱)',
                data: [150000, 100000, 50000],
                backgroundColor: ['#007bff', '#28a745', '#ffc107'],
            }]
        }
    });

    // Cash Flow Chart
    const cashFlowCtx = document.getElementById('cashFlowChart').getContext('2d');
    new Chart(cashFlowCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Cash Flow (₱)',
                data: [20000, 25000, 30000, 40000],
                borderColor: '#6f42c1',
                backgroundColor: 'rgba(111, 66, 193, 0.2)',
                tension: 0.4,
                fill: true,
            }]
        }
    });

    // Monthly Trends Chart
    const monthlyTrendsCtx = document.getElementById('monthlyTrendsChart').getContext('2d');
    new Chart(monthlyTrendsCtx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May'],
            datasets: [{
                label: 'Revenue (₱)',
                data: [400000, 420000, 450000, 480000, 500000],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                tension: 0.4,
                fill: true,
            }]
        }
    });
});
