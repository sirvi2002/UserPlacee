const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

// app.use(express.json()); // for parsing application/json
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use(express.static(path.join('public')));


// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With , Content-Type , Accept , Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
//     next();
// })

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// app.use((req, res, next) => {
//     const error = new HttpError('Could find the route.', 404);
//     throw error;
// });

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "SOmething Went Wrong" });
});


mongoose
    .connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-pr29esb-shard-00-00.jteif2l.mongodb.net:27017,ac-pr29esb-shard-00-01.jteif2l.mongodb.net:27017,ac-pr29esb-shard-00-02.jteif2l.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-hgqrde-shard-0&authSource=admin&retryWrites=true&w=majority`)
    .then(() => {
        console.log("Connected!!");
        app.listen(process.env.PORT || 5000);
    })
    .catch(error => {
        console.log("Errorrr " + error);
    });