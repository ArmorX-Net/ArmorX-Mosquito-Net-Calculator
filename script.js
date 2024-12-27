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

// Helper: Normalize sizes based on input unit
function normalizeSizes(height, width, unit) {
    if (unit === 'Inch') return [height * 2.54, width * 2.54]; // Inches to cm
    if (unit === 'Feet') return [height * 30.48, width * 30.48]; // Feet to cm
    return [height, width]; // Already in cm
}

// Helper: Get full color name
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

// Helper: Find exact match
function findExactMatch(height, width, color, unit) {
    let normalizedHeight, normalizedWidth;

    if (unit === 'Feet') {
        normalizedHeight = height; // Already in feet
        normalizedWidth = width;

        // Check for exact match in Feet
        const exactMatchFeet = sizeData.find(size =>
            size['Unit'] === 'Feet' &&
            ((size['Height(H)'] === normalizedHeight && size['Width(W)'] === normalizedWidth) ||
                (size['Height(H)'] === normalizedWidth && size['Width(W)'] === normalizedHeight)) &&
            size['Color'].toUpperCase() === color
        );

        if (exactMatchFeet) {
            return {
                match: exactMatchFeet,
                note: null,
            };
        }
    }

    if (unit === 'Inch') {
        const heightFeet = height / 12;
        const widthFeet = width / 12;

        // Check for exact match in Feet for Inches input
        const exactMatchFeet = sizeData.find(size =>
            size['Unit'] === 'Feet' &&
            ((size['Height(H)'] === heightFeet && size['Width(W)'] === widthFeet) ||
                (size['Height(H)'] === widthFeet && size['Width(W)'] === heightFeet)) &&
            size['Color'].toUpperCase() === color
        );

        if (exactMatchFeet) {
            return {
                match: exactMatchFeet,
                note: `(Original: ${height} x ${width} Inches, 12 Inches = 1 Foot)`,
            };
        }
    }

    // Convert to cm and check for exact match
    const [heightCm, widthCm] = normalizeSizes(height, width, unit);
    const exactMatchCm = sizeData.find(size =>
        size['Unit'] === 'Cm' &&
        ((size['Height(H)'] === heightCm && size['Width(W)'] === widthCm) ||
            (size['Height(H)'] === widthCm && size['Width(W)'] === heightCm)) &&
        size['Color'].toUpperCase() === color
    );

    return exactMatchCm ? { match: exactMatchCm, note: null } : null;
}

// Helper: Find closest match in cm
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

// Helper: Format results for exact match
function formatExactMatch(i, match, originalHeight, originalWidth, unit, color) {
    const originalSize =
        unit === 'Inch'
            ? `${originalHeight} x ${originalWidth} Inches (12 Inches = 1 Foot)`
            : `${originalHeight} x ${originalWidth} ${unit}`;
    return `
        <div class="message success">
            <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
            <h4>CONGRATULATIONS! YOUR EXACT SIZE IS AVAILABLE ✅</h4>
            <p>Original Size (HxW): <strong>${originalSize}</strong></p>
            <p>Size To Order (HxW): <strong>${match['Height(H)']} x ${match['Width(W)']} ${match['Unit']}</strong></p>
            <p>Color: <strong>${getColorName(color)}</strong></p>
            <p>
                <a href="${match['Amazon Link']}" target="_blank" style="color: green; font-weight: bold;">
                    CLICK HERE: To Order Directly on Amazon
                </a>
            </p>
        </div>
    `;
}

// Helper: Format results for closest match
function formatClosestMatch(i, closestMatch, originalHeight, originalWidth, convertedSize, unit, color) {
    return `
        <div class="message info">
            <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
            <h4>CLOSEST MATCH FOUND: FREE Customization Available</h4>
            <p>Custom Size Needed (HxW): <strong>${originalHeight} x ${originalWidth} ${unit}</strong></p>
            ${
                convertedSize
                    ? `<p>Custom Size Needed in Cm: <strong>${convertedSize}</strong></p>`
                    : ''
            }
            <p>Closest Size To Order (HxW): <strong>${closestMatch['Height(H)']} x ${closestMatch['Width(W)']} Cm</strong></p>
            <p>Color: <strong>${getColorName(color)}</strong></p>
            <p>
                <a href="${closestMatch['Amazon Link']}" target="_blank" style="color: blue; font-weight: bold;">
                    CLICK HERE: To Order Closest Size on Amazon
                </a>
            </p>
        </div>
    `;
}

// Generate a WhatsApp link with customization details
function generateWhatsAppLink(orderDetails) {
    if (orderDetails.length === 0) return;

    const message = encodeURIComponent(
        `Hello Team ARMORX,\n\nPlease make note of my order:\n\n${orderDetails.join('\n\n')}\n\nThank you.`
    );
    const whatsappLink = `https://wa.me/917304692553?text=${message}`;

    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML += `
        <div style="text-align: center; margin-top: 20px;">
            <a href="${whatsappLink}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: green; color: white; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">
                WHATSAPP YOUR ORDER & CUSTOMIZATION DETAILS TO TEAM ARMORX
            </a>
        </div>
    `;
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
            orderDetails.push(`Window ${i}: Exact Match Found: No Customization Needed\n- Size: ${match['Size(HxW)']} ${match['Unit']}\n- Color: ${getColorName(color)}\n- Link: ${match['Amazon Link']}\n${note}`);
            messageArea.innerHTML += formatExactMatch(i, match, height, width, unit, color);
            continue;
        }

        // Find closest match
        const closestMatch = findClosestMatch(height, width, color, unit);
        if (closestMatch) {
            const match = closestMatch.match;
            const convertedSize = closestMatch.convertedSize;
            orderDetails.push(`Window ${i}: Closest Match Found: Customization Needed\n- Custom Size Needed: ${height} x ${width} ${unit}\n- Custom Size in Cm: ${convertedSize}\n- Closest Size Ordered: ${match['Height(H)']} x ${match['Width(W)']} Cm\n- Color: ${getColorName(color)}\n- Link: ${match['Amazon Link']}`);
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
