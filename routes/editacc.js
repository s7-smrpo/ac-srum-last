var express = require('express');
var router = express.Router();
var middleware = require('./middleware.js');

var models = require('../models/');
var User = models.User;


router.get('/', middleware.ensureAuthenticated, function(req, res, next) {
    console.log();

    res.render('editacc', {
        errorMessages: 0,
        success: 0,
        firstname: req.user.name,
        username: req.user.username,
        surname: req.user.surname,
        email: req.user.email,
        adminaccess: req.user.is_user,

    });
});

router.post('/', middleware.ensureAuthenticated, async function (req, res, next) {
    var data = req.body;
    //var usr = User.findById(req.user.id);

    let usr = await User.findOne({
        where: {
            id: req.user.id,
        }
    });

    if (data.password !== data.password2) {

        req.flash('error', 'Passwords do not match.');
        res.render('editacc', {
            errorMessages: req.flash('error'),
            success: 0,
            title: 'AC scrum vol2',
            username: req.username,
            firstname: req.name,
            surname: req.surname,
            isUser: req.is_user,
            email: req.email,
            is_user: req.is_user,

        });
    }

    if (data.is_user === undefined) {
        data.is_user = 1;
    }

    usr.setAttributes({
        name: data.name,
        surname: data.surname,
        email: data.email,
        username: data.username,
        password: data.password,
        is_user: data.is_user,

    });

    await usr.save();

    req.flash('success', 'Account updated!');
    res.render('editacc', {
            success: req.flash('success'),
            errorMessages: 0,
            title: 'AC scrum vol2',
            username: data.username,
            firstname: data.name,
            surname: data.surname,
            isUser: data.is_user,
            email: data.email,
            is_user: data.is_user,

        });
    });




module.exports = router;
