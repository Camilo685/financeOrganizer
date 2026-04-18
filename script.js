const searchBut = document.getElementById("searchBut");
const newBut = document.getElementById("newBut");
const editBut = document.getElementById("editBut");

const titleInput = document.getElementById("titleInput");
const titleTable = document.querySelector(".titleTable");
const resetTableButtons = document.querySelectorAll(".resetTableButton");
for (let i = 0; i < 2; i++){
    resetTableButtons[i].addEventListener("click", () => {
        if (i == 0){
            let resetButArray = titleTable.querySelectorAll("button");
            for (let j = 1; j < resetButArray.length; j++){
                resetButArray[j].click();
            }
        }
    });
}

const typeLabel = document.querySelector(".typeLabel");
const typeSelect = document.getElementById("typeSelect");
const typeInput = document.getElementById("typeInput");
const typeTable = document.querySelector(".typeTable");

const minInput = document.getElementById("minInput");
const maxInput = document.getElementById("maxInput");

const fromDateContainer = document.querySelector(".fromDateContainer");
const fromDateInput = fromDateContainer.querySelector("#fromDateInput");
const toDateContainer = document.querySelector(".toDatecontainer");
const toDateInput = toDateContainer.querySelector("#toDateInput");

const descriptionInput = document.getElementById("descriptionInput");

const actionBut = document.querySelector(".actionBut");

const totalSelect = document.getElementById("totalSelect");
const incomeDisplay = document.getElementById("incomeDisplay");
const expensesDisplay = document.getElementById("expensesDisplay");
const totalDisplay = document.getElementById("totalDisplay");

const entriesTable = document.querySelector(".entriesTable").querySelector("tbody");

let arrayData = [];
let titleOptions = new Set();
let total = {};
let titleRadioArray = [[], []];
let typeRadioArray = [[], []];
let filtered = false;

const months = ['January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 'September', 
    'October', 'November', 'December'];
    
let colombianPeso = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
});

//0 for search, 1 for new entry, 2 for edit
let action = 0;
window.onload = () => {
    searchBut.checked = true;
    radioButChange();
}

function cvsToObj(rawData, sep = ";"){
    rawData = rawData.split("\n");
    rawData.splice(0, 1)[0].split(sep);
    
    let rowCnt = 0;
    for (let row of rawData){
        if (row){
            row = row.split(sep);
            row = prepareData(row);
            arrayData.push(["ID" + rowCnt, row]);
            titleOptions.add(row[2]);
            if (row[3] in total){
                if (row[1] >= 0) total[row[3]][0] += row[1];
                else total[row[3]][1] += row[1];
            } else {
                if (row[1] >= 0) total[row[3]] = [row[1], 0];
                else total[row[3]] = [0, row[1]];
            }
        }
        rowCnt += 1;
    }
    sortData();
    let titleArrayOptions = [];
    titleOptions.forEach((key) => titleArrayOptions.push(key));
    titleOptions = titleArrayOptions.sort();
    return;
}

function sortData(toSort = arrayData, Asc = false, index = 0){
    return toSort.sort((a, b) => (Asc)? a[1][index] - b[1][index] : b[1][index] - a[1])[index];
}

function prepareData(arry){
    arry[0] = new Date(arry[0]);
    arry[1] = Number(arry[1]);
    return arry;
}

function appendToTable(toAppend = arrayData, numberOfEntries = 5, titleRB = true){
    for (let entry of toAppend){
        let newRow = document.createElement("tr");
        for (let j = 0; j < numberOfEntries; j++){
            let newEnt = document.createElement("td");
            if (numberOfEntries == 5){
                if (j == 0){
                    let textDate = entry[1][j].getDate() + "/" +
                    months[entry[1][j].getMonth()] + "/" + 
                    entry[1][j].getFullYear();
                    newEnt.textContent = textDate;
                }
                else if (j == 1) newEnt.textContent = colombianPeso.format(entry[1][j]);
                else newEnt.textContent = entry[1][j];
            } else {
                let partialValue = entry + ((titleRB) ? "Title" : "Type");
                if (j != 1) {
                    let radioBut = document.createElement("input");
                    let radioValue = ((j == 0) ? "include" : "exclude") + partialValue;
                    radioBut.setAttribute("name", `radio${entry}`);
                    radioBut.setAttribute("type", "radio");
                    radioBut.setAttribute("id", radioValue);
                    radioBut.setAttribute("data-value", entry);
                    radioBut.setAttribute(
                        "value", 
                        radioValue
                    );
                    radioBut.addEventListener("click", radioClicked);
                    newEnt.appendChild(radioBut);
                }
                else {
                    let resetRB = document.createElement("button");
                    resetRB.setAttribute("type", "button");
                    resetRB.setAttribute("class", "resetRB");
                    resetRB.textContent = entry;
                    resetRB.addEventListener("click", (e) => {
                        let includeR = document.getElementById(`include${partialValue}`);
                        let excludeR = document.getElementById(`exclude${partialValue}`);

                        includeR.checked = false;
                        excludeR.checked = false;

                        for (let x = 0; x < 2; x++){
                            let radioIndex = ((titleRB) ? titleRadioArray[x] : typeRadioArray[x]).indexOf(entry);
                            if (radioIndex > -1) ((titleRB) ? titleRadioArray[x] : typeRadioArray[x]).splice(radioIndex, 1);
                            checkIfRadioTableEmpty();
                        }
                    });
                    newEnt.appendChild(resetRB);
                }
            }
            newRow.appendChild(newEnt);
        }
        if(numberOfEntries == 5) entriesTable.appendChild(newRow);
        else if (titleRB) titleTable.appendChild(newRow);
        else typeTable.appendChild(newRow);
    }
}

function checkIfRadioTableEmpty(){
    if(titleRadioArray[0].length > 0 || titleRadioArray[1].length > 0){
        resetTableButtons[0].disabled = false;
    } else resetTableButtons[0].disabled = true;
    if(typeRadioArray[0].length > 0 || typeRadioArray[1].length > 0){
        resetTableButtons[1].disabled = false;
    } else resetTableButtons[1].disabled = true;
}

function radioClicked(e){
    let value = e.target.value;
    let dataValue = e.target.getAttribute("data-value");
    let radioType = (value.includes("include")) ? 0 : 1;
    if (value.includes("Title")){
        let rIndex = titleRadioArray[radioType].indexOf(dataValue);
        let rOpIndex = titleRadioArray[Number(!radioType)].indexOf(dataValue);
        if(rIndex <= -1){
            titleRadioArray[radioType].push(dataValue);
            titleInput.value = "";
        }
        if(rOpIndex > -1) titleRadioArray[Number(!radioType)].splice(rOpIndex, 1);
        checkIfRadioTableEmpty();
    } else {
        let rIndex = typeRadioArray[radioType].indexOf(dataValue);
        let rOpIndex = typeRadioArray[Number(!radioType)].indexOf(dataValue);
        if(rIndex <= -1) typeRadioArray[radioType].push(dataValue);
        if(rOpIndex > -1) typeRadioArray[Number(!radioType)].splice(rOpIndex, 1);
        checkIfRadioTableEmpty();
    }
}

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file){
        const reader = new FileReader();
        reader.onload = (e) => {
            cvsToObj(e.target.result, ";", true, 1, false);
            for (let key in total){
                let newTypeOption = newOption(key);
                let newTotalOption = newTypeOption.cloneNode(true);
                typeSelect.appendChild(newTypeOption);
                totalSelect.appendChild(newTotalOption);
            }
            appendToTable();
            appendToTable(titleOptions, 3);
            appendToTable(Object.keys(total), 3, false);
        };
        reader.readAsText(file);
    }
});

function newOption(textC){
    let newSelectOp = document.createElement("option");
    newSelectOp.value = textC;
    newSelectOp.textContent = textC;
    return newSelectOp;
}

function radioButChange(act = 0){
        action = act;
        titleInput.value = "";
        titleTable.style.display = (act == 0) ? "inline" : "none";
        
        typeLabel.style.display = (act == 0) ? "none" : "inline";
        typeInput.style.display = (act == 0) ? "none" : "inline";
        typeInput.value = "";
        typeSelect.style.display = (act == 0) ? "none" : "inline";
        typeSelect.selectedIndex = 0;
        typeTable.style.display = (act == 0) ? "inline" : "none";
        
        minInput.setAttribute("placeholder", (act == 0) ? "Minimim amount..." : "Amount...");
        minInput.value = "";
        maxInput.style.display = (act == 0) ? "inline" : "none";
        maxInput.value = "";

        fromDateContainer.querySelector("label").textContent = (act == 0) ? "From..." : "Date";
        fromDateInput.value = "";
        toDateContainer.style.display = (act == 0) ? "inline" : "none";
        toDateInput.value = "";
        
        descriptionInput.value = "";

        actionBut.textContent = (act == 0) ? "Search" : (act == 1) ? "New entry" : "Edit";
        
        totalSelect.selectedIndex = 0;
        totalDisplay.value = "";
        incomeDisplay.value = "";
        expensesDisplay.value = "";
        
        entriesTable.replaceChildren();
        appendToTable();
        if (filtered){
            totalSelect.options[totalSelect.options.length - 1].remove();
            total["Filtered results"] = [0, 0];
        }
        filtered = false;
        checkIfRadioTableEmpty();
}

searchBut.addEventListener("click", () => {
    radioButChange();
});

newBut.addEventListener("click", () => {
    radioButChange(1);
});

editBut.addEventListener("click", () => {
    radioButChange(2);
});

typeInput.addEventListener("input", () => {
    if (typeInput.value) typeSelect.selectedIndex = 0;
});

typeSelect.addEventListener("click", () => {
    if (typeSelect.value != "-") typeInput.value = "";
});

totalSelect.addEventListener("click", () => {
    if (totalSelect.value != "-"){
        let inc = total[totalSelect.value][0];
        let exp = total[totalSelect.value][1];
        incomeDisplay.value = colombianPeso.format(inc);
        expensesDisplay.value = colombianPeso.format(exp);
        totalDisplay.value = colombianPeso.format(inc + exp);
    }
});

actionBut.addEventListener("click", () => {
    let title = false;
    let type = false;
    let minV = false;
    let maxV = false;
    let fDate = false;
    let tDate = false;
    let description = false;
    
    if (action == 0){
        let filterResults = [];
        total["Filtered results"] = [0, 0];
        
        if (titleInput.value || titleRadioArray[0].length > 0 || titleRadioArray[1].length > 0) title = true;

        if (typeSelect.value != "-") typeRadioArray[0].push(typeSelect.value);
        if (typeRadioArray[0].length > 0 || typeRadioArray[1].length > 0) type = true;

        if (minInput.value) minV = true;
        if (maxInput.value) maxV = true;
        if (minV && maxV){
            if (minInput.value > maxInput.value) return alert("Minimun value cannot be lower than maximum value");
        }

        if (fromDateInput.value) fDate = true;
        if (toDateInput.value) tDate = true;
        if (fDate && tDate){
            if (fromDateInput.value > toDateInput.value) return alert("From date cannot be before To date");
        }

        if (descriptionInput.value) description = true;
        
        entryLoop : for (let entry of arrayData){
            let entryData = entry[1];
            if (title){
                for (let i = 0; i < 2; i++){
                    for (let keyString of titleRadioArray[i]){
                        if (i == 0){
                            if (!entryData[2].toLowerCase().includes(keyString.toLowerCase())) continue entryLoop;
                        }
                        else {
                            if (entryData[2].toLowerCase().includes(keyString.toLowerCase())) continue entryLoop;
                        }
                    }
                }
            }
            if (type){
                for (let i = 0; i < 2; i++){
                    for (let keyString of typeRadioArray[i]){
                        if (i == 0){
                            if (!entryData[3].toLowerCase().includes(keyString.toLowerCase())) continue entryLoop;
                        }
                        else {
                            if (entryData[3].toLowerCase().includes(keyString.toLowerCase())) continue entryLoop;
                        }
                    }
                }
            }
            if (minV || maxV){
                if (minV){
                    if(entryData[1] < Number(minInput.value)) continue entryLoop;
                }
                if (maxV){
                    if(entryData[1] > Number(maxInput.value)) continue entryLoop;
                }
            }
            if (fDate || tDate){
                if (fDate){
                    let tmpDate = new Date(fromDateInput.value);
                    tmpDate = new Date(tmpDate.getTime() + (300 * 60000));
                    if (entryData[0] < tmpDate) continue entryLoop;
                } 
                if (tDate){
                    let tmpDate = new Date(toDateInput.value);
                    tmpDate = new Date(tmpDate.getTime() + (300 * 60000));
                    if (entryData[0] < tmpDate) continue entryLoop;
                } 
            }
            if (description){
                if(!entryData[4].toLowerCase().includes(description.toLowerCase())) continue entryLoop;
            }
            

            filterResults.push(entry);
            (entryData[1] < 0)? total["Filtered results"][1] += entryData[1] : total["Filtered results"][0] += entryData[1];
        }
        entriesTable.replaceChildren();
        if (Object.keys(filterResults).length > 0){
            sortData(filterResults);
            appendToTable(filterResults);
            if (!filtered){
                let newOp = newOption("Filtered results");
                totalSelect.appendChild(newOp);
                filtered = true;
            }
            totalSelect.selectedIndex = totalSelect.options.length - 1;
            totalSelect.click();
        }
    }
});