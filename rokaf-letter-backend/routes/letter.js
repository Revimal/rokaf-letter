/* JSON Config Format
JSON Path: assets/letter.json
{
    "server": "http://localhost",
    "port": "5984",
    "username": "admin",
    "password": "1q2w3e4r",
    "database": "couch-test-db",
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

var config = require('../assets/letter.json')

var cradle = require('cradle');
const app = require('../app');
const { request } = require('http');
const { TooManyRequests } = require('http-errors');
var connection = new(cradle.Connection)(
    config.server, config.port, {auth: {username: config.username, password: config.password}});
var couchdb = connection.database(config.database);

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
            console.error(err);
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
})

router.post('/', function(req, res, next) {
    couchdb.save(req.body, function(err, doc) {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        }
        else {
            res.send({id: doc._id});
        }
    })
})

router.get('/news', function(req, res, next) {
    if (!authHTTPHeader(req)) {
        res.sendStatus(401);
    }
    else {
        couchdb.all(function(err, docinfo) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            else {
                var ids = [];

                for (var idx = 0; idx < docinfo.length; ++idx) {
                    couchdb.get(docinfo[idx].id, function(err, doc) {
                        if (err) {
                            console.error(err);
                            res.sendStatus(500);
                        }
                        else {
                            if (!doc.sent) {
                                ids.push({
                                    id: doc._id,
                                });
                            }
                        }
                    });
                }

                res.send(ids);
            }
        });
    }
})

router.get('/:id', function(req, res, next) {
    if (!authHTTPHeader(req)) {
        res.sendStatus(401);
    }
    else {
        couchdb.get(req.params.id, function(err, doc) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            else {
                res.send({
                    sent: doc.sent,
                    date: doc.date,
                    name: doc.name,
                    addr: doc.addr,
                    body: doc.body,
                });
            }
        })
    }
})

router.get('/read/:id', function(req, res, next) {
    if (!authHTTPHeader(req)) {
        res.sendStatus(401);
    }
    else {
        couchdb.get(req.params.id, function(err, doc) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            else {
                res.send(
                    "전송여부: " + (doc.sent ? "완료" : "필요") + "\n" +
                    "저장시각: " + doc.date + "\n" +
                    "보낸사람: " + doc.name + "\n" +
                    "회신주소: " + doc.addr + "\n" +
                    "[편지 본문]" + "\n" + doc.body + "\n"
                );
            }
        })
    }
})

router.put('/:id', function(req, res, next) {
    if (!authHTTPHeader(req)) {
        res.sendStatus(401);
    }
    else {
        couchdb.get(req.params.id, function(err, doc) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            else {
                couchdb.save(req.params.id, doc._rev,
                    {
                        sent: true,
                        date: doc.date,
                        name: doc.name,
                        addr: doc.addr,
                        body: doc.body,
                    },
                    function(err, body) {
                    if (err) {
                        console.error(err);
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

router.delete('/:id', function(req, res, next) {
    if (!authHTTPHeader(req)) {
        res.sendStatus(401);
    }
    else {
        couchdb.get(req.params.id, function(err, doc) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            else {
                couchdb.remove(req.params.id, doc._rev, function(err, body) {
                    if (err) {
                        console.error(err);
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

module.exports = router;