function addField() {
    const builder = document.getElementById('json-builder');
    const field = document.createElement('div');
    field.className = 'json-field';
    field.innerHTML = `
        <label>Variable Name: </label>
        <input type="text" placeholder="Variable Name" class="var-name">
        <label>Type: </label>
        <select class="var-type" onchange="handleTypeChange(this)">
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="array">Array</option>
        </select>
        <input type="text" placeholder="Value" class="var-value">
        <button onclick="removeField(this)">Remove</button>
        <button onclick="defineArray(this)" style="display: none;">Define Array</button>
    `;
    builder.appendChild(field);
}

function handleTypeChange(select) {
    const valueInput = select.parentNode.querySelector('.var-value');
    const defineArrayButton = select.parentNode.querySelector('button[onclick="defineArray(this)"]');
    if (select.value === 'array') {
        valueInput.style.display = 'none';
        defineArrayButton.style.display = 'inline-block';
    } else {
        valueInput.style.display = 'inline-block';
        defineArrayButton.style.display = 'none';
    }
}

function defineArray(button) {
    const field = button.parentNode;
    const arrayBuilder = document.createElement('div');
    arrayBuilder.className = 'json-array';
    arrayBuilder.innerHTML = `
        <div class="array-element-builder">
            <div class="json-field">
                <label>Variable Name: </label>
                <input type="text" placeholder="Variable Name" class="array-var-name">
                <label>Type: </label>
                <select class="array-var-type">
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                </select>
                <button onclick="removeArrayField(this)">Remove</button>
            </div>
        </div>
        <button onclick="addArrayField(this)">Add Array Field</button>
        <button onclick="finalizeArray(this)">Finalize Array</button>
    `;
    field.appendChild(arrayBuilder);
    button.style.display = 'none';
}

function addArrayField(button) {
    const builder = button.parentNode.querySelector('.array-element-builder');
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

function finalizeArray(button) {
    const arrayBuilder = button.parentNode;
    const arrayFields = [];
    arrayBuilder.querySelectorAll('.json-field').forEach(el => {
        const varName = el.querySelector('.array-var-name').value;
        const varType = el.querySelector('.array-var-type').value;
        arrayFields.push({ name: varName, type: varType });
    });
    const parentField = arrayBuilder.parentNode;
    const arrayData = { fields: arrayFields };
    parentField.dataset.array = JSON.stringify(arrayData);
    arrayBuilder.remove();
    const defineArrayButton = parentField.querySelector('button[onclick="defineArray(this)"]');
    defineArrayButton.style.display = 'none';
    const valueInput = parentField.querySelector('.var-value');
    valueInput.style.display = 'none';
    parentField.insertAdjacentHTML('beforeend', `
        <div class="array-values"></div>
        <div class="array-buttons">
            <button onclick="addArrayIndex(this)">Add Elements</button>
        </div>
    `);
    addArrayIndex(parentField.querySelector('button[onclick="addArrayIndex(this)"]'));
}

function addArrayIndex(button) {
    const arrayData = JSON.parse(button.parentNode.parentNode.dataset.array);
    const arrayValuesContainer = button.parentNode.previousElementSibling;
    const indexContainer = document.createElement('div');
    indexContainer.className = 'array-index';
    indexContainer.innerHTML = `<h4>Index <span class="index-number">${arrayValuesContainer.children.length}</span> <button onclick="removeArrayIndex(this)">Remove</button></h4>`;
    arrayData.fields.forEach(field => {
        const valueField = document.createElement('div');
        valueField.className = 'json-field';
        valueField.innerHTML = `
            <label>${field.name} (${field.type}): </label>
            <input type="text" class="array-value" placeholder="Value">
        `;
        indexContainer.appendChild(valueField);
    });
    arrayValuesContainer.appendChild(indexContainer);
    updateIndexNumbers(arrayValuesContainer);
}

function removeField(button) {
    button.parentNode.remove();
}

function removeArrayField(button) {
    button.parentNode.remove();
}

function removeArrayIndex(button) {
    const arrayValuesContainer = button.parentNode.parentNode.parentNode;
    button.parentNode.parentNode.remove();
    updateIndexNumbers(arrayValuesContainer);
}

function updateIndexNumbers(arrayValuesContainer) {
    const indexContainers = arrayValuesContainer.querySelectorAll('.array-index');
    indexContainers.forEach((container, index) => {
        container.querySelector('.index-number').textContent = index;
    });
}

function generateJSON() {
    const fields = document.querySelectorAll('.json-field');
    const jsonResult = {};
    fields.forEach(field => {
        const varNameInput = field.querySelector('.var-name');
        if (!varNameInput) return;  // Skip if no var-name input
        const varName = varNameInput.value;
        const varType = field.querySelector('.var-type').value;
        if (varType === 'array') {
            const arrayData = JSON.parse(field.dataset.array);
            const arrayIndexes = field.querySelectorAll('.array-index');
            const arrayResult = [];
            arrayIndexes.forEach(index => {
                const indexValues = {};
                index.querySelectorAll('.json-field').forEach(valueField => {
                    const label = valueField.querySelector('label').textContent;
                    const valueInput = valueField.querySelector('.array-value');
                    const value = valueInput.value;
                    const key = label.split(' (')[0];
                    const fieldType = label.split(' (')[1].split(')')[0];
                    if (fieldType === 'number') {
                        indexValues[key] = parseFloat(value);
                    } else if (fieldType === 'boolean') {
                        indexValues[key] = !(value === '0' || value.toLowerCase() === 'false');
                    } else {
                        indexValues[key] = value;
                    }
                });
                arrayResult.push(indexValues);
            });
            jsonResult[varName] = arrayResult;
        } else {
            const varValue = field.querySelector('.var-value').value;
            if (varType === 'number') {
                jsonResult[varName] = parseFloat(varValue);
            } else if (varType === 'boolean') {
                jsonResult[varName] = !(varValue === '0' || varValue.toLowerCase() === 'false');
            } else {
                jsonResult[varName] = varValue;
            }
        }
    });
    document.getElementById('output').textContent = JSON.stringify(jsonResult, null, 2);
}