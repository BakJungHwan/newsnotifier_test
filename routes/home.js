const express = require('express');
const router = express.Router();
const debug = require('debug');

const home_debug = debug('home.js');
/* GET home page. */
router.get('/', function(req, res) {

	res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.header('Pragma', 'no-cache');
	res.header('Expires', 0);

	res.render('home');
});

module.exports = router;
