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
    const selectedUnit = document.getElementById('unit').value; // Get the selected unit
    windowInputsDiv.innerHTML = ''; // Clear previous inputs

    if (!isNaN(numWindows) && numWindows > 0) {
        for (let i = 1; i <= numWindows; i++) {
            windowInputsDiv.innerHTML += `
                <div class="window-input">
                    <h3>Window ${i}</h3>
                    <label for="height${i}">Enter Height:</label>
                    <input type="number" id="height${i}" placeholder="Enter Height in ${selectedUnit}">
                    <label for="width${i}">Enter Width:</label>
                    <input type="number" id="width${i}" placeholder="Enter Width in ${selectedUnit}">
                    <label for="color${i}">Select Color:</label>
                    <select id="color${i}">
                        <option value="BK">Black</option>
                        <option value="GR">Grey</option>
                        <option value="CR">Cream</option>
                        <option value="WH">White</option>
                    </select>
                </div>
            `;
        }
        windowInputsDiv.style.display = 'block'; // Show the inputs container
    } else {
        windowInputsDiv.style.display = 'none'; // Hide the inputs container
    }
});

// Update placeholders when the unit is changed
function updatePlaceholders() {
    const selectedUnit = document.getElementById('unit').value; // Get the selected unit
    const numWindows = parseInt(document.getElementById('numWindows').value);
    const windowInputsDiv = document.getElementById('windowInputs');

    if (!isNaN(numWindows) && numWindows > 0) {
        for (let i = 1; i <= numWindows; i++) {
            const heightInput = document.getElementById(`height${i}`);
            const widthInput = document.getElementById(`width${i}`);
            if (heightInput) heightInput.placeholder = `Enter Height in ${selectedUnit}`;
            if (widthInput) widthInput.placeholder = `Enter Width in ${selectedUnit}`;
        }
    }
}

// Calculate sizes and find matches
function calculateSizes() {
    const unit = document.getElementById('unit').value; // User-selected unit
    const numWindows = parseInt(document.getElementById('numWindows').value);
    const messageArea = document.getElementById('messageArea'); // Static message area

    messageArea.innerHTML = ''; // Clear previous messages

    if (!sizeData) {
        messageArea.innerHTML = '<p class="error">Size data is not available. Please try again later.</p>';
        console.error('Size data is not loaded. Check JSON file.');
        return;
    }

    for (let i = 1; i <= numWindows; i++) {
        const height = parseFloat(document.getElementById(`height${i}`).value);
        const width = parseFloat(document.getElementById(`width${i}`).value);
        const color = document.getElementById(`color${i}`).value.toUpperCase();

        if (!height || !width || height <= 0 || width <= 0) {
            messageArea.innerHTML += `<p class="error">Please enter valid dimensions for Window ${i}.</p>`;
            console.warn(`Invalid dimensions for Window ${i}.`);
            continue;
        }

        let normalizedHeight = height,
            normalizedWidth = width,
            normalizedUnit = unit;

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

        console.log(
            `Window ${i}: Normalized Input - Height: ${normalizedHeight} Cm, Width: ${normalizedWidth} Cm, Color: ${color}`
        );

        // Exact Match Logic
        const exactMatch = sizeData.find((size) => {
            return (
                size['Unit'] === unit && // Match user-selected unit
                ((size['Height(H)'] === height && size['Width(W)'] === width) ||
                    (size['Height(H)'] === width && size['Width(W)'] === height)) && // Interchangeable dimensions
                size['Color'].toUpperCase() === color // Match color
            );
        });

        if (exactMatch) {
            messageArea.innerHTML += `
                <div class="message success">
                    <h3>CONGRATULATIONS! YOUR EXACT SIZE IS AVAILABLE ✅</h3>
                    <p>Size (HxW): ${height} x ${width} ${unit}</p>
                    <p>Color: ${getColorName(color)}</p>
                    <p><a href="${exactMatch['Amazon Link']}" target="_blank" style="color: green; font-weight: bold;">CLICK HERE: To Order Directly on Amazon</a></p>
                </div>
            `;
            console.log(`Exact match found for Window ${i}:`, exactMatch);
            continue;
        }

        // Closest Match Logic (Always in 'Cm')
        let closestMatch = null;
        let smallestDifference = Infinity;

        sizeData.forEach((size) => {
            if (size['Unit'] !== 'Cm' || size['Color'].toUpperCase() !== color) return; // Match color and unit

            const diff1 =
                Math.abs(size['Height(H)'] - normalizedHeight) +
                Math.abs(size['Width(W)'] - normalizedWidth);
            const diff2 =
                Math.abs(size['Height(H)'] - normalizedWidth) +
                Math.abs(size['Width(W)'] - normalizedHeight);

            const difference = Math.min(diff1, diff2);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestMatch = size;
            }
        });

        if (closestMatch) {
            messageArea.innerHTML += `
                <div class="message info">
                    <h3>CLOSEST MATCH FOUND</h3>
                    <p>Custom Size Needed (HxW): ${height} x ${width} ${unit}</p>
                    <p>Custom Size Needed in Cm (HxW): ${normalizedHeight.toFixed(2)} x ${normalizedWidth.toFixed(2)} Cm</p>
                    <p>Size To Order on Amazon (HxW): 
                        <a href="${closestMatch['Amazon Link']}" target="_blank" style="color: blue; font-weight: bold;">${closestMatch['Size(HxW)']} Cm</a>
                    </p>
                    <p>Color: ${getColorName(color)}</p>
                    <p style="margin-top: 10px;">NEXT STEPS: After placing the order 
                        <a href="https://wa.link/8h5hho" target="_blank" style="color: green; font-weight: bold;">
                            <img src="https://i.postimg.cc/Z5qJ54NZ/whatsapp-icon.png" alt="WhatsApp" style="width: 16px; height: 16px; vertical-align: middle;">
                            CLICK HERE
                        </a> to send customization request to +91-73046 92553.
                    </p>
                </div>
            `;
            console.log(`Closest match found for Window ${i}:`, closestMatch);
        } else {
            messageArea.innerHTML += `<p class="error">No suitable match found for Window ${i}. Please check your inputs.</p>`;
            console.warn(`No suitable match found for Window ${i}.`);
        }
    }
}

// Helper function to get color name
function getColorName(colorCode) {
    switch (colorCode) {
        case 'BK':
            return 'Black';
        case 'GR':
            return 'Grey';
        case 'CR':
            return 'Cream';
        case 'WH':
            return 'White';
        default:
            return 'Unknown';
    }
}
