// use the `papaparse` library to read a CSV file in a JavaScript environment
import {parse} from 'papaparse';

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

const backBtn = document.getElementById('back-button');
backBtn.onclick = function () {
    // hide the info page
    const infoPage = document.getElementById('info_page');
    infoPage.classList.add("hidden");
    // show the main page
    const mainPage = document.getElementById('start_page');
    mainPage.classList.remove("hidden");
}

function loadInfo(trial) {
    // hide the main page
    const mainPage = document.getElementById('start_page');
    mainPage.classList.add("hidden");
    const infoPage = document.getElementById('info_page');
    infoPage.classList.remove("hidden");

    const trialTitle = document.getElementById('trial-title');
    trialTitle.innerText = trial.title;
    const trialSummary = document.getElementById('trial-summary');
    trialSummary.innerText = trial.summary || "No summary available";
    const trialOrg = document.getElementById('trial-org');
    trialOrg.innerText = trial.lead_org || "No organization available";
}

const viewButton = document.getElementById('view-trials');

viewButton.onclick = async function () {
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
        console.log(trial)
        const trialDiv = document.createElement("div");
        trialDiv.className = "trial";

        let color = "";
        let date = "Unknown";
        let year = "Unknown";
        if (trial.expected_completion_date !== "No date available") {
            color = new Date(trial.expected_completion_date) < new Date() ? 'red' : 'green';
            date = trial.expected_completion_date;
            year = new Date(trial.expected_completion_date).getFullYear();
        } else {
            color = "yellow";
        }

        let structured_eligibility = trial.structured_eligibility || {};
        let minAge = structured_eligibility.min_age_in_years !== 999.0 ? structured_eligibility.min_age_in_years + " years minimum" : "No minimum age";
        let maxAge = structured_eligibility.max_age_in_years !== 999.0 ? structured_eligibility.max_age_in_years + " years maximum" : "No maximum age";
        let sex_badges = "";
        if (structured_eligibility.sex === 'MALE') {
            sex_badges += `
            <div class="badge blue" data-full-date="male">
                <i class="bi bi-gender-male"></i>
            </div>
            `;
        } else if (structured_eligibility.sex === 'FEMALE') {
            sex_badges += `
            <div class="badge pink">
                <i class="bi bi-gender-female" data-full-date="female"></i>
            </div>
            `;
        } else {
            sex_badges += `
            <div class="badge blue" data-full-date="male">
                <i class="bi bi-gender-male"></i>
            </div>
            `;
            sex_badges += `
            <div class="badge pink" data-full-date="female">
                <i class="bi bi-gender-female"></i>
            </div>
            `;
        }

        trialDiv.innerHTML = `
        <div class="trial-header">
            <div class="trial-text">
                <h3 class="title">${trial.title}</h3>
                <p class="lead-org">${trial.lead_org}</p>
            </div>
            <div class="badge ${color}" 
                 data-full-date="${date}">
                ${year}
            </div>
        </div>
        <div class="horizontal-container">
            <div class="badge cyan" data-full-date="minimum age">
                ${minAge}
            </div>
            <div class="badge cyan" data-full-date="maximum age">
                ${maxAge}
            </div>
            ${sex_badges}
        </div>
        <p class="summary">${trial.summary}</p>
    `;

        trialsContainer.appendChild(trialDiv);

        trialDiv.onclick = function () {
            loadInfo(trial);
        }
    }
}