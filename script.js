const searchBut = document.getElementById("searchBut");
const newBut = document.getElementById("newBut");
const editBut = document.getElementById("editBut");
const actionBut = document.querySelector(".actionBut");
const minVal = document.querySelector(".min-container");
const minInput = document.getElementById("min-search");
const maxVal = document.querySelector(".max-container");
const fromDate = document.querySelector(".date-from-container");
const toDate = document.querySelector(".date-to-container");
const table = document.querySelector(".dataTable");

let dataObj = {};
window.onload = () => {
    searchBut.checked = true;

}

function cvsToObj(rawData, sep = ";", colNames = true, numCols = 1, byCols = false){
    rawData = rawData.split("\n");
    let rowNames;
    if (colNames) rowNames = rawData.splice(0, 1)[0].split(sep);
    else if (byCols){
        rowNames = new Array(numCols);
        for (let i = 0; i < numCols; i++) rowNames.push(i);
    }
    
    let rowCnt = 0;
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
            else dataObj[rowCnt] = row;
        }
        rowCnt += 1;
    }
    return dataObj;
}

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file){
        const reader = new FileReader();
        reader.onload = (e) => {
            cvsToObj(e.target.result);
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
        console.log(dataObj);
    }
});

searchBut.addEventListener("click", () => {
    actionBut.textContent = "Search";
    minVal.querySelector("label").textContent = "Min";
    maxVal.style.display = "inline";
    fromDate.querySelector("label").textContent = "From";
    toDate.style.display = "inline";
});

newBut.addEventListener("click", () => {
    actionBut.textContent = "New";
    minVal.querySelector("label").textContent = "Amount";
    maxVal.style.display = "none";
    fromDate.querySelector("label").textContent = "Date";
    toDate.style.display = "none";
});

editBut.addEventListener("click", () => {
    actionBut.textContent = "Edit";
    minVal.querySelector("label").textContent = "Amount";
    maxVal.style.display = "none";
    fromDate.querySelector("label").textContent = "Date";
    toDate.style.display = "none";
});