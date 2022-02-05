const crypto = require("crypto");
const config = require('./config');

const helpers = {
    hash: password => {
        if(typeof (password) === 'string' && password.length > 0) {
            const hash = crypto.createHmac('sha256', config.hashingSecret).update(password).digest('hex');
            return hash;
        } else {
            return false;
        }
    },

    // Parsing a JSON to an object without throwing 
    parseJSONToObject: buffer => {
        try {
            const obj = JSON.parse(buffer)
            return obj
        } catch(err) {
            return {}
        } 
    }
};


module.exports = helpers;