const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    // "http://localhost:5173",
    "https://genai-interview-platform-1ebl.vercel.app",
];

app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

//require all the routes here
const authRouter = require("../src/routes/authRoute");
const interviewRouter = require("../src/routes/interview.routes");

//using all the routes here
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app