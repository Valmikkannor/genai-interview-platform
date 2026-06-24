const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API,
});

const groq = new Groq({
    apiKey: process.env.GROQ_AI,
});

const interviewReportSchema = z.object({
    matchScore: z.number().min(0)
        .max(100)
        .describe("Match score as a percentage between 0 and 100"),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"]),
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string()),
        })
    ),

    title: z.string(),
});

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `
Generate a detailed interview preparation report.

Return ONLY valid JSON.

Required JSON Structure:

{
 matchScore must be an integer between 0 and 100.

Examples:
Excellent match -> 90
Good match -> 80
Average match -> 60
Poor match -> 20

DO NOT return decimals like 0.8 or 0.65.,
  "technicalQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behavioralQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGaps": [
    {
      "skill": "",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": ["task1", "task2"]
    }
  ],
  "title": ""
}

Rules:
- Generate exactly 5 technical questions.
- Generate exactly 5 behavioral questions.
- Generate at least 3 skill gaps.
- Generate a 7-day preparation plan.
- title is mandatory.
- Do not return markdown.
- Do not return explanations.
- Return only JSON.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    // =====================
    // GROQ FIRST
    // =====================
    try {
        console.log("Using Groq...");

        const groqResponse =
            await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{
                    role: "user",
                    content: prompt,
                }, ],
                response_format: {
                    type: "json_object",
                },
            });

        const content =
            groqResponse.choices[0].message.content;

        const result = JSON.parse(content);

        // Validate with Zod
        const validated =
            interviewReportSchema.parse(result);

        console.log("Groq Success");

        return validated;
    } catch (groqError) {
        console.log("Groq Failed");
        console.log(groqError.message);

        // =====================
        // GEMINI FALLBACK
        // =====================
        try {
            console.log("Switching to Gemini...");

            const response =
                await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: zodToJsonSchema(
                            interviewReportSchema
                        ),
                    },
                });

            const result = JSON.parse(response.text);

            const validated =
                interviewReportSchema.parse(result);

            console.log("Gemini Success");

            return validated;
        } catch (geminiError) {
            console.log("Gemini Failed");
            console.log(geminiError.message);

            throw new Error(
                "Both Groq and Gemini failed."
            );
        }
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}


module.exports = { generateInterviewReport, generateResumePdf };