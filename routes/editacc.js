var express = require('express');
var router = express.Router();
var middleware = require('./middleware.js');

var models = require('../models/');
var User = models.User;

var bcrypt = require('bcrypt');


//Edit user if admin
router.get('/:id', middleware.ensureAuthenticated, async function(req, res, next) {
    console.log();

    //preberi userja po id, da dobiš podatke (spremeni id parameter na :id)
    let usr = await User.findOne({
        where: {
            id: req.user.id,
        }
    });

    //nafilaj podatke od firstname vse do konca za prikaz
    res.render('editacc', {
        errorMessages: 0,
        success: 0,
        //firstname: usr.name,
        //username: usr.username,
        //surname: usr.surname,
        //email: usr.email,
        //adminaccess: usr.is_user,

    });
});

//Edit user -self
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


// Write new data in database
router.post('/', middleware.ensureAuthenticated, async function (req, res, next) {
    var data = req.body;
    //var usr = User.findById(req.user.id);


    //dodaj if stavek: če je uporabnik prišel na to stran iz administration panela potem zamenjaj parameter id
    //na id od userja, ki ga spreminjaš, drugače
    //če je uporabnik prišel iz "Edit accout" (lastno urejanje) gumba potem pusti tako kot je
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

    data.password = await bcrypt.hashSync(data.password, 10);

    usr.setAttributes({
        name: data.name,
        surname: data.surname,
        email: data.email,
        username: data.username,
        password: data.password,
        is_user: data.is_user,

    });

    try {
        await usr.save();
    } catch (e) {
        req.flash('error', 'Username already in use!');
        res.render('editacc', {
            success: 0,
            errorMessages: req.flash('error'),
            title: 'AC scrum vol2',
            username: data.username,
            firstname: data.name,
            surname: data.surname,
            isUser: data.is_user,
            email: data.email,
            is_user: data.is_user,
        });

    }


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
