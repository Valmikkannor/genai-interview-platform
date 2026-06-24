const { Router } = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authmiddleware");
const authRouter = Router();
/**
 * @route Post api/auth/register
 * @description register new user
 * @access public
 */
authRouter.post("/register", authController.registerUserController)

/**
 * @route Post api/auth/login
 * @description login user with email and password 
 * @access public
 */
authRouter.post("/login", authController.loginUserController)


/**
 * @route GET api/auth/logout
 * @description logout user
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)

/**
 * @route GET api/auth/get-me
 * @description get the current login user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)

module.exports = authRouter;