const models = require('../models');
const sequelize = require('sequelize');
const User = models.User;
var bcrypt = require('bcrypt');



async function deleteUserById(uid) {
    if (!uid) {
        return {msg: 'No Id specified..', payload: 1};
    }
    try {
        // !! - return true if successful, else false
        return !!await User.destroy({
            where: {
                id: uid
            }
        });
    } catch (e) {
        console.log("Can't delete " + e);
        return false;
    }

}

async function getUser(uid) {
    return await User.findOne({
        where: {
            id: uid,
        }
    });
}

async function checkExistingMail(email) {
    let existing_mails = await User.findAll({
        where: {
            email:email,
        }
    });
    return (existing_mails.length > 0) ? true : false;
}

async function updateUser(uid,data) {
    let user = await getUser(uid);
    let update_status = {};
    update_status.user = user;
    if (data.password !== data.password2) {
        update_status.error = 'Passwords do not match.';
        return update_status;
    }
    if (await checkExistingMail(data.email) && (data.email !== user.email)){
        update_status.error = 'Email already exists.';
        return update_status;
    }

    if (data.is_user === undefined) {
        data.is_user = 1;
    }


    if(data.password !== ""){
        data.password = await bcrypt.hashSync(data.password, 10);
        user.password =  data.password;
    }
    user.name     = (data.name      !== user.name)      ? data.name     : user.name;
    user.surname  = (data.surname   !== user.surname)   ? data.surname  : user.surname;
    user.email    = (data.email     !== user.email)     ? data.email    : user.email;
    user.username = (data.username  !== user.username)  ? data.username : user.username;
    user.is_user  = (data.is_user   !== user.is_user)   ? data.is_user  : user.is_user;


    try {
        await user.save();
    } catch (e) {
        console.log(e);
        update_status.user  = await getUser(uid);
        update_status.error = 'Username already in use!';
        return update_status;
    }
    update_status.success = 'Account updated!';
    update_status.user = user;
    return update_status;


}


module.exports = {
    deleteUserById,
    getUser,
    checkExistingMail,
    updateUser,
};