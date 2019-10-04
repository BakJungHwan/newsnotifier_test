const express = require('express');
const router = express.Router();
const debug = require('debug');

const login = require('./login.js');
const logout = require('./logout.js');
const unlink = require('./unlink.js');
const refresh_token = require('./refresh_token.js');
const talk_memo = require('./talk_memo.js');

router.get('/login', kakao_login);
router.get('/logout', kakao_logout);
router.get('/unlink', kakao_unlink);
router.get('/refresh_token', kakao_refresh_token);
router.get('/talk_memo', kakao_talk_memo);
router.post('/talk_memo', kakao_talk_memo);

module.exports = router;
