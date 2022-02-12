const _data = require('../../data');
const helpers = require('../../helpers');
const verifyToken = require('../tokens/verifyToken');


// Users - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)

function putUserHandler(data, callback) {
    // Check for the required field
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 5 ? data.payload.phone.trim() : false;
    
    // Check for optional fields
    const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 5 ? data.payload.password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {
            const token = typeof data.headers.token === 'string' ? data.headers.token : false;
            // Verify that the given token is valid for the phone number
            verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            if (firstName) userData.firstName = firstName;
                            
                            if (lastName) userData.lastName = lastName;
                            
                            if (password) userData.hashedPassword = helpers.hash(password);
                            
                            _data.update('users', phone, userData, (err) => {
                                if(!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, { "Error": "Could not update the user" })
                                }
                            })
                        } else {
                            callback(404, { "Error": "Specified user does not exist" })
                        }
                    });
                } else {
                    callback(403, { "Error": "Token is invalid or it's missing in header" })
                }
            });
        } else {
            callback(400, { "Error": "Missing fields to update" });
        }
    } else {
        callback(400, { "Error": "Phone is invalid" })
    }
}

module.exports = putUserHandler;