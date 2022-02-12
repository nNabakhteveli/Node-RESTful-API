const _data = require('../../data');


// Tokens - POST
// Required data: phone, password   
// Optional data: none

function postTokenHandler(data, callback) {
    const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length > 5 ? data.payload.phone.trim() : false;
    const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 5 ? data.payload.password.trim() : false;

    if (phone && password) {
        // Lookup the user who matches that phone number
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                // Hash the sent password and compare it to the stored hashed password
                const hashedPassword = helpers.hash(password);

                if (hashedPassword === userData.hashedPassword) {
                    // Create valid token for 1 hour
                    const tokenID = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60
                    const tokenObj = {
                        'phone': phone,
                        'id': tokenID,
                        'expires': expires
                    }

                    _data.create('tokens', tokenID, tokenObj, (err) => {
                        if (!err) {
                            callback(200, tokenObj)
                        } else {
                            callback(500, { "Error": "Couldn't create the new token" })
                        }
                    })

                } else {
                    callback(400, { "Error": "Password didn't match the specified user's stored password" })
                }

            } else {
                callback(400, { "Error": "Could not find the specified user" })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required fields' })
    }
}

module.exports = postTokenHandler;