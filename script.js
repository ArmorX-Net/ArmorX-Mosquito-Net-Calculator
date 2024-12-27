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

// Generate dynamic inputs based on the number of windows
document.getElementById('numWindows').addEventListener('input', function () {
    const numWindows = parseInt(this.value);
    const windowInputsDiv = document.getElementById('windowInputs');
    const selectedUnit = document.getElementById('unit').value;
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
        windowInputsDiv.style.display = 'block';
    } else {
        windowInputsDiv.style.display = 'none';
    }
});

// Update placeholders when the unit is changed
function updatePlaceholders() {
    const selectedUnit = document.getElementById('unit').value;
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

// Helper function to round to nearest 0.5 (For Display Only)
function roundToNearestHalf(value) {
    return Math.round(value * 2) / 2;
}

// Generate a WhatsApp link with customization details and exact matches
function generateWhatsAppLink(orderDetails) {
    if (orderDetails.length === 0) return;

    const message = encodeURIComponent(
        `Hello Team ARMORX,\n\nPlease make note of my order:\n\n${orderDetails.join('\n\n')}\n\nThank you.`
    );

    const whatsappLink = `https://wa.me/917304692553?text=${message}`;

    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML += `
        <div class="whatsapp-button">
            <a href="${whatsappLink}" target="_blank" style="text-decoration: none;">
                <div style="display: flex; align-items: center; justify-content: center; background-color: #25D366; color: white; padding: 10px; border-radius: 5px; font-size: 18px; font-weight: bold;">
                    WHATSAPP YOUR ORDER & CUSTOMIZATION DETAILS TO TEAM ARMORX
                </div>
            </a>
        </div>
    `;
}

// Calculate sizes and find matches
function calculateSizes() {
    const unit = document.getElementById('unit').value;
    const numWindows = parseInt(document.getElementById('numWindows').value);
    const messageArea = document.getElementById('messageArea');

    let orderDetails = [];

    messageArea.innerHTML = '';

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
            const heightInFeet = height / 12;
            const widthInFeet = width / 12;

            const exactMatchFeet = sizeData.find((size) => {
                return (
                    size['Unit'] === 'Feet' &&
                    ((size['Height(H)'] === heightInFeet && size['Width(W)'] === widthInFeet) ||
                        (size['Height(H)'] === widthInFeet && size['Width(W)'] === heightInFeet)) &&
                    size['Color'].toUpperCase() === color
                );
            });

            if (exactMatchFeet) {
                orderDetails.push(
                    `Window ${i}: Exact Match Found: No Customization Needed.\n- Size: ${heightInFeet.toFixed(1)} x ${widthInFeet.toFixed(1)} Feet (${height} x ${width} Inches, 12in = 1ft)\n- Color: ${getColorName(
                        color
                    )}\n- Link: ${exactMatchFeet['Amazon Link']}`
                );

                messageArea.innerHTML += `
                    <div class="message success">
                        <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
                        <h4>CONGRATULATIONS! <br>YOUR EXACT SIZE IS AVAILABLE ✅</h4>
                        <p>Size (HxW): <strong>${heightInFeet.toFixed(1)} x ${widthInFeet.toFixed(
                            1
                        )} Feet</strong> (${height} x ${width} Inches, 12in = 1ft)</p>
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

            normalizedHeight = height * 2.54;
            normalizedWidth = width * 2.54;
            normalizedUnit = 'Cm';
        }

        const exactMatch = sizeData.find((size) => {
            return (
                size['Unit'] === normalizedUnit &&
                ((size['Height(H)'] === normalizedHeight && size['Width(W)'] === normalizedWidth) ||
                    (size['Height(H)'] === normalizedWidth && size['Width(W)'] === normalizedHeight)) &&
                size['Color'].toUpperCase() === color
            );
        });

        if (exactMatch) {
            orderDetails.push(
                `Window ${i}: Exact Match Found: No Customization Needed.\n- Size: ${height} x ${width} ${unit}\n- Color: ${getColorName(
                    color
                )}\n- Link: ${exactMatch['Amazon Link']}`
            );

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
            let convertedSize = '';
            if (unit === 'Inch' || unit === 'Feet') {
                convertedSize = `- Converted Size: ${roundToNearestHalf(normalizedHeight)} x ${roundToNearestHalf(
                    normalizedWidth
                )} cm`;
            }

            orderDetails.push(
                `Window ${i}: Closest Match Found: Customization Needed.\n- Custom Size: ${height} x ${width} ${unit}\n${convertedSize}\n- Closest Size: ${closestMatch['Size(HxW)']} cm\n- Color: ${getColorName(
                    color
                )}\n- Link: ${closestMatch['Amazon Link']}`
            );

            messageArea.innerHTML += `
                <div class="message info">
                    <h3 style="font-weight: bold; color: black;">Window ${i}</h3>
                    <h4>CLOSEST MATCH FOUND: FREE Customization Available</h4>
                    <p>Custom Size Needed (HxW): <strong>${height} x ${width} ${unit}</strong></p>
                    ${
                        convertedSize
                            ? `<p>Custom Size Needed in Cm (HxW): <strong>${roundToNearestHalf(
                                  normalizedHeight
                              )} x ${roundToNearestHalf(normalizedWidth)} Cm</strong></p>`
                            : ''
                    }
                    <p>
                        <strong>Closest Size (HxW):</strong> ${closestMatch['Size(HxW)']}
                    </p>
                    <p>
                        <strong>Color:</strong> ${getColorName(color)}
                    </p>
                    <p>
                        <strong>Link:</strong> 
                        <a href="${closestMatch['Amazon Link']}" target="_blank" style="color: blue; font-weight: bold;">
                            CLICK HERE: To Order Closest Size on Amazon
                        </a>
                    </p>
                    <p style="margin-top: 10px;">
                        <strong>*NEXT STEPS:*</strong> Please use the below 
                        <img src="https://i.postimg.cc/mk19S9bF/whatsapp.png" alt="WhatsApp" style="width: 16px; height: 16px; vertical-align: middle;">
                        WhatsApp button to send your order & customization request to the Team ARMORX. We will customize the net to your exact size for FREE.
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
    generateWhatsAppLink(orderDetails);
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

