const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const tokenBlacklistModel = require("../models/blacklistModel");

/**
 * @name registerUserController
 * @description register a new user with username, email and password
 * @access public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }
    const isUserAlreadyExist = await userModel.findOne({ $or: [{ username }, { email }] })
    if (isUserAlreadyExist) {
        return res.status(400).json({
            message: "User is already registered with username or email"
        })
    }
    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash
    });

    const token = jwt.sign({ id: user._id, username: user.username },
        process.env.JWT_SECRET, { expiresIn: "1D" }
    )

    // res.cookie("token", token)
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email

        }
    })
}


/**
 * @name loginUserController
 * @description login a new user with username, email and password
 * @access public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign({
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET, {
                expiresIn: "1d"
            }
        );

        // res.cookie("token", token, {
        //     httpOnly: true,
        //     maxAge: 24 * 60 * 60 * 1000
        // });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * @name logoutUserController
 * @description logout user with click the button
 * @accesspublic
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token");
    res.status(200).json({ message: " User logout successfully" })
}

/**
 * @name getMeController 
 * @description get the current login user details
 * @access private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: "User details fetch successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController }