var express = require('express');
var router = express.Router();
var middleware = require('./middleware.js');


router.get('/', middleware.ensureAuthenticated, function(req, res, next) {
    console.log();

    res.render('editacc', {
        errorMessages: 0,
        success: 0,
        firstname: req.user.name,
        username: req.user.username,
        surname: req.user.surname,
        email: req.user.email,
        password: "testPass",
        adminaccess: req.user.is_user,

    });
});
module.exports = router;
