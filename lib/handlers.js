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
// @TODO only let an authenticated user access only their own object

handlers._users.get = (data, callback) => {
    const queryNumber = typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.trim().length > 6 ? data.queryStringObject.phone.trim() : false; 

    if(queryNumber) {
        _data.read('users', queryNumber, (err, data) => {
            if(!err && data) {
                if(data.hashedPassword) {
                    delete data.hashedPassword;
                    callback(200, data);    
                }
            } else {
                callback(404, { "Error": "User not found" })
            }
        })
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

handlers._users.put = (data, callback) => {
    
}

handlers._users.delete = (data, callback) => {
    
}

handlers.notFound = (data, callback) => {
    console.log("Hello from not found")
    callback(404);
}


module.exports = handlers;