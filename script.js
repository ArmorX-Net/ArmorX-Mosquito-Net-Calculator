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
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (!sizeData) {
        resultsDiv.innerHTML = 'Size data is not available. Please try again later.';
        console.error('Size data is not loaded. Check JSON file.');
        return;
    }

    for (let i = 1; i <= numWindows; i++) {
        const height = parseFloat(document.getElementById(`height${i}`).value);
        const width = parseFloat(document.getElementById(`width${i}`).value);
        const color = document.getElementById(`color${i}`).value.toUpperCase();

        if (!height || !width || height <= 0 || width <= 0) {
            resultsDiv.innerHTML += `<p>Please enter valid dimensions for Window ${i}.</p>`;
            console.warn(`Invalid dimensions for Window ${i}.`);
            continue;
        }

        let normalizedHeight = height, normalizedWidth = width, normalizedUnit = unit;

        // Normalize dimensions based on user-selected unit
        if (unit === 'Inch') {
            normalizedHeight = height * 2.54;
            normalizedWidth = width * 2.54;
            normalizedUnit = 'Cm';
        } else if (unit === 'Feet') {
            normalizedHeight = height * 30.48;
            normalizedWidth = width * 30.48;
            normalizedUnit = 'Feet';
        }

        console.log(`User Input for Window ${i}: Height = ${normalizedHeight} ${normalizedUnit}, Width = ${normalizedWidth} ${normalizedUnit}, Color = ${color}`);

        // Find exact match based on dataset unit
        const exactMatch = sizeData.find(size => {
            return (
                size['Unit'] === normalizedUnit && // Match units
                ((size['Height(H)'] === normalizedHeight && size['Width(W)'] === normalizedWidth) ||
                 (size['Height(H)'] === normalizedWidth && size['Width(W)'] === normalizedHeight)) &&
                size['Color'].toUpperCase() === color
            );
        });

        if (exactMatch) {
            resultsDiv.innerHTML += `
                <h3>Exact Match for Window ${i}</h3>
                <p>Size: ${exactMatch['Size(HxW)']} (${exactMatch['Unit']})</p>
                <p>Color: ${color === 'BK' ? 'Black' : color === 'GR' ? 'Grey' : color === 'CR' ? 'Cream' : 'White'}</p>
                <p><a href="${exactMatch['Amazon Link']}" target="_blank">Click Here for Amazon Product Link</a></p>
            `;
            console.log(`Exact match found for Window ${i}:`, exactMatch);
            continue;
        }

        // Find closest match in cm
        let closestMatch = null;
        let smallestDifference = Infinity;

        sizeData.forEach(size => {
            if (size['Unit'] !== 'Cm') return; // Only compare in cm for closest match

            const diff1 = Math.abs(size['Height(H)'] - normalizedHeight) + Math.abs(size['Width(W)'] - normalizedWidth);
            const diff2 = Math.abs(size['Height(H)'] - normalizedWidth) + Math.abs(size['Width(W)'] - normalizedHeight);

            const difference = Math.min(diff1, diff2);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestMatch = size;
            }
        });

        if (closestMatch) {
            resultsDiv.innerHTML += `
                <h3>Closest Match for Window ${i}</h3>
                <p>Size: ${closestMatch['Size(HxW)']} (${closestMatch['Unit']})</p>
                <p>Color: ${color === 'BK' ? 'Black' : color === 'GR' ? 'Grey' : color === 'CR' ? 'Cream' : 'White'}</p>
                <p><a href="${closestMatch['Amazon Link']}" target="_blank">Click Here for Amazon Product Link</a></p>
            `;
            console.log(`Closest match found for Window ${i}:`, closestMatch);
        } else {
            resultsDiv.innerHTML += `<p>No suitable match found for Window ${i}.</p>`;
            console.warn(`No suitable match found for Window ${i}.`);
        }
    }
}
