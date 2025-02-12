document.addEventListener('DOMContentLoaded', function () {
    loadFinancialData();
    loadCashFlowChart();
    loadIncomeVsExpensesChart();
    loadDebtToEquityChart();

    fetch('/total-income/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalRevenue').innerText = `₱${Number(data.total_income).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

            const growthElement = document.getElementById('growthPercentage');
            growthElement.innerHTML = `<i class="mdi mdi-arrow-top-right"></i> ${data.growth_percentage}%`;
            growthElement.classList.add(data.growth_percentage >= 0 ? 'text-success' : 'text-danger');
        })
        .catch(error => console.error('Error fetching total income:', error));

    // Fetch Cost of Goods Sold (COGS)
    fetch('/total-cogs/')
        .then(response => response.json())
        .then(data => {
            const cogsElement = document.getElementById('totalCOGS');
            if (data.total_cogs !== undefined) {
                cogsElement.innerText = `₱${Number(data.total_cogs).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            } else {
                cogsElement.innerText = "₱0.00";
            }
        })
        .catch(error => console.error('Error fetching total COGS:', error));

    // -- NET PROFIT -- //
    function loadFinancialData() {
        const totalIncomeUrl = "/total-income/";
        const totalExpensesUrl = "/total-expenses/";
    
        // Fetch Total Revenue (Income)
        const fetchIncome = fetch(totalIncomeUrl)
            .then(response => response.json())
            .then(data => data.total_income || 0)
            .catch(error => {
                console.error("Error fetching Total Revenue:", error);
                return 0;
            });
    
        // Fetch Total Expenses (Includes COGS)
        const fetchExpenses = fetch(totalExpensesUrl)
            .then(response => response.json())
            .then(data => data.total_expense || 0)
            .catch(error => {
                console.error("Error fetching Total Expenses:", error);
                return 0;
            });
    
        // Process all fetch requests together
        Promise.all([fetchIncome, fetchExpenses])
            .then(([totalRevenue, totalExpenses]) => {
                // Compute Net Profit = Total Revenue - Total Expenses
                const netProfit = totalRevenue - totalExpenses;
    
                // Display Net Profit
                document.getElementById("net-profit-value").innerText = `₱${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
            })
            .catch(error => console.error("Error processing financial data:", error));
    }

    // -- Income vs Expenses Over Time Chart -- //
    function loadIncomeVsExpensesChart() {
        fetch("/income-vs-expenses-ot/")
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    console.warn("No income vs expenses data available.");
                    return;
                }
    
                // Extract labels (weeks) and datasets
                const labels = data.map(entry => new Date(entry.period).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
                const incomeData = data.map(entry => entry.total_income);
                const expenseData = data.map(entry => entry.total_expenses);
    
                // Render Chart
                renderIncomeExpensesChart(labels, incomeData, expenseData);
            })
            .catch(error => console.error("Error fetching income vs expenses data:", error));
    }

    function renderIncomeExpensesChart(labels, incomeData, expenseData) {
        const ctx = document.getElementById("incomeExpensesChart").getContext("2d");
    
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Income",
                        data: incomeData,
                        backgroundColor: 'rgba(137, 76, 236, 0.66)',
                        yAxisID: "y"
                    },
                    {
                        label: "Expenses",
                        data: expenseData,
                        backgroundColor: 'rgba(78, 12, 184, 0.74)',
                        yAxisID: "y"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Amount (₱)"
                        }
                    },
                },
                plugins: {
                    legend: {
                        position: "top"
                    }
                }
            }
        });
    }

    // -- Cash Flow Charts -- //

    function loadCashFlowChart() {
        fetch("/cashflow/")
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    console.warn("No cash flow data available.");
                    return;
                }
    
                // Extract labels (weeks) & datasets
                const labels = data.map(entry => new Date(entry.period).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
                const inflows = data.map(entry => entry.total_inflows);
                const outflows = data.map(entry => entry.total_outflows);
                const netflows = data.map(entry => entry.net_cash_flow);
    
                renderCashFlowChart(labels, inflows, outflows, netflows);
            })
            .catch(error => console.error("Error fetching cash flow data:", error));
    }

    // Stacked Bar Cash Flow Chart
    function renderCashFlowChart(labels, inflows, outflows, netflows) {
        const ctxBar = document.getElementById("multiCashFlowChart").getContext("2d");
        const ctxLine = document.getElementById("cashFlowChart").getContext("2d");
    
        // Determine max absolute value for symmetric y-axis
        const maxAbsValue = Math.max(
            ...inflows.map(Math.abs),
            ...outflows.map(Math.abs),
            ...netflows.map(Math.abs)
        );
        const yLimit = Math.ceil(maxAbsValue * 1.2); // Add padding for better visualization
    
        // Stacked Bar Chart (Inflows & Outflows)
        new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Inflows",
                        data: inflows,
                        backgroundColor: 'rgba(78, 12, 184, 0.74)', // Purple for inflows
                        borderWidth: 1,
                        stack: 'cashFlowStack' // Ensure stacking
                    },
                    {
                        label: "Outflows",
                        data: outflows.map(value => -value), // Convert to negative for stacking
                        backgroundColor: 'rgba(226, 160, 17, 0.74)', // Orange for outflows
                        borderWidth: 1,
                        stack: 'cashFlowStack' // Ensure stacking
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        title: { display: true, text: "Time Period" },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0
                        }
                    },
                    y: {
                        stacked: true,
                        min: -yLimit,
                        max: yLimit,
                        title: { display: true, text: "Amount (₱)" },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString("en-US"); // Format numbers with commas
                            }
                        }
                    }
                },
                plugins: {
                    legend: { position: "top" }
                }
            }
        });
    
        // Line Chart (Net Cash Flow)
        new Chart(ctxLine, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Net Cash Flow",
                        data: netflows,
                        borderColor: '#6f42c1',
                        backgroundColor: 'rgba(111, 66, 193, 0.2)',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 5 // Make points more visible
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: -yLimit,
                        max: yLimit,
                        title: { display: true, text: "Net Amount (₱)" },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString("en-US");
                            }
                        }
                    }
                },
                plugins: {
                    legend: { position: "top" }
                }
            }
        });
    }


    function loadDebtToEquityChart() {
        fetch("/debt-to-equity-trend/")
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    console.warn("No debt-to-equity data available.");
                    return;
                }
    
                // Extract Labels & Data
                const labels = data.map(entry => entry.period);
                const debtEquityRatios = data.map(entry => entry.debt_to_equity_ratio);
    
                // Get Latest Ratio & Determine Risk Level
                const latestRatio = debtEquityRatios[debtEquityRatios.length - 1];
                let riskLevel = "Low Risk"; 
                let riskColor = '#007bff';
    
                if (latestRatio >= 2.0) {
                    riskLevel = "High Risk";
                    riskColor = "red";
                } else if (latestRatio >= 1.0) {
                    riskLevel = "Moderate Risk";
                    riskColor = "orange";
                }
    
                // Update Chart
                const ctx = document.getElementById("debtEquityChart").getContext("2d");
    
                new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: "Debt-to-Equity Ratio",
                                data: debtEquityRatios,
                                borderColor: '#6f42c1',
                                backgroundColor: 'rgba(123, 50, 218, 0.34)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 5
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: "Debt-to-Equity Ratio" }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: `Debt-to-Equity Trend (Current Risk: ${riskLevel})`,
                                color: riskColor,
                                font: { size: 16, weight: "bold"}
                            },
                            legend: { position: "top" }
                        }
                    }
                });
            })
            .catch(error => console.error("Error fetching Debt-to-Equity data:", error));
    }


    // -- Account Balances -- //
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
