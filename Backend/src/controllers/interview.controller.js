const pdfParse = require("pdf-parse");
const {
    generateInterviewReport,
    generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReportModel");



/**
 * Generate Interview Report
 */
async function generateInterViewReportController(req, res) {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        const { jobDescription, selfDescription } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required",
            });
        }

        if (!req.file &&
            (!selfDescription || !selfDescription.trim())
        ) {
            return res.status(400).json({
                message: "Please provide either a resume or self description",
            });
        }

        let resumeText = "";

        // Parse PDF if uploaded
        if (req.file) {
            try {
                const pdfData = await pdfParse(req.file.buffer);
                resumeText = pdfData.text;
            } catch (error) {
                console.error("PDF Parse Error:", error);

                return res.status(400).json({
                    message: "Unable to read the PDF. Please upload a valid PDF file.",
                });
            }
        }

        const interviewReportByAi =
            await generateInterviewReport({
                resume: resumeText,
                selfDescription: selfDescription || "",
                jobDescription,
            });

        const interviewReport =
            await interviewReportModel.create({
                user: req.user.id,
                resume: resumeText,
                selfDescription: selfDescription || "",
                jobDescription,
                ...interviewReportByAi,
                title: interviewReportByAi.title ||
                    "Interview Report",
            });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport,
        });
    } catch (error) {
        console.error(
            "generateInterViewReportController error:",
            error
        );

        return res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message,
        });
    }
}

/**
 * Get report by ID
 */
async function getInterviewReportByIdController(
    req,
    res
) {
    try {
        const { interviewId } = req.params;

        const interviewReport =
            await interviewReportModel.findOne({
                _id: interviewId,
                user: req.user.id,
            });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found.",
            });
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}

/**
 * Get all reports
 */
async function getAllInterviewReportsController(
    req,
    res
) {
    try {
        const interviewReports =
            await interviewReportModel.find({
                user: req.user.id,
            })
            .sort({ createdAt: -1 })
            .select(
                "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
            );

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}

/**
 * Generate Resume PDF
 */
async function generateResumePdfController(
    req,
    res
) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport =
            await interviewReportModel.findById(
                interviewReportId
            );

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found.",
            });
        }

        const {
            resume,
            jobDescription,
            selfDescription,
        } = interviewReport;

        const pdfBuffer =
            await generateResumePdf({
                resume,
                jobDescription,
                selfDescription,
            });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message,
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
};