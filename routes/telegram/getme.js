const express = require('express');
const router = express.Router();
const debug = require('debug');

const telegram_getMe_debug = debug('telegram_getMe_debug');
const telegram_getMe_error = debug('telegram_getMe_error');

const telegraf = require('telegraf');

const data = require('../data/data');

const halxNewsNotifierBot = data.telegram.bots.halxNewsNotifierBot;
const bot = new telegraf(halxNewsNotifierBot.token);

function telegram_getMe(req, res){
	bot.telegram.getMe().then(function(data){
			telegram_getMe_debug(data);
			res.json(data);
		}
	).catch(function(err){
		telegram_getMe_error(err);
	});	
}


module.exports = telegram_getMe;
