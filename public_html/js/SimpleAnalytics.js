/**
 * Simple Analytics - Pageviews
 */


var myHeaders2 = new Headers();
var requestOptions2 = {
    method: 'GET',
    headers: myHeaders2,
    redirect: 'follow'
};

fetch("https://simpleanalytics.com/ryandrake.com.json?version=5&fields=referrers,pages,device_types,browser_names,countries&limit=10&period=month&callback=?", requestOptions2)
        .then(response => response.json())
        .then(result => {
            var dataTypes = [
                {
                    sel: "Referrals",
                    prop: "referrers",
                    limit: 10
                },
                {
                    sel: "Pages",
                    prop: "pages",
                    limit: 10
                },
                {
                    sel: "Devices",
                    prop: "device_types",
                    limit: 3
                },
                {
                    sel: "Browsers",
                    prop: "browser_names",
                    limit: 3
                },
                {
                    sel: "Countries",
                    prop: "countries",
                    limit: 10
                }
            ];

            for (var dataType of dataTypes) {
                var cnt = 1;
                for (var dataItem of result[dataType.prop]) {
                    if (cnt <= dataType.limit) {
                        var tr = document.createElement("tr");
                        var dataItemVisitors = document.createElement("td");
                        var dataItemValue = document.createElement("td");
                        dataItemValue.textContent = dataType.prop === "countries" ? getCountryName(dataItem.value) : dataItem.value;
                        dataItemVisitors.textContent = dataItem.pageviews;
                        tr.appendChild(dataItemVisitors);
                        tr.appendChild(dataItemValue);
                        document.querySelector("#" + dataType.sel + " tbody").appendChild(tr);
                        cnt++;
                    } else {
                        var nxtElm = document.querySelector("#" + dataType.sel).parentNode.nextElementSibling;
                        if (nxtElm && nxtElm.classList.contains("hide")) {
                            document.querySelector("#" + dataType.sel).parentNode.nextElementSibling.classList.remove("hide");
                        }
                        break;
                    }
                }
            }
        })
        .catch(error => console.log('error', error));

tt_labels = [];
fetch("https://simpleanalytics.com/ryandrake.com.json?version=5&fields=histogram&period=month&callback=?", requestOptions2)
        .then(response => response.json())
        .then(result => {
            const labels = [];
            const visitorsData = [];
            const pageviewsData = [];
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (const entry of result.histogram) {
                const d = new Date(entry.date);
                let month = months[d.getMonth()];
                let dayNum = d.getDate();
                labels.push(month + " " + dayNum);
                tt_labels.push(month + " " + dayNum + ", " + d.getFullYear());
                visitorsData.push(entry.visitors);
                pageviewsData.push(entry.pageviews);
            }

            const data =
                    {
                        labels: labels,
                        datasets: [{
                                backgroundColor: 'rgba(31,79,107,0.8)',
                                xAxisId: 'x1',
                                yAxisId: 'y1',
                                label: 'Visitors',
                                lineTension: .5,
                                borderColor: 'rgba(62,176,239, 0.8)',
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
                                data: visitorsData,
                                spanGaps: !0,
                                fill: !0
                            }, {
                                backgroundColor: 'rgba(31,79,107,0.4)',
                                xAxisId: 'x1',
                                yAxisId: 'y1',
                                label: 'Pageviews',
                                lineTension: .5,
                                borderColor: 'rgba(62,176,239,0.4)',
                                borderCapStyle: 'circle',
                                pointBorderColor: 'rgba(42,44,45, 0.4)',
                                pointBackgroundColor: '#3eb0ef',
                                pointBorderWidth: 3,
                                pointRadius: 5,
                                pointHitRadius: 40,
                                pointHoverBorderColor: '#3eb0ef',
                                pointHoverBackgroundColor: 'rgba(42,44,45, 0.4)',
                                pointHoverBorderWidth: 3,
                                pointHoverRadius: 5,
                                data: pageviewsData,
                                spanGaps: !0,
                                fill: !0
                            }]
                    };
            const options = {
                animation: {duration: 1e3},
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        align: "end",
                        labels: {
                            usePointStyle: true,
                            pointStyle: "rect",
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(100, 100, 100, 0.8)',
                        callbacks: {
                            title: function (arr) {
                                return tt_labels[arr[0].dataIndex];
                            }
                        }
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function (b) {
                            var a = Math.round(b.yLabel);
                            return a = a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), `$${a} Pageviews`
                        }
                    }
                },
                scales: {
                    xAxes: {
                        id: 'x1',
                        position: 'top',
                        ticks: {
                            maxTicksLimit: 32,
                            labelOffset: 8,
                            maxRotation: 90,
                            minRotation: 90
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
                    document.getElementById('simpleAnalyticsChart'),
                    config
                    );
        })
        .catch(error => console.log('error', error));
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
const isoCountries = {
    'AF': 'Afghanistan',
    'AX': 'Aland Islands',
    'AL': 'Albania',
    'DZ': 'Algeria',
    'AS': 'American Samoa',
    'AD': 'Andorra',
    'AO': 'Angola',
    'AI': 'Anguilla',
    'AQ': 'Antarctica',
    'AG': 'Antigua And Barbuda',
    'AR': 'Argentina',
    'AM': 'Armenia',
    'AW': 'Aruba',
    'AU': 'Australia',
    'AT': 'Austria',
    'AZ': 'Azerbaijan',
    'BS': 'Bahamas',
    'BH': 'Bahrain',
    'BD': 'Bangladesh',
    'BB': 'Barbados',
    'BY': 'Belarus',
    'BE': 'Belgium',
    'BZ': 'Belize',
    'BJ': 'Benin',
    'BM': 'Bermuda',
    'BT': 'Bhutan',
    'BO': 'Bolivia',
    'BA': 'Bosnia And Herzegovina',
    'BW': 'Botswana',
    'BV': 'Bouvet Island',
    'BR': 'Brazil',
    'IO': 'British Indian Ocean Territory',
    'BN': 'Brunei Darussalam',
    'BG': 'Bulgaria',
    'BF': 'Burkina Faso',
    'BI': 'Burundi',
    'KH': 'Cambodia',
    'CM': 'Cameroon',
    'CA': 'Canada',
    'CV': 'Cape Verde',
    'KY': 'Cayman Islands',
    'CF': 'Central African Republic',
    'TD': 'Chad',
    'CL': 'Chile',
    'CN': 'China',
    'CX': 'Christmas Island',
    'CC': 'Cocos (Keeling) Islands',
    'CO': 'Colombia',
    'KM': 'Comoros',
    'CG': 'Congo',
    'CD': 'Congo, Democratic Republic',
    'CK': 'Cook Islands',
    'CR': 'Costa Rica',
    'CI': 'Cote D\'Ivoire',
    'HR': 'Croatia',
    'CU': 'Cuba',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'DJ': 'Djibouti',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'EC': 'Ecuador',
    'EG': 'Egypt',
    'SV': 'El Salvador',
    'GQ': 'Equatorial Guinea',
    'ER': 'Eritrea',
    'EE': 'Estonia',
    'ET': 'Ethiopia',
    'FK': 'Falkland Islands (Malvinas)',
    'FO': 'Faroe Islands',
    'FJ': 'Fiji',
    'FI': 'Finland',
    'FR': 'France',
    'GF': 'French Guiana',
    'PF': 'French Polynesia',
    'TF': 'French Southern Territories',
    'GA': 'Gabon',
    'GM': 'Gambia',
    'GE': 'Georgia',
    'DE': 'Germany',
    'GH': 'Ghana',
    'GI': 'Gibraltar',
    'GR': 'Greece',
    'GL': 'Greenland',
    'GD': 'Grenada',
    'GP': 'Guadeloupe',
    'GU': 'Guam',
    'GT': 'Guatemala',
    'GG': 'Guernsey',
    'GN': 'Guinea',
    'GW': 'Guinea-Bissau',
    'GY': 'Guyana',
    'HT': 'Haiti',
    'HM': 'Heard Island & Mcdonald Islands',
    'VA': 'Holy See (Vatican City State)',
    'HN': 'Honduras',
    'HK': 'Hong Kong',
    'HU': 'Hungary',
    'IS': 'Iceland',
    'IN': 'India',
    'ID': 'Indonesia',
    'IR': 'Iran, Islamic Republic Of',
    'IQ': 'Iraq',
    'IE': 'Ireland',
    'IM': 'Isle Of Man',
    'IL': 'Israel',
    'IT': 'Italy',
    'JM': 'Jamaica',
    'JP': 'Japan',
    'JE': 'Jersey',
    'JO': 'Jordan',
    'KZ': 'Kazakhstan',
    'KE': 'Kenya',
    'KI': 'Kiribati',
    'KR': 'Korea',
    'KW': 'Kuwait',
    'KG': 'Kyrgyzstan',
    'LA': 'Lao People\'s Democratic Republic',
    'LV': 'Latvia',
    'LB': 'Lebanon',
    'LS': 'Lesotho',
    'LR': 'Liberia',
    'LY': 'Libyan Arab Jamahiriya',
    'LI': 'Liechtenstein',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MO': 'Macao',
    'MK': 'Macedonia',
    'MG': 'Madagascar',
    'MW': 'Malawi',
    'MY': 'Malaysia',
    'MV': 'Maldives',
    'ML': 'Mali',
    'MT': 'Malta',
    'MH': 'Marshall Islands',
    'MQ': 'Martinique',
    'MR': 'Mauritania',
    'MU': 'Mauritius',
    'YT': 'Mayotte',
    'MX': 'Mexico',
    'FM': 'Micronesia, Federated States Of',
    'MD': 'Moldova',
    'MC': 'Monaco',
    'MN': 'Mongolia',
    'ME': 'Montenegro',
    'MS': 'Montserrat',
    'MA': 'Morocco',
    'MZ': 'Mozambique',
    'MM': 'Myanmar',
    'NA': 'Namibia',
    'NR': 'Nauru',
    'NP': 'Nepal',
    'NL': 'Netherlands',
    'AN': 'Netherlands Antilles',
    'NC': 'New Caledonia',
    'NZ': 'New Zealand',
    'NI': 'Nicaragua',
    'NE': 'Niger',
    'NG': 'Nigeria',
    'NU': 'Niue',
    'NF': 'Norfolk Island',
    'MP': 'Northern Mariana Islands',
    'NO': 'Norway',
    'OM': 'Oman',
    'PK': 'Pakistan',
    'PW': 'Palau',
    'PS': 'Palestinian Territory, Occupied',
    'PA': 'Panama',
    'PG': 'Papua New Guinea',
    'PY': 'Paraguay',
    'PE': 'Peru',
    'PH': 'Philippines',
    'PN': 'Pitcairn',
    'PL': 'Poland',
    'PT': 'Portugal',
    'PR': 'Puerto Rico',
    'QA': 'Qatar',
    'RE': 'Reunion',
    'RO': 'Romania',
    'RU': 'Russian Federation',
    'RW': 'Rwanda',
    'BL': 'Saint Barthelemy',
    'SH': 'Saint Helena',
    'KN': 'Saint Kitts And Nevis',
    'LC': 'Saint Lucia',
    'MF': 'Saint Martin',
    'PM': 'Saint Pierre And Miquelon',
    'VC': 'Saint Vincent And Grenadines',
    'WS': 'Samoa',
    'SM': 'San Marino',
    'ST': 'Sao Tome And Principe',
    'SA': 'Saudi Arabia',
    'SN': 'Senegal',
    'RS': 'Serbia',
    'SC': 'Seychelles',
    'SL': 'Sierra Leone',
    'SG': 'Singapore',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'SB': 'Solomon Islands',
    'SO': 'Somalia',
    'ZA': 'South Africa',
    'GS': 'South Georgia And Sandwich Isl.',
    'ES': 'Spain',
    'LK': 'Sri Lanka',
    'SD': 'Sudan',
    'SR': 'Suriname',
    'SJ': 'Svalbard And Jan Mayen',
    'SZ': 'Swaziland',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'SY': 'Syrian Arab Republic',
    'TW': 'Taiwan',
    'TJ': 'Tajikistan',
    'TZ': 'Tanzania',
    'TH': 'Thailand',
    'TL': 'Timor-Leste',
    'TG': 'Togo',
    'TK': 'Tokelau',
    'TO': 'Tonga',
    'TT': 'Trinidad And Tobago',
    'TN': 'Tunisia',
    'TR': 'Turkey',
    'TM': 'Turkmenistan',
    'TC': 'Turks And Caicos Islands',
    'TV': 'Tuvalu',
    'UG': 'Uganda',
    'UA': 'Ukraine',
    'AE': 'United Arab Emirates',
    'GB': 'United Kingdom',
    'US': 'United States',
    'UM': 'United States Outlying Islands',
    'UY': 'Uruguay',
    'UZ': 'Uzbekistan',
    'VU': 'Vanuatu',
    'VE': 'Venezuela',
    'VN': 'Viet Nam',
    'VG': 'Virgin Islands, British',
    'VI': 'Virgin Islands, U.S.',
    'WF': 'Wallis And Futuna',
    'EH': 'Western Sahara',
    'YE': 'Yemen',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe'
};

function getCountryName(countryCode) {
    if (isoCountries.hasOwnProperty(countryCode.toUpperCase())) {
        return isoCountries[countryCode.toUpperCase()];
    } else {
        return countryCode;
    }
}
        