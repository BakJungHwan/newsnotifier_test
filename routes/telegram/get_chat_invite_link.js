const telegraf = require('telegraf');

const debug = require('debug');
const telegram_get_chat_invite_link_debug = debug('telegram_get_chat_invite_link_debug');
const telegram_get_chat_invite_link_error = debug('telegram_get_chat_invite_link_error');

const data = require('../data/data');

// req param
// bot_name
// chat_name
function get_chat_invite_link(req, res){

	const result_obj = {result:'failed'};

	const bot_name = req.body.bot_name;
	const chat_name = req.body.chat_name;
	
	if(!bot_name || !chat_name){
		result_obj.msg = '요청 파라미터가 부족합니다.';
		telegram_get_chat_invite_link_debug('request객체의 body에\nbot_name:'+ bot_name + '\nchat_name:' + chat_name + '\n이 전달되어 초청링크를 요청할 수 없습니다.');
		res.json(result_obj);
	}
	else{
		const bot_data = data.telegram.bots[bot_name];
		if(!bot_data)
		{
			result_obj.msg = '존재하지 않는 bot의 이름이 전달되었습니다.';
			telegram_get_chat_invite_link_debug('서버 data에 존재하지 않는 bot_name이 전달되었습니다.');		
			res.json(result_obj);
		}else{
			const chat_data = bot_data.chats[chat_name];
			telegram_get_chat_invite_link_debug('chat_data: ' + chat_data);
			if(!chat_data){
				result_obj.msg = '존재하지 않는 chat의 이름이 전달되었습니다.';
				telegram_get_chat_invite_link_debug('서버 data에 존재하지 않는 chat_name이 전달되었습니다.');		
				res.json(result_obj);						
			}else{
				const bot = new telegraf(bot_data.token);
				const chat_id = chat_data.id;
	
				bot.telegram.getChat(chat_id)
				.then( (chat) => {
					const invite_link = chat.invite_link;
					if(!invite_link){
						result_obj.msg = '초청 링크가존재하지 않습니다. 초청링크가 생성되었는지 확인바랍니다.';
						telegram_get_chat_invite_link_debug('초청링크가 생성되지 않았습니다.');
					}else{			
						result_obj.result = 'success';
						result_obj.msg = '초청링크를 성공적으로 획득했습니다.';
						result_obj.invite_link = invite_link;
					}
					res.json(result_obj);
				})
				.catch( (err) => {
					telegram_get_chat_invite_link_error('초청링크를 요청하는 동안 에러가 발생하였습니다.');
					telegram_get_chat_invite_link_error('err:');
					telegram_get_chat_invite_link_error(err);
					result_obj.msg = '초청링크 요청 중에 에러가 발생하였습니다. 시스템 관리자에게 문의하시기 바랍니다.';
					res.json(result_obj);
				});
			}
		}
		
	}
}

module.exports = get_chat_invite_link;
