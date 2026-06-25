const pdfParse = require("pdf-parse");
const {
    generateInterviewReport,
    generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReportModel");

async function generateInterViewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required",
            });
        }

        const { selfDescription, jobDescription } = req.body;

        if (!selfDescription || !jobDescription) {
            return res.status(400).json({
                message: "selfDescription and jobDescription are required",
            });
        }

        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({
                message: "Only PDF files are allowed",
            });
        }

        let resumeContent;

        try {
            resumeContent = await pdfParse(req.file.buffer);
        } catch (err) {
            console.error("PDF Parse Error:", err);

            return res.status(400).json({
                message: "Invalid or corrupted PDF file",
            });
        }
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi,
            title: interViewReportByAi.title || "Interview Report",
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

async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
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
}

async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({
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
}

async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params;

    const interviewReport =
        await interviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found.",
        });
    }

    const { resume, jobDescription, selfDescription } =
    interviewReport;

    const pdfBuffer = await generateResumePdf({
        resume,
        jobDescription,
        selfDescription,
    });

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    res.send(pdfBuffer);
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
};