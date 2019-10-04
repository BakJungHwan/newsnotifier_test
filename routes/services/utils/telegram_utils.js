const telegraf = require('telegraf');
const debug = require('debug');
const data = require('../../data/data');

const telegram_utils_debug = debug('telegram_utils_debug');
const telegram_utils_error = debug('telegram_utils_error')

const utils = {
	sendMessage : async (bot_name, chat_name, text) => {
		telegram_utils_debug('bot_name :' + bot_name);
		telegram_utils_debug('chat_name :' + chat_name);
		telegram_utils_debug('text:' + text);

		let bot_data = data.telegram.bots[bot_name];

		let bot = new telegraf(bot_data.token);

		try{
			let sendMessage_res =  await bot.telegram.sendMessage(bot_data.chats[chat_name].id,text,{parse_mode:'HTML'})
			telegram_utils_debug(res_data);
		}catch(err){
			telegram_utils_error(err);
		}
	}
}

module.exports = utils;