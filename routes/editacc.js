var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log('EDIT');
    //first name, surname, e-mail, username, password, administration access
    res.render('editacc', {
        errorMessages: 0,
        success: 0,

    });

});

module.exports = router;
