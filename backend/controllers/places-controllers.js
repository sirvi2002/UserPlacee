const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const { startSession } = require('mongoose');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');


const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    console.log("Place id asked for ", placeId);

    let place;
    try {

        place = await Place.findById(placeId);
    }
    catch (err) {
        const error = new HttpError(
            "Something went wrong, couldn't find place", 500
        );
        return next(error);
    }

    if (!place) {
        throw new HttpError('Could not find place for given place id.', 404);
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    console.log(userId);
    let places;
    try {
        places = await Place.find({ creator: userId });
    }
    catch (err) {
        const error = new HttpError(
            'Something Went Wrong, getPlacesByUserId',
            500
        );
        return next(error);
    }

    if (!places) {
        return next(
            new HttpError('Could not find place for given user id.', 404)
        );
    }

    res.json({ places: places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {

    console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { title, description, coordinates, address, creator } = req.body;

    const createdPlace = new Place({
        title,
        description,
        address,
        location: { lat: 0, lon: 0 },
        image: req.file.path,
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating place failed', 500);
        return next(error);
    }
    if (!user) {
        const error = new HttpError('Couldnt find user by given id', 404);
        return next(error);
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    }
    catch (err) {
        console.log(err);
        const error = new HttpError(
            'Creating Place Failed',
            500
        )
        return next(error);
    }

    res.status(201).json({ place: createdPlace })
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please check your data', 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;
    console.log("got place id : " + placeId);
    let place;
    try {
        place = await Place.findById(placeId);
    }
    catch (err) {
        const error = new HttpError(
            "Something went wrong, update Place", 500
        );
        return next(error);
    }

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this place', 401);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong. Update Place', 500
        )
        return next(error);
    }
    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {

    const placeId = req.params.pid;

    console.log("delete place id " + placeId);

    let place;
    try {
        place = await Place.findById(placeId);
    }
    catch (err) {
        const error = new HttpError(
            "Something went wrong, delete place", 500
        );
        return next(error);
    }
    if (!place) {
        const error = new HttpError('could not find place for this id', 404);
        return next(error);
    }


    let creator;

    try {
        creator = await User.findById(place.creator);
    } catch (err) {
        console.log("Cannot Find Creator for the given place ( Deletion ) ");
    }
    if (!creator) {
        const error = new HttpError('Cannot Find Creator for the given place ( Deletion ) ', 404);
        return next(error);
    }
    console.log("Creator : ", creator);
    console.log("Place : ", place);

    if (creator.id.toString() !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to delete this place.',
            401
        )
        return next(error);
    }

    try {

        const sess = await mongoose.startSession();
        sess.startTransaction();
        creator.places.pull(place);
        await creator.save();
        //await Place.deleteOne({ _id: place.id, session: sess })
        await place.remove({ session: sess });
        await sess.commitTransaction();
    }
    catch (err) {
        console.log(err);
        const error = new HttpError(
            "Something went wrong, delete place", 500
        );
        return next(error);
    }

    res.status(200).json({ message: "Place Deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
