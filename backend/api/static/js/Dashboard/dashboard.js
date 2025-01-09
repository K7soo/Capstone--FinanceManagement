        // Earnings Chart
        const earningsCtx = document.getElementById('earningsChart').getContext('2d');
        new Chart(earningsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Leaf CRM', 'Mivy App', 'Others'],
                datasets: [{
                    data: [7660, 2820, 45257],
                    backgroundColor: ['#28a745', '#007bff', '#6c757d'],
                }]
            },
        });

        // Avg Agent Earnings Chart
        const agentEarningsCtx = document.getElementById('agentEarningsChart').getContext('2d');
        new Chart(agentEarningsCtx, {
            type: 'line',
            data: {
                labels: ['4:30 PM', '11:35 AM', '3:30 PM'],
                datasets: [{
                    label: 'Earnings',
                    data: [2345.45, 756.26, 1756.26],
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderColor: '#007bff',
                    fill: true,
                    tension: 0.4,
                }]
            }
        });

        // Daily Sales Chart
        const dailySalesCtx = document.getElementById('dailySalesChart').getContext('2d');
        new Chart(dailySalesCtx, {
            type: 'bar',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [{
                    label: 'Sales',
                    data: [240, 480, 300, 500, 420, 600, 700],
                    backgroundColor: '#007bff',
                }]
            }
        });

        // Discounted Product Sales Chart
        const discountedSalesCtx = document.getElementById('discountedSalesChart').getContext('2d');
        new Chart(discountedSalesCtx, {
            type: 'line',
            data: {
                labels: ['Apr 04', 'Apr 07', 'Apr 10', 'Apr 13', 'Apr 18'],
                datasets: [{
                    label: 'Discounted Sales',
                    data: [330, 340, 350, 360, 370],
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderColor: '#007bff',
                    fill: true,
                    tension: 0.4,
                }]
            }
        });