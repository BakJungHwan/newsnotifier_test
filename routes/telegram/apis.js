const express = require('express');
const router = express.Router();
const debug = require('debug');

const getme = require('./getme');
const webhook = require('./webhook');
const export_chat_invite_link = require('./export_chat_invite_link');
const get_chat_invite_link = require('./get_chat_invite_link');

router.get('/getme', getme);
router.post('/GQ2HSxfbuqXl78H5nCLRi1FYqD7dSlykk', webhook);
router.post('/export_chat_invite_link', export_chat_invite_link);
router.post('/get_chat_invite_link', get_chat_invite_link);

module.exports = router;
