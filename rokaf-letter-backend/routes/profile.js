/* JSON Config Format
JSON Path: assets/profile.json
{
    "name": "John Doe",
    "alias": "JD",
    "desc": "Description for the soldier.",
    "number": 100,
    "profile": "./profile.png",
    "resource": "/var/tmp/images",
    "rcprefix": "image"
}
*/

const { urlencoded } = require('express');
var express = require('express');
var router = express.Router();
var path = require('path');

var config = require('../assets/profile.json');

var rcpath = x => {return '/' + config.rcprefix + x};
var url2rc = x => {return x + '/' + config.rcprefix + '/'};

router.get('/', function(req, res, next) {
    if (config.profile.startsWith('./')) {
        config.profile = config.profile.replace(/^\.\//, url2rc(req.originalUrl));
    }
    res.send({
        name: config.name,
        alias: config.name,
        desc: config.desc,
        number: config.number,
        profile: config.profile,
    });
});

router.get(rcpath('/:url'), function(req, res, next) {
    var file = path.join(config.resource, req.params.url);
    res.sendFile(file);
})

module.exports = router;