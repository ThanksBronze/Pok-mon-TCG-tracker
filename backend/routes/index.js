/**
 * Router for the home page.
 * Responsible for rendering the index view.
 * @module routes/index
 */

var express = require('express');
var router = express.Router();

/**
 * Handles GET / and renders the home page.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @returns {void}
 */
router.get('/', function(req, res) {
	res.render('index', { title: 'Express' });
});

module.exports = router;
