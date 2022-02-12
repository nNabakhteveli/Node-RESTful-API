const _data = require('../../data');
const verifyToken = require('../tokens/verifyToken');


// Users - DELETE
// Required data: phone
// @TODO Cleanup (delete) any other data files associated with this user 

function deleteUserHandler(data, callback) {
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 5 ? data.payload.phone.trim() : false;
    
    if (phone) {
        const token = typeof data.headers.token === 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                callback(200)
                            } else {
                                console.log(err);
                                callback(400, { "Error": "Could not delete the user" });
                            }
                        });    
                    } else {
                        callback(404, { "Error": "User doesn't exist" });
                    }
                });
            } else {
                callback(403, { "Error": "Token is invalid or it's missing in header" })
            }
        });
    } else {
        callback(400, { "Error": "Missing phone field" })
    }
}

module.exports = deleteUserHandler;