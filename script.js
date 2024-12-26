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

// Function to generate a WhatsApp link with customization details
function generateWhatsAppLink(customizationDetails) {
    if (customizationDetails.length === 0) return; // No details, no link

    const message = encodeURIComponent(
        `Hello Team ARMORX,\n\nPlease make note of my customization:\n\n${customizationDetails.join('\n\n')}\n\nThank you.`
    );

    const whatsappLink = `https://wa.me/917304692553?text=${message}`;

    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML += `
        <div class="whatsapp-link">
            <p style="margin-top: 20px;">
                <a href="${whatsappLink}" target="_blank" style="color: green; font-weight: bold; font-size: 18px;">
                    SEND CUSTOMIZATION REQUEST VIA WHATSAPP
                </a>
            </p>
        </div>
    `;
}

// Calculate sizes and find matches
function calculateSizes() {
    const unit = document.getElementById('unit').value; // User-selected unit
    const numWindows = parseInt(document.getElementById('numWindows').value);
    const messageArea = document.getElementById('messageArea'); // Static message area

    let customizationDetails = []; // Array to hold details for WhatsApp message

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

        if (unit === 'Inch') {
            normalizedHeight = height * 2.54;
            normalizedWidth = width * 2.54;
            normalizedUnit = 'Cm';
        } else if (unit === 'Feet') {
            normalizedHeight = height * 30.48;
            normalizedWidth = width * 30.48;
            normalizedUnit = 'Cm';
        }

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
            let convertedSize = "";
            if (unit === 'Inch' || unit === 'Feet') {
                convertedSize = `- Converted Size: ${normalizedHeight.toFixed(1)} x ${normalizedWidth.toFixed(1)} cm`;
            }

            // Add details for WhatsApp message
            customizationDetails.push(
                `Window ${i}:\n- Custom Size: ${height} x ${width} ${unit}\n${convertedSize}\n- Closest Size: ${closestMatch['Size(HxW)']} cm\n- Link: ${closestMatch['Amazon Link']}\n- Color: ${getColorName(color)}`
            );

            messageArea.innerHTML += `
                <div class="message info">
                    <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
                    <h4>CLOSEST MATCH FOUND</h4>
                    <p style="margin-bottom: 10px; font-weight: bold; color: green; font-size: 16px;">
                        <span style="font-size: 18px;">Customize it for FREE</span> to match your size: Follow below Steps:
                    </p>
                    <p>Custom Size Needed (HxW): <strong>${height} x ${width} ${unit}</strong></p>
                    ${
                        convertedSize
                            ? `<p>Custom Size Needed in Cm (HxW): <strong>${normalizedHeight.toFixed(
                                  1
                              )} x ${normalizedWidth.toFixed(1)} Cm</strong></p>`
                            : ""
                    }
                    <p>
                        <strong>Size To Order on Amazon (HxW):</strong> 
                        <a href="${closestMatch['Amazon Link']}" target="_blank" style="color: blue; font-weight: bold;">
                            CLICK HERE: ${closestMatch['Size(HxW)']}
                        </a>
                    </p>
                    <p>Color: <strong>${getColorName(color)}</strong></p>
                    <p style="margin-top: 10px;"><strong>NEXT STEPS:</strong> After placing the order 
                        <a href="https://wa.me/917304692553?text=Hello%20Team%20ARMORX,%20I%20have%20placed%20my%20order,%20please%20process%20customization%20request." target="_blank" style="color: green; font-weight: bold;">
                            <img src="https://i.postimg.cc/mk19S9bF/whatsapp.png" alt="WhatsApp" style="width: 16px; height: 16px; vertical-align: middle;">
                            CLICK HERE
                        </a> to send customization request to +91-73046 92553.
                    </p>
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

    // Call the WhatsApp link generator
    generateWhatsAppLink(customizationDetails);
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

// Helper function to round to nearest 0.5 (For Display Only)
function roundToNearestHalf(value) {
    return Math.round(value * 2) / 2; // Rounds to the nearest 0.5
}

