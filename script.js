// Load the size data from the JSON file
let sizeData;

// Fetch the JSON data and prevent caching issues
fetch('MQ_Sizes_Unit_Color_and_Links.json?v=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        sizeData = data;
        console.log('Size data loaded successfully:', sizeData); // Debug: Verify JSON is loaded
    })
    .catch(error => console.error('Error loading size data:', error));

// Generate dynamic inputs based on the number of windows
document.getElementById('numWindows').addEventListener('input', function () {
    const numWindows = parseInt(this.value);
    const windowInputsDiv = document.getElementById('windowInputs');
    windowInputsDiv.innerHTML = ''; // Clear previous inputs

    if (!isNaN(numWindows) && numWindows > 0) {
        for (let i = 1; i <= numWindows; i++) {
            windowInputsDiv.innerHTML += `
                <h3>Window ${i}</h3>
                <label for="height${i}">Enter Height:</label>
                <input type="number" id="height${i}" placeholder="Enter height">
                <label for="width${i}">Enter Width:</label>
                <input type="number" id="width${i}" placeholder="Enter width">
                <label for="color${i}">Select Color:</label>
                <select id="color${i}">
                    <option value="BK">Black</option>
                    <option value="GR">Grey</option>
                    <option value="CR">Cream</option>
                    <option value="WH">White</option>
                </select>
            `;
        }
    } else {
        console.warn('Invalid number of windows entered.');
    }
});

// Calculate sizes and find matches
function calculateSizes() {
    const unit = document.getElementById('unit').value; // User-selected unit
    const numWindows = parseInt(document.getElementById('numWindows').value);

    if (!sizeData) {
        alert('Size data is not available. Please try again later.');
        console.error('Size data is not loaded. Check JSON file.');
        return;
    }

    for (let i = 1; i <= numWindows; i++) {
        const height = parseFloat(document.getElementById(`height${i}`).value);
        const width = parseFloat(document.getElementById(`width${i}`).value);
        const color = document.getElementById(`color${i}`).value.toUpperCase();

        if (!height || !width || height <= 0 || width <= 0) {
            alert(`Please enter valid dimensions for Window ${i}.`);
            console.warn(`Invalid dimensions for Window ${i}.`);
            continue;
        }

        let normalizedHeight = height, normalizedWidth = width, normalizedUnit = unit;

        // Normalize dimensions based on user-selected unit
        if (unit === 'Inch') {
            normalizedHeight = height * 2.54;
            normalizedWidth = width * 2.54;
            normalizedUnit = 'Cm'; // Convert inches to cm
        } else if (unit === 'Feet') {
            normalizedHeight = height * 30.48;
            normalizedWidth = width * 30.48;
            normalizedUnit = 'Cm'; // Convert feet to cm for closest match logic
        }

        console.log(`Window ${i}: Normalized Input - Height: ${normalizedHeight} Cm, Width: ${normalizedWidth} Cm, Color: ${color}`);

        // Exact Match Logic
        const exactMatch = sizeData.find(size => {
            return (
                size['Unit'] === unit && // Match user-selected unit
                ((size['Height(H)'] === height && size['Width(W)'] === width) || 
                 (size['Height(H)'] === width && size['Width(W)'] === height)) && // Interchangeable dimensions
                size['Color'].toUpperCase() === color // Match color
            );
        });

        if (exactMatch) {
            showPopup(
                'READY SIZE AVAILABLE ✅',
                `Order Now on Amazon: <a href="${exactMatch['Amazon Link']}" target="_blank">${exactMatch['Size(HxW)']}</a> (${exactMatch['Unit']})`,
                'success'
            );
            console.log(`Exact match found for Window ${i}:`, exactMatch);
            continue;
        }

        // Closest Match Logic (Always in 'Cm')
        let closestMatch = null;
        let smallestDifference = Infinity;

        sizeData.forEach(size => {
            if (size['Unit'] !== 'Cm' || size['Color'].toUpperCase() !== color) return; // Match color and unit

            const diff1 = Math.abs(size['Height(H)'] - normalizedHeight) + Math.abs(size['Width(W)'] - normalizedWidth);
            const diff2 = Math.abs(size['Height(H)'] - normalizedWidth) + Math.abs(size['Width(W)'] - normalizedHeight);

            const difference = Math.min(diff1, diff2);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestMatch = size;
            }
        });

        if (closestMatch) {
            showPopup(
                'CLOSEST MATCH FOUND',
                `Order on Amazon: <a href="${closestMatch['Amazon Link']}" target="_blank">${closestMatch['Size(HxW)']}</a> (${closestMatch['Unit']})<br>
                 <strong>IMP:</strong> <a href="https://wa.link/8h5hho" target="_blank">Click HERE</a> after placing the order to send customization request to +91 73046 92553.`,
                'info'
            );
            console.log(`Closest match found for Window ${i}:`, closestMatch);
        } else {
            alert(`No suitable match found for Window ${i}. Please check your inputs.`);
            console.warn(`No suitable match found for Window ${i}.`);
        }
    }
}

// Popup Functionality
function showPopup(title, message, type) {
    const popup = document.createElement('div');
    popup.className = `popup ${type}`;
    popup.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="this.parentElement.remove()">Close</button>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 10000); // Auto-close after 10 seconds
}

