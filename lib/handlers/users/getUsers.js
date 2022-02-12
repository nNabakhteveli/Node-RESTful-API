const _data = require('../../data');
const verifyToken = require('../tokens/verifyToken');


// Users - GET
// Required data: phone
// Optional data: none

function getUserHandler(data, callback) {
    const queryNumber = typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.trim().length > 6 ? data.queryStringObject.phone.trim() : false;

    if (queryNumber) {
        const token = typeof data.headers.token === 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        verifyToken(token, queryNumber, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users', queryNumber, (err, data) => {
                    if (!err && data) {
                        if (data.hashedPassword) {
                            delete data.hashedPassword;
                            callback(200, data);
                        }
                    } else {
                        callback(404, { "Error": "User not found" })
                    }
                });
            } else {
                callback(403, { "Error": "Token is invalid or it's missing in header" })
            }
        });
    } else {
        callback(400, { "Error": "Invalid query" })
    }
}

module.exports = getUserHandler;