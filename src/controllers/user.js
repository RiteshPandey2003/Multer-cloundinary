import { User} from "../models/user.js"
import jwt from "jsonwebtoken"



const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating refresh and access tokens:", error);
        return { error: "Something went wrong while generating refresh and access tokens" };
    }
};


const registerUser = async (req, res) => {
    try {
        const { fullName, email, username, password } = req.body;

        if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existedUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existedUser) {
            return res.status(409).json({ error: "User with email or username already exists" });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            username: username.toLowerCase()
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            return res.status(500).json({ error: "Something went wrong while registering the user" });
        }

        return res.status(201).json({ message: "User registered successfully", user: createdUser });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ error: "Something went wrong while registering the user" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!username && !email) {
            return res.status(400).json({ error: "Username or email is required" });
        }

        const user = await User.findOne({ $or: [{ username }, { email }] });

        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid user credentials" });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                message: "User logged in successfully",
                user: loggedInUser,
                accessToken,
                refreshToken
            });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ error: "Something went wrong while logging in" });
    }
};


const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 
                }
            },
            {
                new: true
            }
        );

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ message: "User logged out" });
    } catch (error) {
        console.error("Error logging out:", error);
        return res.status(500).json({ error: "Something went wrong while logging out" });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ error: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user || incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                accessToken,
                refreshToken,
                message: "Access token refreshed"
            });
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return res.status(401).json({ error: error?.message || "Invalid refresh token" });
    }
};


const changeCurrentPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user?._id);
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid old password" });
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res
            .status(500)
            .json({ error: "Something went wrong while changing the password" });
    }
};










export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword
}