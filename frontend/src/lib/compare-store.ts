import { signal } from "@preact/signals";
import type { JobSummary } from "../types";

export const selectedJobs = signal<JobSummary[]>([]);

export function toggleComparison(job: JobSummary) {
    const current = selectedJobs.value;
    const exists = current.find(j => j.id === job.id);
    
    if (exists) {
        selectedJobs.value = current.filter(j => j.id !== job.id);
    } else {
        if (current.length >= 4) {
            alert("You can compare up to 4 jobs at a time.");
            return;
        }
        selectedJobs.value = [...current, job];
    }
}

export function clearComparison() {
    selectedJobs.value = [];
}
