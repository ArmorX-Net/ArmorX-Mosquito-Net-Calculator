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
            const heightInFeet = height / 12; // Convert to feet for exact match
            const widthInFeet = width / 12;

            // Check for exact match in feet
            const exactMatchFeet = sizeData.find((size) => {
                return (
                    size['Unit'] === 'Feet' &&
                    ((size['Height(H)'] === heightInFeet && size['Width(W)'] === widthInFeet) ||
                        (size['Height(H)'] === widthInFeet && size['Width(W)'] === heightInFeet)) &&
                    size['Color'].toUpperCase() === color
                );
            });

            if (exactMatchFeet) {
                messageArea.innerHTML += `
                    <div class="message success">
                        <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
                        <h4>CONGRATULATIONS! <br>YOUR EXACT SIZE IS AVAILABLE ✅</h4>
                        <p>Size (HxW): <strong>${heightInFeet.toFixed(1)} x ${widthInFeet.toFixed(1)} Feet</strong></p>
                        <p>Color: <strong>${getColorName(color)}</strong></p>
                        <p>
                            <a href="${exactMatchFeet['Amazon Link']}" target="_blank" style="color: green; font-weight: bold;">
                                CLICK HERE: To Order Directly on Amazon
                            </a>
                        </p>
                    </div>
                `;
                console.log(`Exact match found for Window ${i} in Feet:`, exactMatchFeet);
                continue;
            }

            // Convert inches to cm for closest match
            normalizedHeight = height * 2.54;
            normalizedWidth = width * 2.54;
            normalizedUnit = 'Cm';
        }

        console.log(
            `Window ${i}: Normalized Input - Height: ${normalizedHeight} ${normalizedUnit}, Width: ${normalizedWidth} ${normalizedUnit}, Color: ${color}`
        );

        // Exact Match Logic
        const exactMatch = sizeData.find((size) => {
            return (
                size['Unit'] === normalizedUnit &&
                ((size['Height(H)'] === normalizedHeight && size['Width(W)'] === normalizedWidth) ||
                    (size['Height(H)'] === normalizedWidth && size['Width(W)'] === normalizedHeight)) &&
                size['Color'].toUpperCase() === color
            );
        });

        if (exactMatch) {
            messageArea.innerHTML += `
                <div class="message success">
                    <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
                    <h4>CONGRATULATIONS! <br>YOUR EXACT SIZE IS AVAILABLE ✅</h4>
                    <p>Size (HxW): <strong>${height} x ${width} ${unit}</strong></p>
                    <p>Color: <strong>${getColorName(color)}</strong></p>
                    <p>
                        <a href="${exactMatch['Amazon Link']}" target="_blank" style="color: green; font-weight: bold;">
                            CLICK HERE: To Order Directly on Amazon
                        </a>
                    </p>
                </div>
            `;
            console.log(`Exact match found for Window ${i}:`, exactMatch);
            continue;
        }

        // Closest Match Logic
        let closestMatch = null;
        let smallestDifference = Infinity;

        sizeData.forEach((size) => {
            if (size['Unit'] !== 'Cm' || size['Color'].toUpperCase() !== color) return;

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
                    <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
                    <h4>CLOSEST MATCH FOUND</h4>
                    <p>Custom Size Needed (HxW): <strong>${height} x ${width} ${unit}</strong></p>
                    <p>Custom Size Needed in Cm (HxW): 
                        <strong>${normalizedHeight.toFixed(1)} x ${normalizedWidth.toFixed(1)} Cm</strong>
                    </p>
                    <p>
                        <strong>Size To Order on Amazon (HxW):</strong> 
                        <a href="${closestMatch['Amazon Link']}" target="_blank" style="color: blue; font-weight: bold;">
                            CLICK HERE: ${closestMatch['Size(HxW)']}
                        </a>
                    </p>
                    <p>Color: <strong>${getColorName(color)}</strong></p>
                </div>
            `;
            console.log(`Closest match found for Window ${i}:`, closestMatch);
        } else {
            messageArea.innerHTML += `
                <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
                <p class="error">No suitable match found for Window ${i}. Please check your inputs.</p>
            `;
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
