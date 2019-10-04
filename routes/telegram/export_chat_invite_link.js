const telegraf = require('telegraf');

const data = require('../data/data');


// req parameter
// bot_name
// chat_name

function export_chat_invite_link(req, res){
	let result_obj = {};

	const bot_name = req.body.bot_name;
	const chat_name = req.body.chat_name;

	if(bot_name || !chat_name)
	{
			
	}else{
		
		const bot_data = data.telegram.bots[bot_name];
		const token = bot_data.token;
		const chat_id = bot_data.chats[chat_name].id;
		const bot = new telegraf(token);
		
		bot.telegram.exportChatInviteLink(chat_id), (data) => {
			console.log(data);
		}
	}
}


module.exports = export_chat_invite_link;
