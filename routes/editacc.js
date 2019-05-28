var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    console.log(req.user.username);

    res.render('editacc', {
        errorMessages: 0,
        success: 0,
        firstname: "testFistName",
        username: "testUsername",
        surname: "testSurname",
        email: "testEmail",
        username: "testUsername",
        password: "testPass",
        adminaccess: true,

    });
});
module.exports = router;
