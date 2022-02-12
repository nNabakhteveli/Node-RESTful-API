const _data = require('../../data');


// Verify if a given token id is currently valid for a given user 

function verifyToken(id, phone, callback) {
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

module.exports = verifyToken;