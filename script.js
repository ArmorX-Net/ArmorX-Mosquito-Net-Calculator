// Load the size data
let sizeData;

fetch('MQ_Sizes_Unit_Color_and_Links.json')
    .then(response => response.json())
    .then(data => {
        sizeData = data;
    })
    .catch(error => console.error('Error loading size data:', error));

document.getElementById('numWindows').addEventListener('input', function () {
    const numWindows = parseInt(this.value);
    const windowInputsDiv = document.getElementById('windowInputs');
    windowInputsDiv.innerHTML = '';

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
});

function calculateSizes() {
    const unit = document.getElementById('unit').value;
    const numWindows = parseInt(document.getElementById('numWindows').value);
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!sizeData) {
        resultsDiv.innerHTML = 'Size data is not available. Please try again later.';
        return;
    }

    for (let i = 1; i <= numWindows; i++) {
        const height = parseFloat(document.getElementById(`height${i}`).value);
        const width = parseFloat(document.getElementById(`width${i}`).value);
        const color = document.getElementById(`color${i}`).value;

        if (!height || !width) {
            resultsDiv.innerHTML += `<p>Please enter valid dimensions for Window ${i}.</p>`;
            continue;
        }

        let normalizedHeight = height, normalizedWidth = width;
        if (unit === 'Inch') {
            normalizedHeight = height * 2.54;
            normalizedWidth = width * 2.54;
        } else if (unit === 'Feet') {
            normalizedHeight = height * 30.48;
            normalizedWidth = width * 30.48;
        }

        let closestMatch = null;
        let smallestDifference = Infinity;

        sizeData.forEach(size => {
            if (size.Unit !== 'Cm') return;

            const diff1 = Math.abs(size.Height - normalizedHeight) + Math.abs(size.Width - normalizedWidth);
            const diff2 = Math.abs(size.Height - normalizedWidth) + Math.abs(size.Width - normalizedHeight);

            const difference = Math.min(diff1, diff2);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestMatch = size;
            }
        });

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