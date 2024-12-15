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

        // Step 1: Prioritize Exact Match
        const exactMatch = sizeData.find(size => {
            return (
                size.Unit === 'Cm' &&
                ((size.Height === normalizedHeight && size.Width === normalizedWidth) ||
                    (size.Height === normalizedWidth && size.Width === normalizedHeight)) &&
                size.Color === color
            );
        });

        if (exactMatch) {
            resultsDiv.innerHTML += `
                <h3>Exact Match for Window ${i}</h3>
                <p>Size: ${exactMatch.Size} (${exactMatch.Unit})</p>
                <p>Color: ${color}</p>
                <p><a href="${exactMatch.Amazon_Link}" target="_blank">Buy Now on Amazon</a></p>
            `;
            continue;
        }

        // Step 2: Find Closest Match
        let closestMatch = null;
        let smallestDifference = Infinity;

        sizeData.forEach(size => {
            if (size.Unit !== 'Cm' || size.Color !== color) return; // Skip non-matching units and colors

            // Calculate differences for both orientations
            const diff1 = Math.abs(size.Height - normalizedHeight) + Math.abs(size.Width - normalizedWidth);
            const diff2 = Math.abs(size.Height - normalizedWidth) + Math.abs(size.Width - normalizedHeight);

            const difference = Math.min(diff1, diff2);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestMatch = size;
            }
        });

        // Step 3: Display Results
        if (closestMatch) {
            resultsDiv.innerHTML += `
                <h3>Closest Match for Window ${i}</h3>
                <p>Size: ${closestMatch.Size} (${closestMatch.Unit})</p>
                <p>Color: ${color}</p>
                <p><a href="${closestMatch.Amazon_Link}" target="_blank">Buy Now on Amazon</a></p>
            `;
        } else {
            resultsDiv.innerHTML += `<p>No suitable match found for Window ${i}.</p>`;
        }
    }
}
