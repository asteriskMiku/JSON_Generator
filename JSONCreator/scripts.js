// scripts.js

function addField() {
    const builder = document.getElementById('json-builder');
    const field = document.createElement('div');
    field.className = 'json-field';
    field.innerHTML = `
        <label>Key: </label>
        <input type="text" placeholder="Key" class="json-key">
        <label>Type: </label>
        <select class="json-type" onchange="updateInputField(this)">
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
        </select>
        <label>Value: </label>
        <input type="text" placeholder="Value" class="json-value">
        <button onclick="removeField(this)">Remove</button>
    `;
    builder.appendChild(field);
}

function updateInputField(select) {
    const valueInput = select.nextElementSibling.nextElementSibling;
    if (select.value === "boolean") {
        const booleanSelect = document.createElement('select');
        booleanSelect.className = 'json-value';
        booleanSelect.innerHTML = `
            <option value="true">True</option>
            <option value="false">False</option>
        `;
        valueInput.replaceWith(booleanSelect);
    } else {
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.placeholder = 'Value';
        textInput.className = 'json-value';
        valueInput.replaceWith(textInput);
    }
}

function removeField(button) {
    const field = button.parentElement;
    field.remove();
}

function openArrayModal() {
    const arrayModal = document.getElementById('array-modal');
    arrayModal.style.display = 'block';
}

function closeArrayModal() {
    const arrayModal = document.getElementById('array-modal');
    arrayModal.style.display = 'none';
}

function addArrayField() {
    const builder = document.getElementById('array-element-builder');
    const field = document.createElement('div');
    field.className = 'json-field';
    field.innerHTML = `
        <label>Variable Name: </label>
        <input type="text" placeholder="Variable Name" class="array-var-name">
        <label>Type: </label>
        <select class="array-var-type">
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
        </select>
        <button onclick="removeArrayField(this)">Remove</button>
    `;
    builder.appendChild(field);
}

function removeArrayField(button) {
    const field = button.parentElement;
    field.remove();
}

let arrays = {};

function addArray() {
    const arrayName = document.getElementById('array-name').value;
    if (!arrayName) {
        alert('Please enter an array name');
        return;
    }

    const varNames = document.getElementsByClassName('array-var-name');
    const varTypes = document.getElementsByClassName('array-var-type');
    let arrayStructure = [];

    for (let i = 0; i < varNames.length; i++) {
        let varName = varNames[i].value;
        let varType = varTypes[i].value;
        if (varName) {
            arrayStructure.push({ name: varName, type: varType });
        }
    }

    arrays[arrayName] = { structure: arrayStructure, elements: [] };

    const arrayBuilder = document.getElementById('json-builder');
    const arrayField = document.createElement('div');
    arrayField.className = 'json-array box';
    arrayField.innerHTML = `
        <h3>${arrayName}</h3>
        <button onclick="addArrayElement('${arrayName}')">Add Element</button>
        <button onclick="removeArray(this, '${arrayName}')">Remove Array</button>
        <div id="${arrayName}-element-inputs"></div>
        <div id="${arrayName}-elements"></div>
    `;
    arrayBuilder.appendChild(arrayField);

    closeArrayModal();
}

function addArrayElement(arrayName) {
    const arrayInfo = arrays[arrayName];
    const elementInputsDiv = document.getElementById(`${arrayName}-element-inputs`);
    
    const elementDiv = document.createElement('div');
    elementDiv.className = 'json-field';
    
    arrayInfo.structure.forEach(field => {
        const label = document.createElement('label');
        label.textContent = `${field.name} (${field.type}): `;
        elementDiv.appendChild(label);
        if (field.type === 'boolean') {
            const booleanSelect = document.createElement('select');
            booleanSelect.className = 'array-element-input';
            booleanSelect.innerHTML = `
                <option value="true">True</option>
                <option value="false">False</option>
            `;
            elementDiv.appendChild(booleanSelect);
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `${field.name} (${field.type})`;
            input.className = 'array-element-input';
            elementDiv.appendChild(input);
        }
    });
    
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = function () {
        elementDiv.remove();
    };
    elementDiv.appendChild(removeButton);
    
    elementInputsDiv.appendChild(elementDiv);
}

function removeArray(button, arrayName) {
    const arrayField = button.parentElement;
    arrayField.remove();
    delete arrays[arrayName];
}

function generateJSON() {
    const keys = document.getElementsByClassName('json-key');
    const values = document.getElementsByClassName('json-value');
    const types = document.getElementsByClassName('json-type');
    let jsonObject = {};

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i].value;
        let valueElement = values[i];
        let type = types[i].value;
        let value;
        if (type === 'boolean') {
            value = valueElement.value === 'true';
        } else if (type === 'number') {
            value = parseFloat(valueElement.value);
        } else {
            value = valueElement.value;
        }

        if (key) {
            jsonObject[key] = value;
        }
    }

    for (const arrayName in arrays) {
        const elementInputsDiv = document.getElementById(`${arrayName}-element-inputs`);
        const elementDivs = elementInputsDiv.getElementsByClassName('json-field');
        
        arrays[arrayName].elements = [];
        const arrayInfo = arrays[arrayName];
        for (let i = 0; i < elementDivs.length; i++) {
            const elementDiv = elementDivs[i];
            const inputs = elementDiv.getElementsByClassName('array-element-input');
            
            let newElement = {};
            arrayInfo.structure.forEach((field, index) => {
                let valueElement = inputs[index];
                let value;
                if (field.type === 'boolean') {
                    value = valueElement.value === 'true';
                } else if (field.type === 'number') {
                    value = parseFloat(valueElement.value);
                } else {
                    value = valueElement.value;
                }
                newElement[field.name] = value;
            });
            
            arrays[arrayName].elements.push(newElement);
        }
        
        jsonObject[arrayName] = arrays[arrayName].elements;
    }

    const output = document.getElementById('output');
    output.textContent = JSON.stringify(jsonObject, null, 2);
}
