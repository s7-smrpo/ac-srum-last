var express = require('express');
var router = express.Router();
var middleware = require('./middleware.js');
var models = require('../models/');
var User = models.User;
var bcrypt = require('bcrypt');
const UserHelper = require('../helpers/UserHelper');
const ProjectHelper = require('../helpers/ProjectHelper');





//Edit user -self
router.get('/', middleware.ensureAuthenticated, async function(req, res, next) {
    let user_to_edit = await UserHelper.getUser(req.user.id);
    res.render('editacc', {
        errorMessages: 0,
        success: 0,
        pageName: 'Edit user',
        uid: req.user.id,
        username: req.user.username,
        isUser: req.user.is_user,
        editUser: user_to_edit,
        user: req.user,
    });
});

// Write new data in database
router.post('/', middleware.ensureAuthenticated, async function (req, res, next) {
    var data = req.body;
    let user_update  = await UserHelper.updateUser(req.user.id,data);
    (user_update.error   !== undefined) ? req.flash('error', user_update.error) : req.flash('success',user_update.success);
    let user_to_edit = user_update.user;

    return res.render('editacc', {
        errorMessages: (user_update.error   !== undefined) ? req.flash('error')    : 0,
        success:       (user_update.success !== undefined) ? req.flash('success')  : 0 ,
        title: 'AC scrum vol2',
        editUser: user_to_edit,
        username: req.user.username,
        isUser: req.user.is_user,
        user: req.user,
    });
});

//Delete User
router.get('/delete/:id', middleware.isAllowed, async function(req, res, next) {
    await UserHelper.deleteUserById(req.params.id);
    return res.redirect('/admin_panel');
});

//Edit user if admin
router.get('/:id', middleware.isAllowed, async function(req, res, next) {
    let user_to_edit = await UserHelper.getUser(req.params.id);
    res.render('editacc', {
        errorMessages: 0,
        success: 0,
        pageName: 'Edit user',
        uid: req.user.id,
        username: req.user.username,
        isUser: req.user.is_user,
        editUser: user_to_edit,
        user: req.user,
    });
});

router.post('/:id', middleware.isAllowed, async function (req, res, next) {
    var data = req.body;
    let user_update  = await UserHelper.updateUser(req.params.id,data);
    (user_update.error   !== undefined) ? req.flash('error', user_update.error) : req.flash('success',user_update.success);
    let user_to_edit = user_update.user;
    let c_user = await UserHelper.getUser(req.user.id);

    if(parseInt(c_user.is_user) !== 0) return res.redirect('/dashboard');

    return res.render('editacc', {
        errorMessages: (user_update.error   !== undefined) ? req.flash('error')    : 0,
        success:       (user_update.success !== undefined) ? req.flash('success')  : 0 ,
        title: 'AC scrum vol2',
        editUser: user_to_edit,
        username: req.user.username,
        isUser: req.user.is_user,
        user: req.user,
    });



});

module.exports = router;
