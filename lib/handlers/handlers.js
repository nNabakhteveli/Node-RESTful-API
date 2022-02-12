const getUser = require('./users/getUsers');
const postUser = require('./users/postUsers');
const putUser = require('./users/putUsers');
const deleteUser = require('./users/deleteUsers');

const getToken = require('./tokens/getToken');
const postToken = require('./tokens/postToken');
const putToken = require('./tokens/putToken');
const deleteToken = require('./tokens/deleteToken');
const verifyToken = require('./tokens/verifyToken');


/*
* Request handlers
*/

const handlers = {
    users: (data, callback) => {
        const acceptableMethods = ['get', 'post', 'put', 'delete'];

        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._users[data.method](data, callback);
        } else {
            callback(405);
        }
    },
    _users: {
        get: getUser,
        post: postUser,
        put: putUser,
        delete: deleteUser
    },

    tokens: (data, callback) => {
        const acceptableMethods = ['get', 'post', 'put', 'delete'];

        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._tokens[data.method](data, callback);
        } else {
            callback(405);
        }
    },
    _tokens: {
        get: getToken,
        post: postToken,
        put: putToken,
        delete: deleteToken,
        verifyToken: verifyToken
    },

    ping: (data, callback) => {
        console.log("Hello from ping")
        callback(200);
    },

    notFound: (data, callback) => {
        callback(404);
    }
};

module.exports = handlers;