/**
 * Clickup - Roadmap
 */


let modalDialog = document.querySelector('#myModal');
function closeModal() {
    modalDialog.style.display = 'none';
    modalDialog.querySelector(".modal-header h2").textContent = "Loading...";
    modalDialog.querySelector(".modal-body .taskdesc").textContent = "Loading...";
    modalDialog.querySelector(".modal-footer .updated").textContent = "Loading...";
    modalDialog.querySelector(".modal-body .taskcustfields tbody").innerHTML = "Loading...";
}

function showTask(taskUri) {
    modalDialog.style.display = 'block';
    fetch(taskUri, requestOptions2)
            .then(response => response.json())
            .then(result => {
                let udate = (new Date());
                udate.setTime(result.date_updated);
                let updated = udate.toUTCString();//months[udate.getMonth()] + " " + udate.getDay() + ", " + udate.getHours() + ":" + udate.getMinutes();
                modalDialog.querySelector(".modal-header h2").textContent = result.name;
                modalDialog.querySelector(".modal-body .taskdesc").textContent = result.description ? result.description : "No description.";
                modalDialog.querySelector(".modal-footer .updated").textContent = updated;
                result.custom_fields.forEach((val) => {
                    if (typeof val.type_config.options[val.value] !== "undefined") {
                        let tr = document.createElement("tr");
                        let td = document.createElement("td");
                        let td2 = document.createElement("td");
                        td.style.fontWeight = "bold";
                        td.textContent = val.name;
                        td2.textContent = val.type_config.options[val.value].name;
                        tr.appendChild(td);
                        tr.appendChild(td2);
                        modalDialog.querySelector(".modal-body .taskcustfields tbody").innerHTML = "";
                        modalDialog.querySelector(".modal-body .taskcustfields tbody").appendChild(tr);
                        modalDialog.querySelector(".modal-body .taskcustfields").style.display = "block";
                    } else {
                        modalDialog.querySelector(".modal-body .taskcustfields tbody").innerHTML = "";
                        modalDialog.querySelector(".modal-body .taskcustfields").style.display = "none";
                    }
                });
            });
}

var myHeaders2 = new Headers();
var requestOptions2 = {
    method: 'GET'
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let dataUri = "[BASE_API_URI]";
let viewUri = dataUri + '[URI_SUFFIX_IF_ANY]';
async function looper(viewUri, page) {
    const response = await fetch(viewUri + "&page=" + page, requestOptions2);
    let result = await response.json();
    let data = [];
    for (const task of result.tasks) {
        if (!(task.status.status in data))
            data[task.status.status] = [];
        let cdate = (new Date());
        cdate.setTime(task.date_created);
        let udate = (new Date());
        udate.setTime(task.date_updated);
        let taskData = {
            name: task.name,
            id: task.id,
            color: task.status.color,
            created: months[cdate.getMonth()] + " " + cdate.getDay() + " " + cdate.getHours() + ":" + cdate.getMinutes(),
            updated: months[udate.getMonth()] + " " + udate.getDay() + ", " + udate.getHours() + ":" + udate.getMinutes(),
        };
        data[task.status.status].push(taskData);
    }

    if (!result.last_page) {
        const nextPageData = await looper(viewUri, (page + 1));
        data = Object.assign(data, nextPageData);
    }
    return data;
}
looper(viewUri, 0).then(finalData => {
    let board = document.querySelector(".gh3about-data-metrics");
    let item = board.querySelector(".gh3about-data-item-container").cloneNode(true);
    item.classList.remove("hide");
    board.innerHTML = "";

    for (const type in finalData) {
        let xItem = item.cloneNode(true);
        xItem.querySelector(".gh3about-data-item-description").textContent = type.toUpperCase();
        xItem.querySelector(".gh3about-data-item-description").style.color = finalData[type][0].color;
        let counter = 1;
        for (let task of finalData[type]) {
            let taskItem = document.createElement("li");
            if (counter > 10)
                taskItem.style.display = "none";
            taskItem.innerHTML = '<div><a href="javascript:showTask(\'' + dataUri + '?datatype=taskdesc&taskid=' + task.id + '\');" class="task_name">' + task.name + '</a></div > ';
            //taskItem.innerHTML += '<div style="float:right;padding:0px 10px;font-size: small;color: grey;">Updated ' + task.updated + "</div>";
            xItem.querySelector(".gh3about-data-item-figure ul").appendChild(taskItem);
            counter++;
        }

        if (finalData[type].length > 10) {
            let showAll = document.createElement("span");
            showAll.style.cursor = "pointer";
            showAll.style.fontSize = "initial";
            showAll.style.padding = "10px 28px";
            showAll.textContent = "Expand";
            showAll.onclick = function (e) {
                e.target.parentNode.querySelectorAll("ul li").forEach((elm) => {
                    elm.style.display = "block";
                });
                this.style.display = "none";
            };
            xItem.querySelector(".gh3about-data-item-figure").appendChild(showAll);
        }
        board.appendChild(xItem);
    }

});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
        