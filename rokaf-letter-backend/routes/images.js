/* JSON Config Format
JSON Path: assets/profile.json
{
    "server": "http://localhost",
    "port": "5984",
    "username": "admin",
    "password": "1q2w3e4r",
    "database": "couch-test-db",
    "resource": "/var/tmp/images",
    "rcprefix": "image",
    "hashsalt": "9GllNK+LeRT5VskmqaK6PQ=="
    "hashiter": 5,
    "hashpksz": 64,
    "hashalgo": "sha512"
}
*/

var express = require('express');
const { route } = require('.');
var router = express.Router();
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');

var config = require('../assets/images.json')

var cradle = require('cradle');
const app = require('../app');
const { request } = require('http');
var connection = new(cradle.Connection)(
    config.server, config.port, {auth: {username: config.username, password: config.password}});
var couchdb = connection.database(config.database);

var rcpath = x => {return '/' + config.rcprefix + x};
var id2rcp = (x, id) => {return x.replace(id, config.rcprefix + '/')};

function authHTTPHeader(req) {
    var hdrval = req.header('ROKAF-AUTH-CODE');
    var hashed = crypto.pbkdf2Sync(config.password,
        config.hashsalt, config.hashiter, config.hashpksz, config.hashalgo).toString('base64');

    console.log('[LOGIN-ATTEMPT]: ' + hdrval);
    console.log('[LOGIN-COMPARE]: ' + hashed);

    if (hashed == hdrval) {
        return true;
    }

    return false;
}

router.put('/', function(req, res, next) {
    var hashed = crypto.pbkdf2Sync(req.body.password,
        req.body.salt, config.hashiter, config.hashpksz, config.hashalgo).toString('base64');

    res.send({hashed: hashed});
})

router.get('/', function(req, res, next) {
    couchdb.all(function(err, docinfo) {
        if (err) {
            console.err(err);
            res.sendStatus(500);
        }
        else {
            var ids = [];

            for (var idx = 0; idx < docinfo.length; ++idx) {
                ids.push({
                    id: docinfo[idx].id,
                });
            }

            res.send(ids);
        }
    });
});

router.post('/', function(req, res, next) {
    if (!authHTTPHeader(req)) {
        res.sendStatus(401);
    }
    else {
        couchdb.save(req.body, function(err, doc) {
            if (err) {
                console.err(err);
                res.sendStatus(500);
            }
            else {
                res.send({id: doc._id});
            }
        })
    }
})

router.get('/:id', function(req, res, next) {
    couchdb.get(req.params.id, function(err, doc) {
        if (err) {
            console.err(err);
            res.sendStatus(500);
        }
        else {
            if (doc.url.startsWith('./')) {
                doc.url = doc.url.replace(/^\.\//,
                    id2rcp(req.originalUrl, doc._id));
            }

            res.send({
                url: doc.url,
                desc: doc.desc,
            });
        }
    })
})

router.delete('/:id', function(req, res, next) {
    if (!authHTTPHeader(req)) {
        res.sendStatus(401);
    }
    else {
        couchdb.get(req.params.id, function(err, doc) {
            if (err) {
                console.err(err);
                res.sendStatus(500);
            }
            else {
                couchdb.remove(req.params.id, doc._rev, function(err, body) {
                    if (err) {
                        console.err(err);
                        res.sendStatus(500);
                    }
                    else {
                        res.sendStatus(200);
                    }
                });
            }
        })
    }
})

router.get(rcpath('/:url'), function(req, res, next) {
    var file = path.join(config.resource, req.params.url);

    if (!fs.existsSync(file)) {
        res.sendStatus(404);
    }
    else
    {
        res.set({'Content-Type' : 'image/png'});
        res.sendFile(file);
    }
}),

router.post(rcpath('/:url'), function(req, res, next) {
    var file = path.join(config.resource, req.params.url);

    if (!authHTTPHeader(req)) {
        res.sendStatus(401);
    }
    else {
        if (!req.is('image/png')) {
            res.sendStatus(400);
        }
        else {
            var stream = req.pipe(fs.createWriteStream(file));
            stream.on('finish', () => {
                res.sendStatus(200);
            });
        }
    }
}),

router.delete(rcpath('/:url'), function(req, res, next) {
    var file = path.join(config.resource, req.params.url);

    if (!authHTTPHeader(req)) {
        res.sendStatus(401);
    }
    else {
        if (!fs.existsSync(file)) {
            res.sendStatus(404);
        }
        else
        {
            fs.rmSync(file);
            res.sendStatus(200);
        }
    }
})

module.exports = router;