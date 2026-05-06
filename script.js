const radioModeButtons = document.querySelector(".radioModesDiv").querySelectorAll("input");
for (let i = 0; i < 3; i++){
    radioModeButtons[i].addEventListener("click", () => {radioButChange(i)});

}

const titleSelect = document.getElementById("titleSelect");
const titleInput = document.getElementById("titleInput");
const titleTable = document.querySelector(".titleTable");

titleInput.addEventListener("input", () => {
    if (titleInput.value){
        titleSelect.selectedIndex = 0;
        clearRadioButtons();
    }
});

titleSelect.addEventListener("click", () => {
    if (titleSelect.value != "-"){
        titleInput.value = "";
        clearRadioButtons();
    }
});

const typeSelect = document.getElementById("typeSelect");
const typeInput = document.getElementById("typeInput");
const typeTable = document.querySelector(".typeTable");

typeInput.addEventListener("input", () => {
    if (typeInput.value){
        typeSelect.selectedIndex = 0;
        clearRadioButtons(1);
    }
});

typeSelect.addEventListener("click", () => {
    if (typeSelect.value != "-"){
        typeInput.value = "";
        clearRadioButtons(1);
    }
});

const resetTableButtons = document.querySelectorAll(".resetTableButton");
for (let i = 0; i < 2; i++){
    resetTableButtons[i].addEventListener("click", () => {clearRadioButtons(i)});
}

const minInput = document.getElementById("minInput");
const maxInput = document.getElementById("maxInput");

const fromDateLabel = document.querySelector(".fromDateLabel");
const fromDateInputText = document.querySelector("#fromDateInputText");
const fromDateInput = document.querySelector("#fromDateInput");
const toDateLabel = document.querySelector(".toDateLabel");
const toDateInputText = document.querySelector("#toDateInputText");
const toDateInput = document.querySelector("#toDateInput");

const datePickers = document.querySelectorAll(".datePicker");
const dateTextInputs = document.querySelectorAll(".dateTextInput");

for (let i = 0; i < 2; i++){
    dateTextInputs[i].addEventListener("click", (e) => {datePickers[i].showPicker()});
    datePickers[i].addEventListener("input", (e) => {dateTextInputs[i].value = e.target.value.toString()})
}

const descriptionInput = document.getElementById("descriptionInput");

const actionBut = document.querySelector(".actionBut");

const totalSelect = document.getElementById("totalSelect");
const incomeDisplay = document.getElementById("incomeDisplay");
const expensesDisplay = document.getElementById("expensesDisplay");
const totalDisplay = document.getElementById("totalDisplay");

const showInSearch = document.querySelectorAll(".showInSearch");
const hideInSearch = document.querySelectorAll(".hideInSearch");

const entriesTable = document.querySelector(".entriesTable").querySelector("tbody");
const resetEntryTableCB = document.querySelector(".resetCB");
resetEntryTableCB.addEventListener("click", (e) => {
    let allCB = document.querySelectorAll(".entryCheckbox");
    for (let cb of allCB) cb.checked = false;
    currentSession.data.dataSelected = [];
    e.target.disabled = true;
    checkFillConditions();
});

function sessionData(){
    this.data = {
        "full" : [],
        "dataSelected" : [],
        "titleOptions" : [],
        "titleRadioSelected" : [[], []],
        "typeOptions" : [],
        "typeRadioSelected" : [[], []],
        "total" : {},
        "filterResults" : {
            "filter" : false,
            "results" : []
        }
    }

    this.action = 0;

    this.newOption = (type = 0, option) => {
        let opType = (type == 0) ? "titleOptions" : "typeOptions";
        if (!this.data[opType].includes(option)){
            this.data[opType].push(option);

            let newOption = newOptionElement(option);
            let tableType = (type == 0) ? "title" : "type";
            
            if (type == 0){
                titleSelect.appendChild(newOption);
            } else {
                let cloneOption = newOption.cloneNode(true);
                typeSelect.appendChild(newOption);
                totalSelect.appendChild(cloneOption);
            } 
            appendToTable([option], tableType);
        }
    }

    this.addTotal = (key, amount, edit = false) => {
        let vType = (amount >= 0) ? "Income" : "Expense";
        if (key in this.data.total){
            if(edit) this.data.total[key][vType] -= amount;
            else this.data.total[key][vType] += amount;
        }
        else {
            this.data.total[key] = {
                "Income" : (vType == "Income") ? amount : 0, 
                "Expense" : (vType == "Income") ? 0 : amount
            };
        }
    }

    this.loadCVSData = (rawData, separator = ";") => {
        rawData = rawData.split("\n");
        rawData.splice(0, 1)[0].split(separator);

        let prepareData = (arr) => {
            arr[0] = new Date(arr[0]);
            arr[1] = Number(arr[1]);
            return arr;
        };
        
        rawData.forEach((row, cnt) => {
            if (row){
                row = row.split(separator);
                row = prepareData(row);
                this.data["full"].push(["ID" + cnt, row]);
                this.newOption(0, row[2]);
                this.newOption(1, row[3]);
                this.addTotal(row[3], row[1]);
            }
        });
        sortData();
        appendToTable();
    }
}

let currentSession = null;

const months = ['January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 'September', 
    'October', 'November', 'December'];
    
let colombianPeso = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
});

let sortData = (toSort = currentSession.data.full, asc = false, index = 0) => {
    return toSort.sort((a, b) => (asc)? a[1][index] - b[1][index] : b[1][index] - a[1][index]);
};

let newOptionElement = (option) => {
    let newOption = document.createElement("option");
    newOption.value = option;
    newOption.textContent = option;
    return newOption;
};

window.onload = () => {
    currentSession = new sessionData();
    radioModeButtons[0].checked = true;
    radioButChange();
}

function clearRadioButtons(tableNumber = 0){
    let resetButArray = (tableNumber == 0) ? titleTable.querySelectorAll("button") : typeTable.querySelectorAll("button");
    for (let j = 1; j < resetButArray.length; j++) resetButArray[j].click();
}

function checkFillConditions(){
    if (currentSession.data.dataSelected.length == 1){
        if (currentSession.action != 0){
            let tmpData = currentSession.data.full[currentSession.data.dataSelected[0]][1];
            fillDataForm(
                tmpData[2], 
                0, 
                tmpData[3], 
                0, 
                tmpData[1], 
                tmpData[0], 
                tmpData[4]
            );
        } else fillDataForm();
    } else fillDataForm();
}

function appendToTable(toAppend = currentSession.data["full"], table = "entry"){
    let dateToTextDate = (date) => {
        return date.getDate() + "/" + months[date.getMonth()] + "/" + date.getFullYear();
    };
    
    toAppend.forEach((entry, cnt) => {
        let newRow = document.createElement("tr");
        if (table == "entry"){
            let checkB = document.createElement("input");
            checkB.setAttribute("value", (entry.length == 3) ? entry[2] : cnt);
            checkB.setAttribute("type", "checkbox");
            checkB.setAttribute("class", "entryCheckbox");
            checkB.addEventListener("change", (e) => {
                let currentIndex = currentSession.data.dataSelected.indexOf(e.target.value);
                let displayData = currentSession.data.full[e.target.value][1];

                if (e.target.checked){
                    if(currentIndex <= -1){
                        currentSession.data.dataSelected.push(e.target.value);
                        currentSession.addTotal("Checked data", displayData[1]);
                        checkFillConditions();
                    }
                } else if (currentIndex > -1){
                    currentSession.data.dataSelected.splice(currentIndex, 1);
                    currentSession.addTotal("Checked data", displayData[1], true);
                    checkFillConditions();
                }
                let idxCnt = currentSession.data.dataSelected.length;
                if (idxCnt > 0){
                    resetEntryTableCB.disabled = false;
                    if (idxCnt > 1){
                        actionBut.textContent = "Edit all";
                    } else actionBut.textContent = "Edit";
                }
                else resetEntryTableCB.disabled = true;
            });
            
            [
                checkB,
                dateToTextDate(entry[1][0]), 
                colombianPeso.format(entry[1][1]), 
                entry[1][2],
                entry[1][3],
                entry[1][4]
            ].forEach((dt, dtCnt) => {
                let newCol = document.createElement("td");
                if (dtCnt != 0) newCol.textContent = dt;
                else newCol.appendChild(dt);
                newRow.appendChild(newCol);
            });
            entriesTable.appendChild(newRow);
        } else {
            let tableNum = (table == "title") ? "0" : "1";
            let idTag = entry + tableNum;
            for (let i = 0; i < 3; i++){
                let newCol = document.createElement("td");
                let newColData = undefined;
                let dataType = (i == 0) ? "0" : "1";
                if (i != 1){
                    newColData = document.createElement("input");
                    newColData.setAttribute("name", `radio${entry}`);
                    newColData.setAttribute("type", "radio");
                    newColData.setAttribute("id", `${idTag + dataType}`);
                    newColData.setAttribute("value", entry);
                    newColData.addEventListener("click", (e) => {
                        titleInput.value = "";
                        let value = e.target.value;
                        let tableType = e.target.id.charAt(e.target.id.length - 2);
                        tableType = (
                            (tableType == "0") ? 
                            currentSession.data.titleRadioSelected : 
                            currentSession.data.typeRadioSelected
                        );
                        let dataType = e.target.id.charAt(e.target.id.length - 1);
                        dataType = (dataType == "0") ? 0 : 1;
                        let oDataType = (dataType == 0) ? 1 : 0;
                        let valueIndex = tableType[dataType].indexOf(value);
                        let oValueIndex = tableType[oDataType].indexOf(value);
                        if(valueIndex <= -1) tableType[dataType].push(value);
                        if(oValueIndex > -1) tableType[oDataType].splice(oValueIndex, 1);
                        
                        checkIfRadioTableEmpty();
                        newRow.querySelector("button").disabled = false;
                    });
                } else {
                    newColData = document.createElement("button");
                    newColData.setAttribute("type", "button");
                    newColData.setAttribute("class", "resetRB");
                    newColData.disabled = true;
                    newColData.textContent = entry;
                    newColData.addEventListener("click", (e) => {
                        let includeR = document.getElementById(`${idTag + "0"}`);
                        let excludeR = document.getElementById(`${idTag + "1"}`);

                        includeR.checked = false;
                        excludeR.checked = false;

                        for (let x = 0; x < 2; x++){
                            let usedArray = (
                                (tableNum == 0) ? 
                                currentSession.data.titleRadioSelected[x] : 
                                currentSession.data.typeRadioSelected[x]
                            );
                            let radioIndex = usedArray.indexOf(entry);
                            if (radioIndex > -1){
                                usedArray.splice(radioIndex, 1);
                                checkIfRadioTableEmpty();
                            }
                        newColData.disabled = true;
                        }
                    });
                }
                newCol.appendChild(newColData);
                newRow.appendChild(newCol);
            }
            if (table == "title") titleTable.appendChild(newRow);
            else typeTable.appendChild(newRow);
        }
    });
}

function fillDataForm(
    titleText = "",
    titleSelection = 0,
    typeText = "",
    typeSelection = 0,
    amountText = "",
    dateText = "",
    descriptionText = "",
    totalSelection = 0
){
    titleInput.value = titleText;
    titleSelect.selectedIndex = titleSelection;

    typeInput.value = typeText;
    typeSelect.selectedIndex = typeSelection;

    minInput.value = amountText;
    maxInput.value = "";
    if (dateText instanceof Date) fromDateInput.valueAsDate = dateText;
    else fromDateInput.value = dateText;
    fromDateInput.dispatchEvent(new Event("input"));
    
    toDateInput.value = "";
    toDateInput.dispatchEvent(new Event("input"));

    descriptionInput.value = descriptionText;

    totalSelect.selectedIndex = totalSelection;
    totalSelect.click();
}

function checkIfRadioTableEmpty(){
    if(currentSession.data.titleRadioSelected[0].length > 0 || currentSession.data.titleRadioSelected[1].length > 0){
        resetTableButtons[0].disabled = false;
    } else resetTableButtons[0].disabled = true;
    if(currentSession.data.typeRadioSelected[0].length > 0 || currentSession.data.typeRadioSelected[1].length > 0){
        resetTableButtons[1].disabled = false;
    } else resetTableButtons[1].disabled = true;
    if (currentSession.data.dataSelected.length > 0) resetEntryTableCB.disabled = false;
    else resetEntryTableCB.disabled = true;
}

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file){
        const reader = new FileReader();
        reader.onload = (e) => {
            currentSession.loadCVSData(e.target.result);
        };
        reader.readAsText(file);
    }
});

function radioButChange(act = 0){
    currentSession.action = act;

    checkFillConditions();
    
    minInput.setAttribute("placeholder", (act == 0) ? "Minimim amount..." : "Amount...");

    for (let i = 0; i < showInSearch.length; i++){
        showInSearch[i].style.display = (act == 0) ? "" : "none";
    }
    for (let i = 0; i < hideInSearch.length; i ++) {
        hideInSearch[i].style.display = (act == 0) ? "none" : "";
    }

    actionBut.textContent = (act == 0) ? "Search" : (act == 1) ? "New entry" : "Edit";
    checkIfRadioTableEmpty();
}

totalSelect.addEventListener("click", () => {
    if (totalSelect.value != "-"){
        let inc = currentSession.data.total[totalSelect.value].Income;
        let exp = currentSession.data.total[totalSelect.value].Expense;
        incomeDisplay.value = colombianPeso.format(inc);
        expensesDisplay.value = colombianPeso.format(exp);
        totalDisplay.value = colombianPeso.format(inc + exp);
    }
    else {
        totalDisplay.value = "";
        incomeDisplay.value = "";
        expensesDisplay.value = "";
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

    let dateTimezoneCorrection = (oldDate) => {
        let newDate = new Date(oldDate);
        return new Date(newDate.getTime() + (300 * 60000));
    };
    
    if (currentSession.action == 0){
        currentSession.data.filterResults.results = [];
        currentSession.data.total["Filtered results"] = {
            "Income" : 0, 
            "Expense" : 0
        };

        if (minInput.value) minV = minInput.value;
        if (maxInput.value) maxV = maxInput.value;
        if (minV && maxV){
            if (minInput.value > maxInput.value) return alert("Minimun value cannot be lower than maximum value");
        }

        if (fromDateInput.value) fDate = dateTimezoneCorrection(fromDateInput.value);
        if (toDateInput.value) tDate = dateTimezoneCorrection(toDateInput.value);
        if (fDate && tDate){
            if (fromDateInput.value > toDateInput.value) return alert("From date cannot be before To date");
        }
        
        if (
            titleInput.value || 
            currentSession.data.titleRadioSelected[0].length > 0 || 
            currentSession.data.titleRadioSelected[1].length > 0
        ) title = true;

        if (
            currentSession.data.typeRadioSelected[0].length > 0 || 
            currentSession.data.typeRadioSelected[1].length > 0
        ) type = true;

        if (descriptionInput.value) description = descriptionInput.value;

        if (!(title || type || minV || maxV || fDate || tDate || description)){
            entriesTable.replaceChildren();
            appendToTable();
            return;
        }

        resetEntryTableCB.click();
        
        currentSession.data.full.forEach((row, cnt) => {
            let entryData = row[1];

            if (title){
                if (titleInput.value){
                    if (!entryData[2].toLowerCase().includes(titleInput.value.toLowerCase())) return;
                } else {
                    if (
                        currentSession.data.titleRadioSelected[0].length > 0 && 
                        !currentSession.data.titleRadioSelected[0].includes(entryData[2])
                    ) return;
                    if (
                        currentSession.data.titleRadioSelected[1].length > 0 && 
                        currentSession.data.titleRadioSelected[1].includes(entryData[2])
                    ) return;
                }
            }
            if (type){
                if (
                    currentSession.data.typeRadioSelected[0].length > 0 && 
                    !currentSession.data.typeRadioSelected[0].includes(entryData[3])
                ) return;
                if (
                    currentSession.data.typeRadioSelected[1].length > 0 && 
                    currentSession.data.typeRadioSelected[1].includes(entryData[3])
                ) return;
            }
            if (minV || maxV){
                if (minV){
                    if(entryData[1] < Number(minV)) return;
                }
                if (maxV){
                    if(entryData[1] > Number(maxV)) return;
                }
            }
            if (fDate || tDate){
                if (fDate){
                    if (entryData[0] < fDate) return;
                } 
                if (tDate){
                    if (entryData[0] > tDate) return;
                } 
            }
            if (description){
                if(!entryData[4].toLowerCase().includes(description.toLowerCase())) return;
            }
            currentSession.data.filterResults.results.push(row.concat(cnt));
            currentSession.addTotal("Filtered results", entryData[1]);
        });
        
        entriesTable.replaceChildren();
        if (currentSession.data.filterResults.results.length > 0){
            sortData(currentSession.data.filterResults.results);
            appendToTable(currentSession.data.filterResults.results);
            if (!currentSession.data.filterResults.filter){
                let newOption = newOptionElement("Filtered results");
                totalSelect.appendChild(newOption);
                currentSession.data.filterResults.filter = true;
            }
            totalSelect.selectedIndex = totalSelect.options.length - 1;
            totalSelect.click();
        }
    } else {
        if (!(titleInput.value || titleSelect.value != "-")) return alert("Title field requiered");
        if (!(typeInput.value || typeSelect.value != "-")) return alert("Type field requiered");
        if (!minInput.value) return alert("Amount field requiered");
        if (!fromDateInput.value) return alert("Date field requiered");

        let tmpDate = dateTimezoneCorrection(fromDateInput.value);
        let tmpType = (typeInput.value) ? typeInput.value : typeSelect.value;
        let tmpAmount = Number(minInput.value);
        let tmpTitle = (titleInput.value) ? titleInput.value : titleSelect.value;

        let newEntry = ["ID" + currentSession.data.full.length, [
            tmpDate,
            tmpAmount,
            tmpTitle,
            tmpType,
            (descriptionInput.value) ? descriptionInput.value : "-"
        ]];

        currentSession.newOption(0, tmpTitle);
        currentSession.newOption(1, tmpType);
        
        entriesTable.replaceChildren();
        if (currentSession.action == 1){
            currentSession.data.full.push(newEntry);
            radioButChange(1);

            currentSession.addTotal(tmpType, tmpAmount);
            appendToTable();
        } else {
            for (let editIndex of currentSession.data.dataSelected){
                let editType = currentSession.data.full[editIndex][1][3];
                let editAmount = currentSession.data.full[editIndex][1][1];
                currentSession.data.full[editIndex][1] = newEntry[1];
                if (editType != newEntry[1][3] || editAmount != newEntry[1][1]){
                    currentSession.addTotal(editType, editAmount, true);
                    currentSession.addTotal(tmpType, tmpAmount);
                }
            }
            radioButChange(2);
            if (currentSession.data.filterResults.results) appendToTable(currentSession.data.filterResults.results);
            else appendToTable();
        }
    }
});