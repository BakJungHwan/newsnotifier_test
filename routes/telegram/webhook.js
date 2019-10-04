const request = require('request');
const debug = require('debug');
const telegraf = require('telegraf');

const telegram_webhook_debug = debug('telegram_webhook_debug');
const telegram_webhook_error = debug('telegram_webhook_error');

const data = require('../data/data');

const halxNewsNotifierBot = data.telegram.bots.halxNewNotifierBot;
const telegram_url = 'https://api.telegram.org/bot'

function telegram_webhook(req,res,next){
	telegram_webhook_debug('webHook go');

	const bot = new telegraf(halxNewsNotifierBot.token);

	try{
		const body = req.body		
		telegram_webhook_debug('body:');
		telegram_webhook_debug(body);

		const { message } = req.body;
		if(message)
		{
			telegram_webhook_debug('message:');
			telegram_webhook_debug(message);
			let reply = 'Welcome to telegram halx bot';
	
			if(message.text.toLowerCase().indexOf("hi")!==-1)
			{
				reply = 'hi!';
				bot.telegram.sendMessage(message.chat.id,reply);
			}
			if(message.text.toLowerCase().indexOf("check")!== -1)
			{		
				reply = 'no check!!';
				bot.telegram.sendMessage(message.chat.id,reply);
			}
		}
	}catch(err)
	{
		telegram_web_hook_error('error is occured when webhook send message object');
		telegram_web_hook_error(err);
	}finally{
		res.end();
	}

}


module.exports = telegram_webhook;
