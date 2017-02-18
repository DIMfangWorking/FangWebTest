var ldap = require('ldapjs');
var util = require('util');

var database = undefined;
var userCurrentIndex = undefined;

function authentication(user, password, callback) {
    var options = {
        port: config.auth.port,
        hostname: config.auth.ip,
        method: 'POST',
        path: '/user/auth',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    };

    var postData = {
        name: user,
        password: password
    };
    sendHttpRequest(options, JSON.stringify(postData), function (err, res, chunk) {
        if (err) {
            logger.error(err);
            callback(err, null)
        } else {
            callback(null, JSON.parse(chunk));
        }
    });
}

function create(user, callback) {
    user.id = userCurrentIndex++;

    var model = new database.User(user)
    model.save(function (err) {
        if (err) {
            logger.info("save user error. ", err);
        }
        else {
            logger.info("save user success. ");
        }
        callback(err, model);
    });
}

function remove(user, callback) {
    database.User.remove({id: user.id}).exec(function (err) {
        if (err) {
            logger.info("remove user error. ", err);
        }
        else {
            logger.info("remove user success. ");
        }
        callback(err);
    });
}

function update(user, callback) {
    user.update = new Date();
    database.User.findOneAndUpdate({id: user.id}, {$set: user}, function (err) {
        if (err) {
            logger.info("update user error. ", err);
        }
        else {
            logger.info("update user success. ");
        }

        callback(err);
    });
}

function get(name, callback) {
    database.User.findOne({name: name}).exec(callback);
}

function getById(id, callback) {
    database.User.findOne({id: id}).exec(callback);
}

function find(filter, callback) {
    database.User.find().sort({id: 1}).exec(callback);
}

module.exports = function (db) {
    database = db;

    return {
        'authentication': authentication
        , 'createUser': create
        , 'deleteUser': remove
        , 'updateUser': update
        , 'findUser': find
        , 'getUserByName': get
        , 'getUserById': getById
    };
}
