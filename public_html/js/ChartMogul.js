/**
 * ChartMogul
 */


var myHeaders = new Headers();
myHeaders.append("Authorization", "Basic [API_KEY]");
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
};
var todayDate = new Date().toJSON().slice(0, 10);
var yearOld = new Date();
var monthOld = new Date();
yearOld.setTime(yearOld.getTime() - 3.154e+10 + 2.628e+9);
monthOld.setTime(monthOld.getTime() - 2.628e+9 + 8.64e+7);
var yearOldDate = yearOld.toJSON().slice(0, 10);
var monthOldDate = monthOld.toJSON().slice(0, 10);

fetch("https://api.chartmogul.com/v1/metrics/all?start-date=" + monthOldDate + "&end-date=" + todayDate + "&interval=month", requestOptions)
        .then(response => response.json())
        .then(result => {
            document.querySelector(".gh-about-data-chart-content .gh-about-data-chart-figure").innerHTML = "<span>$</span>" + numberWithCommas(Math.round(result.entries[result.entries.length - 1].mrr / 100));
            document.querySelector(".gh-about-data-metrics .gh-about-data-item:nth-child(5) .gh-about-data-item-figure").innerHTML = "<span>$</span>" + numberWithCommas(Math.round(result.entries[result.entries.length - 1].arr / 100));
            document.querySelector(".gh-about-data-metrics .gh-about-data-item:nth-child(4) .gh-about-data-item-figure").innerHTML = result.entries[result.entries.length - 1]["mrr-churn-rate"] + "<span>%</span>";
            document.querySelector(".gh-about-data-metrics .gh-about-data-item:nth-child(1) .gh-about-data-item-figure").innerHTML = numberWithCommas(result.entries[result.entries.length - 1].customers);
            document.querySelector(".gh-about-data-metrics .gh-about-data-item:nth-child(3) .gh-about-data-item-figure").innerHTML = "<span>$</span>" + numberWithCommas(Math.round(result.entries[result.entries.length - 1].arpa / 100));
            document.querySelector(".gh-about-data-metrics .gh-about-data-item:nth-child(2) .gh-about-data-item-figure").innerHTML = "<span>$</span>" + numberWithCommas(Math.round(result.entries[result.entries.length - 1].asp / 100));
        })
        .catch(error => console.log('error', error));

fetch("https://api.chartmogul.com/v1/metrics/mrr?start-date=" + yearOldDate + "&end-date=" + todayDate + "&interval=month", requestOptions)
        .then(response => response.json())
        .then(result => {
            const labels = [];
            const mrrData = [];
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (const entry of result.entries) {
                const d = new Date(entry.date);
                let month = months[d.getMonth()];
                labels.push(month + " " + d.getFullYear().toString().slice(2, 4));
                mrrData.push(entry.mrr / 100);
            }

            const data =
                    {
                        labels: labels,
                        datasets: [{
                                backgroundColor: 'rgba(31,79,107,0.5)',
                                xAxisId: 'x1',
                                yAxisId: 'y1',
                                label: 'MRR',
                                lineTension: .5,
                                borderColor: '#3eb0ef',
                                borderCapStyle: 'circle',
                                pointBorderColor: 'rgba(42,44,45, 0.8)',
                                pointBackgroundColor: '#3eb0ef',
                                pointBorderWidth: 3,
                                pointRadius: 5,
                                pointHitRadius: 40,
                                pointHoverBorderColor: '#3eb0ef',
                                pointHoverBackgroundColor: 'rgba(42,44,45, 0.8)',
                                pointHoverBorderWidth: 3,
                                pointHoverRadius: 5,
                                data: mrrData,
                                spanGaps: !0,
                                fill: !0
                            }]
                    };
            const options = {
                animation: {duration: 1e3},
                plugins: {
                    legend: {display: false}
                },
                tooltips: {
                    callbacks: {
                        label: function (b) {
                            var a = Math.round(b.yLabel);
                            return a = a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), `$${a} ARR`
                        }
                    }
                },
                scales: {
                    xAxes: {
                        id: 'x1',
                        position: 'top',
                        ticks: {
                            maxTicksLimit: 13,
                            labelOffset: 9
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    },
                    yAxes: {
                        id: 'y1',
                        position: 'right',
                        steps: 6,
                        ticks: {
                            callback: function (a) {
                                return `${a / 1e3}K`
                            },
                            maxTicksLimit: 6,
                            stepSize: 1e2
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    }
                }
            };

            const config = {
                type: 'line',
                data: data,
                options: options
            };
            const myChart = new Chart(
                    document.getElementById('myChart'),
                    config
                    );
        })
        .catch(error => console.log('error', error));
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
        