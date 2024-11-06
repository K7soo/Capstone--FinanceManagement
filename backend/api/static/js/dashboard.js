google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Work', 8],
        ['Eat', 2],
        ['Commute', 2],
        ['Watch TV', 2],
        ['Sleep', 8]
    ]);

    var options = {
        title: 'My Daily Activities',
        is3D: true
    };

    var chart = new google.visualization.BarChart(document.getElementById('piechart'));
    chart.draw(data, options);
}
