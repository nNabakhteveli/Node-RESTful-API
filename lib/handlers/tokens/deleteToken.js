const _data = require('../../data');


// Tokens - DELETE
// Required data: id
// Optional data: none

function deleteTokenHandler(data, callback) {
    const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
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

module.exports = deleteTokenHandler;