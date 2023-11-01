const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');  // exclude password
    } catch (err) {
        const error = new HttpError(
            'Get Users Failed',
            500
        );
        return next(error);
    }
    console.log("Users " + users);
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const singUp = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'Signing Up faileddd', 500
        )
        return next(error);
    }
    if (existingUser) {
        const error = new HttpError(
            'User Already Exist, Please Login',
            422
        )
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError('Could not create user, please try again', 500);
        return next(error);
    }
    // console.log("normal : ", password);
    // console.log("hash : ", hashedPassword);
    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    });

    try {
        await createdUser.save();
    }
    catch (err) {
        console.log(err);
        const error = new HttpError(
            'Signing Up Failed!!',
            500
        )
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, process.env.JWT_KEY, { expiresIn: '1h' });
    } catch (err) {
        const error = new HttpError(
            'Signing Up Failed',
            500
        )
        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    console.log("Email : ", email);
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'Login faileddd', 500
        )
        return next(error);
    }
    if (!existingUser) {
        const error = new HttpError(
            'Invalid Credentials',
            401
        );
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('Could not log in!!', 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid Credentials', 401);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, process.env.JWT_KEY, { expiresIn: '1h' });
    } catch (err) {
        const error = new HttpError(
            'Logging in Failed',
            500
        )
        return next(error);
    }
    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token

    });
};

exports.getUsers = getUsers;
exports.singUp = singUp;
exports.login = login;