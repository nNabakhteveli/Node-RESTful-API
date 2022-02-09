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
    },
    // Create a string of random alphanumeric characters, of a given length
    createRandomString: strLength => {
        strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;

        if(strLength) {
            const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let str = '';

            for(let i = 0; i < strLength; i++) {
                str += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            }
            return str;
        } else {
            return false; 
        }
    }
};


module.exports = helpers;