const _data = require("./data");
const helpers = require("./helpers");

/*
* Request handlers
*/

const handlers = {};


handlers.ping = (data, callback) => {
    console.log("Hello from ping")
    callback(200);
}

handlers.users = (data, callback) => {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback); 
    } else {
        callback(405);
    }
}


handlers._users = {};


// Users - GET
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
    const queryNumber = typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.trim().length > 6 ? data.queryStringObject.phone.trim() : false; 

    if(queryNumber) {
        const token = typeof data.headers.token === 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, queryNumber, (tokenIsValid) => {
            if(tokenIsValid) {
                _data.read('users', queryNumber, (err, data) => {
                    if(!err && data) {
                        if(data.hashedPassword) {
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


// Users - POST
// Required data: firstName, lastName, phone, password, tosAgreement 
// Optional data: none
handlers._users.post = (data, callback) => {
    const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 5 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 5 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;
 
    if(firstName && lastName && phone && password && tosAgreement) {
        _data.read('users', phone, (err, data) => {
            if(err) {
                // Hash the password
                const hashedPasword = helpers.hash(password);
                
                if(hashedPasword) {
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPasword,
                        'tosAgreement': true
                    }
                    
                    _data.create('users', phone, userObject, (err) => {
                        if(!err) {
                            callback(200)
                        } else {
                            console.log(err);
                            callback(500, { "Error": "Couldn't create the new user" });
                        }
                    })
                } else {
                    callback(500, { "Error": "Couldn't hash the user's password" })
                }
            } else {
                callback(400, { "Error": "A user with that number already exist" })
            }
        })
    } else {
        callback(400, {'Error': "Missing required fields"}); 
    }
}

// Users - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)

handlers._users.put = (data, callback) => {
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
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
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

// Users - DELETE
// Required data: phone

// @TODO Cleanup (delete) any other data files associated with this user 
handlers._users.delete = (data, callback) => {
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 5 ? data.payload.phone.trim() : false;
    
    if (phone) {
        const token = typeof data.headers.token === 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
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

// Tokens
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback); 
    } else {
        callback(405);
    }
}


handlers._tokens = {};

// Tokens - GET
// Required data: id    
// Optional data: none
handlers._tokens.get = (data, callback) => {
    const queryId = typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false; 

    if(queryId) {
        _data.read('tokens', queryId, (err, tokenData) => {
            if(!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, { "Error": "User not found" })
            }
        })
    } else {
        callback(400, { "Error": "Invalid query" })
    }
}


// Tokens - POST
// Required data: phone, password   
// Optional data: none
handlers._tokens.post = (data, callback) => {
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 5 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 5 ? data.payload.password.trim() : false;

    if(phone && password) {
        // Lookup the user who matches that phone number
        _data.read('users', phone, (err, userData) => {
            if(!err && userData) {
                // Hash the sent password and compare it to the stored hashed password
                const hashedPassword = helpers.hash(password);

                if(hashedPassword === userData.hashedPassword) {
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

// Tokens - PUT
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
    const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;

    if(id && extend) {
        _data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                // Check if user is expired
                if(tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    _data.update('tokens', id, tokenData, (err) => {
                        if(!err) {
                            callback(200)
                        } else {
                            callback(500, { "Error": "Couldn't update token's expiration" })
                        }
                    })
                } else {
                    callback(400, { "Error": "The token has already expired and can't be extended" })
                }
            } else {
                callback(400, { "Error": "Specified token doesn't exist"})
            }
        })
    } else {
        callback(400, { "Error": "Missing required field(s)" })
    }
}

// Tokens - DELETE
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
    const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    
    if (id) {
        _data.read('tokens', id, (err, data) => {
            if(!err && data) {
                _data.delete('tokens', id, (err) => {
                    if(!err) {
                        callback(200)
                    } else {
                        console.log(err);
                        callback(400, { "Error": "Could not delete the token" });
                    }
                });    
            } else {
                callback(404, { "Error": "User doesn't exist" });
            }
        })
    } else {
        callback(400, { "Error": "Missing phone field" })
    }
}

// Verify if a given token id is currently valid for a given user 
handlers._tokens.verifyToken = (id, phone, callback) => {
    _data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData) {
            if(tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

handlers.notFound = (data, callback) => {
    callback(404);
}


module.exports = handlers;