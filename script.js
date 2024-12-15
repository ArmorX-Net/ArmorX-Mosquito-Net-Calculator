// Load the size data from the JSON file
let sizeData;

fetch('MQ_Sizes_Unit_Color_and_Links.json')
    .then(response => response.json())
    .then(data => {
        sizeData = data;
        console.log('Size data loaded successfully:', sizeData); // Debug: Verify JSON is loaded
    })
    .catch(error => console.error('Error loading size data:', error));

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
        const color = document.getElementById(`color${i}`).value;

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

        console.log(`Normalized Height: ${normalizedHeight}, Normalized Width: ${normalizedWidth}`); // Debug: Check normalization

        // Check for exact matches in the JSON data
        const exactMatch = sizeData.find(size => {
            return (
                size.Unit === 'Cm' &&
                ((size.Height === normalizedHeight && size.Width === normalizedWidth) ||
                    (size.Height === normalizedWidth && size.Width === normalizedHeight)) &&
                size.Color === color
            );
        });

        // Display exact match result
        if (exactMatch) {
            resultsDiv.innerHTML += `
                <h3>Exact Match for Window ${i}</h3>
                <p>Size: ${exactMatch.Size} (${exactMatch.Unit})</p>
                <p>Color: ${color}</p>
                <p><a href="${exactMatch.Amazon_Link}" target="_blank">Buy Now on Amazon</a></p>
            `;
        } else {
            resultsDiv.innerHTML += `<p>No exact match found for Window ${i}.</p>`;
        }
    }
}
