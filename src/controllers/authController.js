const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
});

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.cookie('CodeBashJWT', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        ),
        // secure: true, //like this the cookie will only be sent on an encrypted connection , i.e basically we are using https
        httpOnly: true, // the cookie can now be not modified by the browser, it can only store and send it
        // secure: req.secure || req.headers('x-forwarded-proto') === 'https',
    });

    // Remove password from the output
    const updatedUser = { ...user, password: undefined };

    return res.status(statusCode).json({
        status: 'success',
        token,
        user: updatedUser,
    });
};

exports.signup = async (req, res) => {
    try {
        // Create the new user
        const {
            fullName, userName, email, password,
        } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({
            fullName,
            userName,
            email,
            password: hashedPassword,
        });
        const user = await User.findOne({ email });
        if (user) {
            return createSendToken(user, 200, req, res);
        }
    } catch (err) {
        return res.json({
            status: 'failure',
            error: err,
        });
    }
    return null;
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.json({
                status: 'failure',
                error: 'Invalid Login Credentials',
            });
        }
        createSendToken(user, 200, req, res);
    } catch (err) {
        return res.json({
            status: 'failure',
            error: err,
        });
    }
    return null;
};

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.CodeBashJWT) {
        try {
            const decoded = await jwt.verify(
                req.cookies.CodeBashJWT,
                process.env.JWT_SECRET,
            );

            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            req.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    return next();
};
