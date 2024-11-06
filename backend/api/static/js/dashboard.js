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

// Chart 2: Bar Chart
function drawBarChart() {
    const data = google.visualization.arrayToDataTable([
        ['Year', 'Sales', 'Expenses'],
        ['2019', 1000, 400],
        ['2020', 1170, 460],
        ['2021', 660, 1120],
        ['2022', 1030, 540]
    ]);

    const options = {
        title: 'Company Performance',
        hAxis: { title: 'Year' },
        vAxis: { title: 'Amount', minValue: 0 },
        legend: { position: 'top' }
    };

    const chart = new google.visualization.BarChart(document.getElementById('chart2'));
    chart.draw(data, options);
}

// Chart 3: Line Chart
function drawLineChart() {
    const data = google.visualization.arrayToDataTable([
        ['Month', 'Visitors'],
        ['Jan', 1000],
        ['Feb', 1170],
        ['Mar', 660],
        ['Apr', 1030],
        ['May', 800],
        ['Jun', 950]
    ]);

    const options = {
        title: 'Website Visitors',
        curveType: 'function', // Makes the line smooth
        legend: { position: 'bottom' }
    };

    const chart = new google.visualization.LineChart(document.getElementById('chart3'));
    chart.draw(data, options);
}
