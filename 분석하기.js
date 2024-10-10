document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('resultGraph').getContext('2d');
    const resultGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00'],
            datasets: [{
                label: '결과',
                data: [], 
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: "#fff" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#fff" }
                }
            }
        }
    });

    const sectionData = {
        Create: [240, 260, 280, 300, 320, 340, 360],
        Evaluate: [120, 130, 140, 150, 160, 170, 180],
        Annalyze: [60, 70, 80, 90, 100, 110, 120],
        Apply: [0, 10, 20, 30, 40, 50, 60],
        Understand: [50, 60, 70, 80, 90, 100, 110],
        Remember: [10, 20, 30, 40, 50, 60, 70]
    };

    window.selectSection = function (section) {
        document.getElementById('selectedSection').innerText = section;
        updateGraph(sectionData[section]);
    };

    function updateGraph(data) {
        resultGraph.data.datasets[0].data = data;
        resultGraph.update();
    }
});
