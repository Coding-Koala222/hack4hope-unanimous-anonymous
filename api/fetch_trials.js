import fetch from 'node-fetch';

const API_KEY = process.env.CANCER_API_KEY; // Replace with your real API key
const BASE_URL = "https://clinicaltrialsapi.cancer.gov/api/v2";

const headers = {
    "x-api-key": API_KEY,
};

export default async function fetch_trials(req, res) {
    try {
        const { ids } = req.body;
        const search_url = `${BASE_URL}/trials`;

        let processed_data = [];
        for (const id of ids) { // nci id of the disease
            const params = {
                "diseases.nci_thesaurus_concept_id": id
            };
            const response = await fetch(`${search_url}?${params}`, {
                method: 'GET',
                headers: headers
            });
            if (!response.ok) {
                console.error("Error:", response.status, await response.text());
                return res.status(500).json({ error: "Failed to fetch trials" });
            }

            let data = await response.json();
            data = data.data;
            for (const trial of data) {
                const lead_org =  trial.lead_org;
                const eligibility = trial.eligibility;
                let unstructured_trial_text = "";
                for (const criterion of eligibility.unstructured) {
                    unstructured_trial_text += criterion.display_order + ". " + criterion.description + "\n";
                }

                let structured_eligibility = eligibility.structured;
                let sites = trial.sites || [];
                let title = trial.brief_title || "No title available";
                let summary = trial.brief_summary || "No summary available";
                let expected_completion_date = trial.completion_date || "No date available";

                processed_data.push({
                    nct_id: trial.nct_id,
                    title: title,
                    lead_org: lead_org,
                    structured_eligibility: structured_eligibility,
                    unstructured_trial_text: unstructured_trial_text,
                    sites: sites,
                    summary: summary,
                    expected_completion_date: expected_completion_date
                });
            }
        }

        return res.status(200).json(processed_data);
    } catch (error) {
        console.error("An error occurred:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}