            function loadXeroData(timeframe) {
                document.querySelector("#xerodata tbody").innerHTML = "";
                fetch("https://xec5rq4coevoybidpya5ajl36m0psgkj.lambda-url.us-east-1.on.aws/?timeframe=" + timeframe)
                        .then(response => response.json())
                        .then(data => {
                            var tbody = document.querySelector("#xerodata tbody");
                            for (const report of data.Reports) {
                                document.querySelector("#xerotitle").innerHTML = report.ReportTitles.join("<br/>");
                                for (const row of report.Rows) {
                                    if (row.RowType == "Section") {

                                        var tr = document.createElement("tr");
                                        var td = document.createElement("td");
                                        var td2 = document.createElement("td");
                                        td.innerHTML = "<b>" + row.Title + "</b>";
                                        td.style.fontWeight = "bold";
                                        td.style.fontSize = "20px";
                                        td.style.width = "800px";
                                        tr.appendChild(td);
                                        tr.appendChild(td2);
                                        tbody.appendChild(tr);

                                        for (const line of row.Rows) {
                                            var tr = document.createElement("tr");
                                            for (const cell of line.Cells) {
                                                var td = document.createElement("td");
                                                td.textContent = cell.Value;
                                                td.style.paddingLeft = "28px";
                                                tr.appendChild(td);
                                            }
                                            tbody.appendChild(tr);
                                        }

                                        if (row.Title === "" || row.Title === " " || row.Title === null) {
                                            tr.firstChild.style.paddingLeft = "0px";
                                            tr.firstChild.style.fontSize = "20px";
                                        }

                                        tr.firstChild.style.fontWeight = "bold";
                                        tr.lastChild.style.borderTop = "2px solid #fff";
                                        tr.lastChild.style.borderBottom = "2px solid #fff";

                                        var tr = document.createElement("tr");
                                        var td = document.createElement("td");
                                        var td2 = document.createElement("td");
                                        tr.appendChild(td);
                                        tr.appendChild(td2);
                                        tbody.appendChild(tr);

                                    }
                                }
                            }
                        });
            }
            loadXeroData("cfy");
