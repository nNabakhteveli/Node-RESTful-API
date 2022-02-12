const _data = require('../../data');


// Tokens - GET
// Required data: id    
// Optional data: none

function getTokenHandler(data, callback) {
    const queryId = typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (queryId) {
        _data.read('tokens', queryId, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, { "Error": "User not found" })
            }
        })
    } else {
        callback(400, { "Error": "Invalid query" })
    }
}

module.exports = getTokenHandler;