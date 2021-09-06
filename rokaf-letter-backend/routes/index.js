var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

function renderVue(req, res) {
    var file = path.join(__dirname, '../public', 'index.html');
    console.log(file);

    if (!fs.existsSync(file)) {
        res.render('index', {title: '공군 훈련병 서비스'});
    }
    else
    {
        res.sendFile(file);
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    renderVue(req, res);
});

router.get('/letter', function(req, res, next) {
    renderVue(req, res);
});

module.exports = router;