const searchBut = document.getElementById("searchBut");
const newBut = document.getElementById("newBut");
const editBut = document.getElementById("editBut");
const actionBut = document.querySelector(".actionBut");
const minCon = document.querySelector(".min-container");
const minInput = document.getElementById("min-search");
const maxCon = document.querySelector(".max-container");
const maxInput = document.getElementById("max-search");
const fromDateCon = document.querySelector(".date-from-container");
const fromDate = fromDateCon.querySelector("#date-from");
const toDateCon = document.querySelector(".date-to-container");
const toDate = toDateCon.querySelector("#date-to");
const table = document.querySelector(".dataTable");
const selectOp = document.getElementById("acc-select");
const titleInput = document.getElementById("title-search");
const descInput = document.getElementById("desc-search");

let dataObj = {};
//0 for search, 1 for new entry, 2 for edit
let action = 0;
window.onload = () => {
    searchBut.checked = true;

}

function cvsToObj(rawData, sep = ";", colNames = true, numCols = 1, byCols = false, getUnique = []){
    rawData = rawData.split("\n");
    let rowNames;
    if (colNames) rowNames = rawData.splice(0, 1)[0].split(sep);
    else if (byCols){
        rowNames = new Array(numCols);
        for (let i = 0; i < numCols; i++) rowNames.push(i);
    }
    
    let rowCnt = 0;
    let unique = [];
    for (let i = 0; i < getUnique.length; i++){
        unique.push(new Set());
    }
    for (let row of rawData){
        if (row){
            row = row.split(sep);
            if (byCols){
                let colCnt = 0;
                for (let col of rowNames){
                    if (col in dataObj) dataObj[col].push(row[colCnt]);
                    else dataObj[col] = [row[colCnt]];
                    colCnt += 1;
                }
            }
            else {
                dataObj[rowCnt] = row;
                if (getUnique.length > 0){
                    for (let k = 0; k < unique.length; k++){
                        unique[k].add(dataObj[rowCnt][getUnique[k]]);
                    }
                }
            }
        }
        rowCnt += 1;
    }

    if (getUnique.length > 0) return unique;
    else return;
}

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file){
        const reader = new FileReader();
        reader.onload = (e) => {
            let uniVals = Array.from(cvsToObj(e.target.result, ";", true, 1, false, [3])[0]);
            for (let key of uniVals){
                let newOp = document.createElement("option");
                newOp.value = key;
                newOp.textContent = key;
                selectOp.appendChild(newOp);
            }
            for (let i = 0; i < Object.keys(dataObj).length; i++){
                let newRow = document.createElement("tr");
                for (let j = 0; j < 5; j++){
                    let newEnt = document.createElement("td");
                    newEnt.textContent = dataObj[i][j];
                    newRow.appendChild(newEnt);
                }
                table.appendChild(newRow);
            }
        };
        reader.readAsText(file);
    }
});

function radioButChange(
    actText = "Search", 
    act = 0, 
    minLabel = "Min",
    maxDisplay = "inline",
    fromLabel = "From",
    toDateDisplay = "inline"){
        actionBut.textContent = actText;
        action = act;
        minCon.querySelector("label").textContent = minLabel;
        maxCon.style.display = maxDisplay;
        fromDateCon.querySelector("label").textContent = fromLabel;
        toDateCon.style.display = toDateDisplay;
}

searchBut.addEventListener("click", () => {
    radioButChange();
});

newBut.addEventListener("click", () => {
    radioButChange("New", 1, "Amount", "none", "Date", "none");
});

editBut.addEventListener("click", () => {
    radioButChange("Edit", 2, "Amount", "none", "Date", "none");
});

actionBut.addEventListener("click", () => {
    let fromD = null;
    let toD = null;
    let minV = null;
    let maxV = null;
    let title = null;
    let type = null;
    let desc = null;
    if (action == 0){
        let filterResults = {};
        if (fromDate.value || toDate.value){
            fromD = new Date(fromDate.value);
            fromD = new Date(fromD.getTime() + (300 * 60000));
            toD = new Date(toDate.value);
            toD = new Date(toD.getTime() + (300 * 60000));
            if (fromD && toD){
                if (fromD > toD){
                    alert("From date cannot be before To date");
                    return;
                }
            }
        }
        if (minInput.value || maxInput.value){
            minV = Number(minInput.value);
            maxV = Number(maxInput.value);
            if (minV && toD){
                if (minV > maxV){
                    alert("Minimun value cannot be lower than maximum value");
                    return;
                }
            }
        }
        if (titleInput.value) title = titleInput.value;
        if (descInput.value) desc = descInput.value;
        if (selectOp.value != "-") type = selectOp.value;
        let filteredCnt = 0;
        for (let key in dataObj){
            let tempDate = new Date(dataObj[key][0]);
            if (fromD || toD){
                if (fromD) if (tempDate < fromD) continue;
                if (toD) if (tempDate > toD) continue;
            }
            if (minV || maxV){
                if (minV) if(Number(dataObj[key][1]) < minV) continue;
                if (maxV) if(Number(dataObj[key][1]) > maxV) continue;
            }
            if (title){
                if(!dataObj[key][2].toLowerCase().includes(title.toLowerCase())) continue;
            }
            if (type){
                if(type != dataObj[key][3]) continue;
            }
            if (desc){
                if(!dataObj[key][4].toLowerCase().includes(desc.toLowerCase())) continue;
            }
            filterResults[filteredCnt] = dataObj[key];
            filteredCnt += 1;
        }
        console.log(filterResults);
    }
});