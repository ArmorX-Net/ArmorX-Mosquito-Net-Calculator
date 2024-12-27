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
            <p>Converted Size Needed in Cm (HxW): <strong>${roundToNearestHalf(normalizedHeight)} x ${roundToNearestHalf(normalizedWidth)} Cm</strong></p>
            <p>Closest Size (HxW): <strong>${closestMatch['Size(HxW)']} Cm</strong></p>
            <p>Color: <strong>${color}</strong></p>
            <p>
                <a href="${closestMatch['Amazon Link']}" target="_blank" style="color: blue; font-weight: bold;">
                    CLICK HERE: To Order Closest Size on Amazon
                </a>
            </p>
        </div>
    `;
}

// Calculate sizes and find matches
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

        // Check for exact match
        const exactMatch = findExactMatch(normalizedHeight, normalizedWidth, color, unit === 'Inch' ? 'Feet' : unit);

        if (exactMatch) {
            messageArea.innerHTML += formatExactMatch(i, exactMatch, height, width, unit, color);
            continue;
        }

        // Find closest match
        const closestMatch = findClosestMatch(normalizedHeight, normalizedWidth, color);
        if (closestMatch) {
            messageArea.innerHTML += formatClosestMatch(i, closestMatch, height, width, normalizedHeight, normalizedWidth, unit, color);
        } else {
            messageArea.innerHTML += `<p class="error">No suitable match found for Window ${i}.</p>`;
        }
    }
}
