const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// Container for the module to be exported
const lib = {
    baseDir: path.join(__dirname, '/../.data/'),

    create: (dir, fileName, data, callback) => {
        fs.open(`${lib.baseDir}${dir}/${fileName}.json`, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                const stringData = JSON.stringify(data);

                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if (!err) {
                        fs.close(fileDescriptor, (err) => {
                            if (!err) {
                                callback(false);
                            } else {
                                callback("Error closing new file");
                            }
                        });
                    } else {
                        callback("Error writing to new file");
                    }
                })

            } else {
                callback('Could not create new file, it may already exist');
            }
        })
    },

    read: (dir, fileName, callback) => {
        fs.readFile(`${lib.baseDir}${dir}/${fileName}.json`, 'utf-8', (err, data) => {
            if(!err && data) {
                callback(false, helpers.parseJSONToObject(data))
                return;
            }
            callback(err, data);
        });
    },

    update: (dir, fileName, data, callback) => {
        fs.open(`${lib.baseDir}${dir}/${fileName}.json`, 'r+', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                const stringData = JSON.stringify(data);

                fs.ftruncate(fileDescriptor, (err) => {
                    if (!err) {
                        fs.writeFile(fileDescriptor, stringData, (err) => {
                            if (!err) {
                                fs.close(fileDescriptor, (err) => {
                                    if (!err) {
                                        callback(false)
                                    } else {
                                        callback("Error closing the file");
                                    }
                                });
                            } else {
                                console.log("Error in writing the file")
                            }
                        })
                    } else {
                        console.log("error in trunacting");
                    }
                })
            } else {
                callback("Could not open file");
            }
        })
    },

    delete: (dir, fileName, callback) => {
        fs.unlink(`${lib.baseDir}${dir}/${fileName}.json`, (err) => {
            if(!err) {
                callback(false);
            } else {
                throw err;
            } 
        })
    }
}


module.exports = lib;