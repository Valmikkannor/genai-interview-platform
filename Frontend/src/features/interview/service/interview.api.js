import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

/**
 * Generate interview report
 */
export const generateInterviewReport = async({
    jobDescription,
    selfDescription,
    resumeFile,
}) => {
    const formData = new FormData();

    formData.append("jobDescription", jobDescription);

    if (selfDescription) {
        formData.append("selfDescription", selfDescription);
    }

    if (resumeFile) {
        formData.append("resume", resumeFile);
    }

    for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
    }

    const response = await api.post(
        "/api/interview",
        formData
    );

    return response.data;
};

/**
 * Get interview report by id
 */
export const getInterviewReportById = async(interviewId) => {
    const response = await api.get(
        `/api/interview/report/${interviewId}`
    );

    return response.data;
};

/**
 * Get all reports
 */
export const getAllInterviewReports = async() => {
    const response = await api.get("/api/interview");

    return response.data;
};

/**
 * Download resume pdf
 */
export const generateResumePdf = async({
    interviewReportId,
}) => {
    const response = await api.post(
        `/api/interview/resume/pdf/${interviewReportId}`,
        null, {
            responseType: "blob",
        }
    );

    return response.data;
};

export default api;