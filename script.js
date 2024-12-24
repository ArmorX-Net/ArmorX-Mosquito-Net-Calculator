// Load the size data from the JSON file
let sizeData;

fetch('MQ_Sizes_Unit_Color_and_Links.json')
    .then(response => response.json())
    .then(data => {
        sizeData = data;
        console.log('Size data loaded successfully:', sizeData); // Debug: Verify JSON is loaded
    })
    .catch(error => console.error('Error loading size data:', error));

// Generate dynamic inputs when the user enters the number of windows
document.getElementById('numWindows').addEventListener('input', function () {
    const numWindows = parseInt(this.value);
    const windowInputsDiv = document.getElementById('windowInputs');
    windowInputsDiv.innerHTML = ''; // Clear any previous inputs

    if (numWindows > 0) {
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
    }
});

// Function to calculate sizes and find matches
function calculateSizes() {
    const unit = document.getElementById('unit').value;
    const numWindows = parseInt(document.getElementById('numWindows').value);
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (!sizeData) {
        resultsDiv.innerHTML = 'Size data is not available. Please try again later.';
        return;
    }

    for (let i = 1; i <= numWindows; i++) {
        const height = parseFloat(document.getElementById(`height${i}`).value);
        const width = parseFloat(document.getElementById(`width${i}`).value);
        const color = document.getElementById(`color${i}`).value.toUpperCase(); // Normalize color to uppercase

        if (!height || !width || height <= 0 || width <= 0) {
            resultsDiv.innerHTML += `<p>Please enter valid dimensions for Window ${i}.</p>`;
            continue;
        }

        // Normalize dimensions to cm
        let normalizedHeight = height, normalizedWidth = width;
        if (unit === 'Inch') {
            normalizedHeight = height * 2.54;
            normalizedWidth = width * 2.54;
        } else if (unit === 'Feet') {
            normalizedHeight = height * 30.48;
            normalizedWidth = width * 30.48;
        }

        console.log(`Window ${i}: Normalized Height = ${normalizedHeight}, Normalized Width = ${normalizedWidth}, Color = ${color}`);

        // Check for exact matches in the JSON data
        const exactMatch = sizeData.find(size => {
            return (
                size.Unit === 'Cm' &&
                ((size.Height === normalizedHeight && size.Width === normalizedWidth) ||
                    (size.Height === normalizedWidth && size.Width === normalizedHeight)) &&
                size.Color.toUpperCase() === color
            );
        });

        // Display exact match result
        if (exactMatch) {
            resultsDiv.innerHTML += `
                <h3>Exact Match for Window ${i}</h3>
                <p>Size of Window Frame: ${exactMatch.Size} (${exactMatch.Unit})</p>
                <p>Color: ${color === 'BK' ? 'Black' : color === 'GR' ? 'Grey' : color === 'CR' ? 'Cream' : 'White'}</p>
                <p><a href="${exactMatch.Amazon_Link}" target="_blank">Click Here for Amazon Product Link</a></p>
            `;
        } else {
            resultsDiv.innerHTML += `<p>No exact match found for Window ${i}.</p>`;
        }
    }
}
