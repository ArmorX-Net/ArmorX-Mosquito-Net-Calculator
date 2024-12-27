// Load the size data from the JSON file
let sizeData;

// Fetch the JSON data and prevent caching issues
fetch('MQ_Sizes_Unit_Color_and_Links.json?v=' + new Date().getTime())
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        sizeData = data;
        console.log('Size data loaded successfully:', sizeData);
    })
    .catch(error => {
        document.getElementById('messageArea').innerHTML =
            '<p class="error">Failed to load size data. Please try again later.</p>';
        console.error('Error loading size data:', error);
    });

// Helper: Normalize sizes to Feet or Cm based on input unit
function normalizeSizes(height, width, unit) {
    if (unit === 'Inch') return [height * 2.54, width * 2.54]; // Inches to cm
    if (unit === 'Feet') return [height * 30.48, width * 30.48]; // Feet to cm
    return [height, width]; // Already in cm
}

// Helper: Check for exact match in Feet or Cm
function findExactMatch(height, width, color, unit) {
    const normalized = {
        Feet: [height / 30.48, width / 30.48],
        Cm: normalizeSizes(height, width, unit),
    };

    for (const targetUnit of ['Feet', 'Cm']) {
        const [normHeight, normWidth] = normalized[targetUnit];
        const match = sizeData.find(size =>
            size['Unit'] === targetUnit &&
            ((size['Height(H)'] === normHeight && size['Width(W)'] === normWidth) ||
                (size['Height(H)'] === normWidth && size['Width(W)'] === normHeight)) &&
            size['Color'].toUpperCase() === color
        );

        if (match) {
            return {
                match,
                note: targetUnit === 'Feet' && unit === 'Inch'
                    ? `(Original: ${height} x ${width} Inches, 12 Inches = 1 Foot)`
                    : null,
            };
        }
    }
    return null; // No exact match found
}

// Helper: Find closest match in Cm
function findClosestMatch(height, width, color, unit) {
    const [heightCm, widthCm] = normalizeSizes(height, width, unit);
    let closestMatch = null;
    let smallestDifference = Infinity;

    const filteredData = sizeData.filter(size => size['Unit'] === 'Cm' && size['Color'].toUpperCase() === color);

    filteredData.forEach(size => {
        const diff1 = Math.abs(size['Height(H)'] - heightCm) + Math.abs(size['Width(W)'] - widthCm);
        const diff2 = Math.abs(size['Height(H)'] - widthCm) + Math.abs(size['Width(W)'] - heightCm);

        const difference = Math.min(diff1, diff2);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestMatch = size;
        }
    });

    return closestMatch
        ? {
              match: closestMatch,
              convertedSize: `${roundToNearestHalf(heightCm)} x ${roundToNearestHalf(widthCm)} cm`,
          }
        : null;
}

// Helper: Round to nearest 0.5
function roundToNearestHalf(value) {
    return Math.round(value * 2) / 2;
}

// Main calculation logic
function calculateSizes() {
    const unit = document.getElementById('unit').value;
    const numWindows = parseInt(document.getElementById('numWindows').value);
    const messageArea = document.getElementById('messageArea');
    let orderDetails = [];

    messageArea.innerHTML = ''; // Clear previous messages

    for (let i = 1; i <= numWindows; i++) {
        const height = parseFloat(document.getElementById(`height${i}`).value);
        const width = parseFloat(document.getElementById(`width${i}`).value);
        const color = document.getElementById(`color${i}`).value.toUpperCase();

        if (!height || !width || height <= 0 || width <= 0) {
            messageArea.innerHTML += `<p class="error">Invalid dimensions for Window ${i}. Please enter valid values.</p>`;
            continue;
        }

        // Check for exact match
        const exactMatch = findExactMatch(height, width, color, unit);
        if (exactMatch) {
            const match = exactMatch.match;
            const note = exactMatch.note || '';
            orderDetails.push(`Window ${i}: Exact Match Found.\n- Size: ${match['Size(HxW)']} ${match['Unit']}\n- Color: ${color}\n- Link: ${match['Amazon Link']}\n${note}`);
            messageArea.innerHTML += formatExactMatch(i, match, height, width, unit, color);
            continue;
        }

        // Find closest match
        const closestMatch = findClosestMatch(height, width, color, unit);
        if (closestMatch) {
            const match = closestMatch.match;
            const convertedSize = closestMatch.convertedSize;
            orderDetails.push(`Window ${i}: Closest Match Found.\n- Custom Size: ${height} x ${width} ${unit}\n- Converted Size: ${convertedSize}\n- Closest Size: ${match['Height(H)']} x ${match['Width(W)']} Cm\n- Color: ${color}\n- Link: ${match['Amazon Link']}`);
            messageArea.innerHTML += formatClosestMatch(i, match, height, width, convertedSize, unit, color);
        } else {
            messageArea.innerHTML += `<p class="error">No suitable match found for Window ${i}.</p>`;
        }
    }

    generateWhatsAppLink(orderDetails);
}

// Dynamic input field generation for windows
document.getElementById('numWindows').addEventListener('input', function () {
    const numWindows = parseInt(this.value);
    const windowInputsDiv = document.getElementById('windowInputs');
    const selectedUnit = document.getElementById('unit').value;

    windowInputsDiv.innerHTML = '';
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
        windowInputsDiv.style.display = 'block';
    } else {
        windowInputsDiv.style.display = 'none';
    }
});

// Dynamic placeholder updates when the unit changes
document.getElementById('unit').addEventListener('change', function () {
    const selectedUnit = this.value;
    const numWindows = parseInt(document.getElementById('numWindows').value);
    for (let i = 1; i <= numWindows; i++) {
        const heightInput = document.getElementById(`height${i}`);
        const widthInput = document.getElementById(`width${i}`);
        if (heightInput) heightInput.placeholder = `Enter Height in ${selectedUnit}`;
        if (widthInput) widthInput.placeholder = `Enter Width in ${selectedUnit}`;
    }
});
