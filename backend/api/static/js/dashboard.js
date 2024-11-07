// Load Google Charts and set callback
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawCharts);

// Draw all charts
function drawCharts() {
    drawPieChart();
    drawBarChart();
    drawLineChart();
}

// Chart 1: 2D Pie Chart
function drawPieChart() {
    const data = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Work', 8],
        ['Eat', 2],
        ['Commute', 2],
        ['Watch TV', 2],
        ['Sleep', 8]
    ]);

    const options = {
        title: 'Daily Activities',
        // No is3D option to keep it 2D
    };

    const chart = new google.visualization.PieChart(document.getElementById('chart1'));
    chart.draw(data, options);
}

// Chart 2: Bar Chart - Quarterly Financial Performance
function drawBarChart() {
    const data = google.visualization.arrayToDataTable([
        ['Quarter', 'Revenue', 'Expenses'],
        ['Q1 2022', 1500, 700],
        ['Q2 2022', 2000, 800],
        ['Q3 2022', 1800, 900],
        ['Q4 2022', 2200, 1200]
    ]);

    const options = {
        title: 'Quarterly Financial Performance',
        hAxis: { title: 'Quarter' },
        vAxis: { title: 'Amount ($)', minValue: 0 },
        legend: { position: 'top' },
        bars: 'vertical', // Ensures it's a bar chart, not column chart
        isStacked: false // Set to true for stacked bars if needed
    };

    const chart = new google.visualization.BarChart(document.getElementById('chart2'));
    chart.draw(data, options);
}


// Chart 3: Bar Chart - Monthly Financial Summary for Restaurant
function drawBarChart() {
    const data = google.visualization.arrayToDataTable([
        ['Month', 'Revenue', 'Expenses', 'Profit'],
        ['Jan', 12000, 8000, 4000],
        ['Feb', 15000, 9000, 6000],
        ['Mar', 14000, 10000, 4000],
        ['Apr', 16000, 12000, 4000],
        ['May', 17000, 13000, 4000],
        ['Jun', 20000, 14000, 6000],
        ['Jul', 22000, 15000, 7000],
        ['Aug', 24000, 16000, 8000],
        ['Sep', 23000, 17000, 6000],
        ['Oct', 25000, 18000, 7000],
        ['Nov', 27000, 19000, 8000],
        ['Dec', 30000, 20000, 10000]
    ]);

    const options = {
        title: 'Monthly Financial Summary for Restaurant',
        hAxis: { title: 'Month' },
        vAxis: { title: 'Amount ($)' },
        legend: { position: 'top' },
        isStacked: false // Set to true if you want a stacked bar chart
    };

    const chart = new google.visualization.BarChart(document.getElementById('chart3'));
    chart.draw(data, options);
}
