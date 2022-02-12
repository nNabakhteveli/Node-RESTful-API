const _data = require('../../data');


// Tokens - PUT
// Required data: id, extend
// Optional data: none

function putTokenHandler(data, callback) {
    const id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    const extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;

    if (id && extend) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check if user is expired
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200)
                        } else {
                            callback(500, { "Error": "Couldn't update token's expiration" })
                        }
                    })
                } else {
                    callback(400, { "Error": "The token has already expired and can't be extended" })
                }
            } else {
                callback(400, { "Error": "Specified token doesn't exist" })
            }
        })
    } else {
        callback(400, { "Error": "Missing required field(s)" })
    }
}

module.exports = putTokenHandler;