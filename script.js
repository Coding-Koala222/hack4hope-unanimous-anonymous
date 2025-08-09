// use the `papaparse` library to read a CSV file in a JavaScript environment
import { parse } from 'papaparse';

const filePath = 'diseases.csv'; // Path to your CSV file

async function readCSVFile(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const results = parse(text, {
            header: true,
            skipEmptyLines: true,
        });
        return results.data;
    } catch (error) {
        console.error("Could not read JSON file:", error);
    }
}

const diseases = await readCSVFile(filePath);
const cancer_dropdown = document.getElementById('cancer-dropdown');
for (const disease of diseases) {
    const names = disease['names'].split(',').map(name => name.trim());
    const codes = disease['codes'];
    // for each name, create an option in the dropdown with codes as the value
    for (const name of names) {
        const option = document.createElement('option');
        option.value = codes;
        option.textContent = name;
        cancer_dropdown.appendChild(option);
    }
}

const viewButton = document.getElementById('view-trials');

viewButton.onclick = async function() {
    const selectedOption = cancer_dropdown.options[cancer_dropdown.selectedIndex];
    const selectedCode = selectedOption.value;
    // create an array of ids from the selected code
    const codes = selectedCode.split(',').map(code => code.trim());
    console.log("Selected codes:", codes);
    const args = {
        ids: codes
    }
    const trialsContainer = document.getElementById('trials-container');
    trialsContainer.innerHTML = "Loading...";
    const response = await fetch(`/api/fetch_trials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(args)
    });
    if (!response.ok) {
        console.error("Error fetching trials:", response.status, await response.text());
        return;
    }
    const trials = await response.json();

    if (trials.length === 0) {
        trialsContainer.innerHTML = "<p>No trials found for the selected disease.</p>";
        return;
    }
    trialsContainer.innerHTML = "";
    for (const trial of trials) {
        const trialDiv = `
        <div class="trial">
            <h3>${trial.title} | ${trial.lead_org}</h3>
            <p><strong>Summary:</strong> ${trial.summary}</p>
            <p><strong>Expected Completion Date:</strong> ${trial.expected_completion_date}</p>
        </div>
        `;
        trialsContainer.innerHTML += trialDiv;
    }
}