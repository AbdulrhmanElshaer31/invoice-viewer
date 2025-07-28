const container = document.getElementById('Containner');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('upload-btn');
const tempDropZone = dropZone;
const form = document.getElementById('Form');
const vendor = document.getElementById('vendor');
const invoiceDate = document.getElementById('invoice_date');
const amount = document.getElementById('amount');
const taxId = document.getElementById('tax_id');
const editBtn = document.getElementById('editBtn');
const doneEdit = document.getElementById('doneEdit');
const loadingSpinner = document.getElementById('loading-spinner');
let flag = false;

// Show loading spinner
function showLoading() {
    loadingSpinner.classList.add('show');
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.classList.remove('show');
}

editBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.form input');

    if (!flag) {
        // === Edit Mode ===
        inputs.forEach(input => {
            input.disabled = false;
            input.classList.remove('inp-cursor');
        });
        editBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save`;
        flag = true;

    } else {
        // === Save Mode ===
        showLoading();

        // Simulate processing delay
        setTimeout(() => {
            // Remove previous error messages
            document.querySelectorAll('.error-message').forEach(el => el.remove());

            let valid = true;

            inputs.forEach(input => {
                const value = input.value.trim();
                const error = document.createElement('div');
                error.className = 'error-message';
                error.style.color = 'red';
                error.style.fontSize = '12px';
                error.style.marginTop = '4px';

                // Validation: required
                if (value === '') {
                    error.textContent = `${input.id.replace('_', ' ')} is required`;
                    input.parentElement.appendChild(error);
                    valid = false;
                }

                // Validation: amount must be number
                if (input.id === 'amount' && value !== '' && isNaN(value)) {
                    error.textContent = 'Amount must be a number';
                    input.parentElement.appendChild(error);
                    valid = false;
                }

                // Validation: tax_id must be alphanumeric only
                if (input.id === 'tax_id' && value !== '' && !/^[a-zA-Z0-9]+$/.test(value)) {
                    error.textContent = 'Tax ID must contain only letters and numbers';
                    input.parentElement.appendChild(error);
                    valid = false;
                }
            });

            hideLoading();

            if (!valid) return;

            // === Lock Inputs Again ===
            inputs.forEach(input => {
                input.disabled = true;
                input.classList.add('inp-cursor');
            });

            // === Print updated data ===
            const formData = {
                vendor: vendor.value,
                invoice_date: invoiceDate.value,
                amount: amount.value,
                tax_id: taxId.value
            };
            console.log(formData);

            // === Show success message ===

            doneEdit.style.display = 'block';
            doneEdit.textContent = 'Data has been successfully updated.';


            // === Reset button and flag ===
            editBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Edit`;
            flag = false;
        }, 1500); // 1.5 second delay for demo
    }
});

// ========== Upload Button Functionality ==========
uploadBtn.addEventListener('click', async () => {
    await fileInput.click();

    // Triggered when user selects a file manually
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            showLoading();
            // Simulate file processing delay
            setTimeout(() => {
                createFileDetails();
                hideLoading();
            }, 2000); // 2 second delay for demo
        }
    }, { once: true }); // only once per click
});

async function getData() {
    try {
        // showLoading();
        const response = await fetch('invoice.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        vendor.value = data.vendor || '';
        invoiceDate.value = data.invoice_date || '';
        amount.value = data.amount || '';
        taxId.value = data.tax_id || '';
        // hideLoading();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        // Set sample data if fetch fails
        vendor.value = "Acme Corp";
        invoiceDate.value = "2024-12-15";
        amount.value = "1250.00";
        taxId.value = "DE123456789";
        // hideLoading();
    }
}



// ========== Create or Update File Details UI ==========
function createFileDetails() {
    dropZone.remove();
    let fileDiv = document.querySelector('.file');
    let title = document.querySelector('h1');
    form.style.display = 'block';
    getData();
    // If file display doesn't exist → create it
    if (!fileDiv) {
        // Create elements
        title = document.createElement('h1');
        fileDiv = document.createElement('div');
        let fileIcon = document.createElement('div');
        let icon = document.createElement('img');
        let fileDetails = document.createElement('div');
        let fileName = document.createElement('p');
        let fileSize = document.createElement('p');
        let delBtn = document.createElement('button');

        // Set content & classes
        title.textContent = 'Uploaded File';
        fileDiv.classList.add('file');
        fileIcon.classList.add('fileIcon');
        icon.src = 'file.png';
        fileDetails.classList.add('fileDetails');
        fileName.classList.add('file-name');
        fileSize.classList.add('file-size');
        delBtn.textContent = 'Delete';
        delBtn.classList.add('Del-btn');

        // Append elements together
        fileIcon.appendChild(icon);
        fileDetails.appendChild(fileName);
        fileDetails.appendChild(fileSize);
        fileDiv.appendChild(fileIcon);
        fileDiv.appendChild(fileDetails);
        fileDiv.appendChild(delBtn);
        container.append(title, fileDiv);

        // Delete button functionality
        delBtn.addEventListener('click', () => {
            title.remove();
            fileDiv.remove();
            container.append(tempDropZone);
            form.style.display = 'none';
        });
    }

    // Update filename and size
    const fileNameElem = fileDiv.querySelector('.file-name');
    const fileSizeElem = fileDiv.querySelector('.file-size');
    const selectedFile = fileInput.files[0];

    fileNameElem.textContent = selectedFile.name;
    const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    fileSizeElem.textContent = `${sizeInMB} MB`;
}

// ========== Drag and Drop Events (Prevent Defaults) ==========
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
    });
});

// ========== Drag Styling ==========
dropZone.addEventListener('dragover', () => {
    dropZone.classList.add('dragging'); // Add visual cue
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragging');
});

// ========== Handle Drop Event ==========
dropZone.addEventListener('drop', (event) => {
    dropZone.classList.remove('dragging');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files; // Assign dropped file to hidden input
        showLoading();
        // Simulate file processing delay
        setTimeout(() => {
            createFileDetails();     // Show the file in UI
            hideLoading();
        }, 2000); // 2 second delay for demo
    }
});
