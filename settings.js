let path = require('path')

module.exports.dbPath = function (fileName) {
    return path.join(__dirname, `/${fileName}.json`)
}