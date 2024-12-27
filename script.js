// Load the size data from the JSON file
let sizeData;

// Fetch the JSON data and prevent caching issues
fetch('MQ_Sizes_Unit_Color_and_Links.json?v=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        sizeData = data;
        console.log('Size data loaded successfully:', sizeData);
    })
    .catch(error => console.error('Error loading size data:', error));

// Helper: Normalize sizes to cm
function normalizeSizes(height, width, unit) {
    if (unit === 'Inch') {
        return [height * 2.54, width * 2.54]; // Inches to cm
    } else if (unit === 'Feet') {
        return [height * 30.48, width * 30.48]; // Feet to cm
    }
    return [height, width]; // Already in cm
}

// Helper: Find exact match
function findExactMatch(normalizedHeight, normalizedWidth, color, unit) {
    return sizeData.find(size => {
        return (
            size['Unit'] === unit &&
            ((size['Height(H)'] === normalizedHeight && size['Width(W)'] === normalizedWidth) ||
                (size['Height(H)'] === normalizedWidth && size['Width(W)'] === normalizedHeight)) &&
            size['Color'].toUpperCase() === color
        );
    });
}

// Helper: Find closest match
function findClosestMatch(normalizedHeight, normalizedWidth, color) {
    let closestMatch = null;
    let smallestDifference = Infinity;

    sizeData.forEach(size => {
        if (size['Unit'] !== 'Cm' || size['Color'].toUpperCase() !== color) return;

        const diff1 = Math.abs(size['Height(H)'] - normalizedHeight) + Math.abs(size['Width(W)'] - normalizedWidth);
        const diff2 = Math.abs(size['Height(H)'] - normalizedWidth) + Math.abs(size['Width(W)'] - normalizedHeight);

        const difference = Math.min(diff1, diff2);

        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestMatch = size;
        }
    });

    return closestMatch;
}

// Helper: Format results for exact match
function formatExactMatch(i, match, originalHeight, originalWidth, unit, color) {
    return `
        <div class="message success">
            <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
            <h4>CONGRATULATIONS! YOUR EXACT SIZE IS AVAILABLE ✅</h4>
            <p>Original Size (HxW): <strong>${originalHeight} x ${originalWidth} ${unit}</strong></p>
            <p>Size (HxW): <strong>${match['Height(H)']} x ${match['Width(W)']} ${match['Unit']}</strong></p>
            <p>Color: <strong>${color}</strong></p>
            <p>
                <a href="${match['Amazon Link']}" target="_blank" style="color: green; font-weight: bold;">
                    CLICK HERE: To Order Directly on Amazon
                </a>
            </p>
        </div>
    `;
}

// Helper: Format results for closest match
function formatClosestMatch(i, closestMatch, originalHeight, originalWidth, normalizedHeight, normalizedWidth, unit, color) {
    return `
        <div class="message info">
            <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
            <h4>CLOSEST MATCH FOUND: FREE Customization Available</h4>
            <p>Custom Size Needed (HxW): <strong>${originalHeight} x ${originalWidth} ${unit}</strong></p>
            ${
                unit === 'Inch' || unit === 'Feet'
                    ? `<p>Converted Size Needed in Cm (HxW): <strong>${roundToNearestHalf(normalizedHeight)} x ${roundToNearestHalf(normalizedWidth)} Cm</strong></p>`
                    : ''
            }
            <p>Closest Size (HxW): <strong>${closestMatch['Size(HxW)']} Cm</strong></p>
            <p>Color: <strong>${color}</strong></p>
            <p>
                <a href="${closestMatch['Amazon Link']}" target="_blank" style="color: blue; font-weight: bold;">
                    CLICK HERE: To Order Closest Size on Amazon
                </a>
            </p>
            <p style="margin-top: 20px;">
                <strong>*NEXT STEPS:*</strong> Please use the below 
                <img src="https://i.postimg.cc/mk19S9bF/whatsapp.png" alt="WhatsApp" style="width: 16px; height: 16px; vertical-align: middle;">
                WhatsApp button to send your order & customization request to Team ArmorX. We will customize the net to your exact size for FREE.
            </p>
        </div>
    `;
}

// Helper: Generate WhatsApp link
function generateWhatsAppLink(orderDetails) {
    if (orderDetails.length === 0) return;

    const message = encodeURIComponent(`Hello Team ARMORX,\n\nPlease make note of my order:\n\n${orderDetails.join('\n\n')}\n\nThank you.`);
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

// Dynamic inputs generation
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
    }
});

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
            messageArea.innerHTML += `<p class="error">Invalid dimensions for Window ${i}.</p>`;
            continue;
        }

        const [normalizedHeight, normalizedWidth] = normalizeSizes(height, width, unit);

        const exactMatch = findExactMatch(normalizedHeight, normalizedWidth, color, unit === 'Inch' ? 'Feet' : unit);
        if (exactMatch) {
            orderDetails.push(`Window ${i}: Exact Match Found: No Customization Needed.\n- Size: ${height} x ${width} ${unit}\n- Color: ${color}\n- Link: ${exactMatch['Amazon Link']}`);
            messageArea.innerHTML += formatExactMatch(i, exactMatch, height, width, unit, color);
            continue;
        }

        const closestMatch = findClosestMatch(normalizedHeight, normalizedWidth, color);
        if (closestMatch) {
            orderDetails.push(`Window ${i}: Closest Match Found: Customization Needed.\n- Custom Size: ${height} x ${width} ${unit}\n- Converted Size: ${roundToNearestHalf(normalizedHeight)} x ${roundToNearestHalf(normalizedWidth)} cm\n- Closest Size: ${closestMatch['Size(HxW)']} cm\n- Color: ${color}\n- Link: ${closestMatch['Amazon Link']}`);
            messageArea.innerHTML += formatClosestMatch(i, closestMatch, height, width, normalizedHeight, normalizedWidth, unit, color);
        } else {
            messageArea.innerHTML += `<p class="error">No suitable match found for Window ${i}.</p>`;
        }
    }

    generateWhatsAppLink(orderDetails);
}
