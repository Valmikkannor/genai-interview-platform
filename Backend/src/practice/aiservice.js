require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API,
});

const groq = new Groq({
    apiKey: process.env.GROQ_AI,
});

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `
Generate a detailed interview report.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    try {
        console.log("Using Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(
                    interviewReportSchema
                ),
            },
        });

        console.log(JSON.parse(response.text));
    } catch (error) {
        console.log("Gemini failed.");
        console.log(error.message);

        console.log("Switching to Groq...");

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

        console.log(JSON.parse(
            groqResponse.choices[0].message.content
        ));
    }
}

module.exports = generateInterviewReport;


// another one

require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API,
});

const groq = new Groq({
    apiKey: process.env.GROQ_AI,
});

const interviewReportSchema = z.object({
    matchScore: z.number(),

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
Generate a detailed interview report.

Return ONLY valid JSON.

The JSON structure must be:

{
  "matchScore": number,
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
      "severity": "low | medium | high"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": [""]
    }
  ],
  "title": ""
}

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    try {
        console.log("Using Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(interviewReportSchema),
            },
        });

        console.log("Gemini Success");

        const result = JSON.parse(response.text);

        // console.log(result);

        return result;

    } catch (error) {
        console.log("Gemini Failed");
        console.log(error.message);

        try {
            console.log("Switching To Groq...");

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

            console.log("Groq Success");
            // console.log(content);

            const result = JSON.parse(content);

            return result;

        } catch (groqError) {
            console.error("Groq Failed");
            console.error(groqError);

            throw groqError;
        }
    }
}

module.exports = generateInterviewReport;