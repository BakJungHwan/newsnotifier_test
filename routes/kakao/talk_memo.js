const request = require('request');
const debug = require('debug');
const query_string = require('query-string');

const kakao_talk_memo_debug = debug('kakao_talk_memo_debug');
const kakao_talk_memo_error = debug('kakao_talk_memo_error');

function kakao_talk_memo(req, res)
{
	let talk_memo_result = {};
	if(!req.session.access_token)
	{
		talk_memo_result.result = 'failed';
		talk_memo_result.msg = '문자전송을 위한 토큰 정보가 없습니다. 카카오 로그인을 먼저 해주세요.';
		res.json(talk_memo_result);
	}
	else
	{
		let access_token = req.session.access_token;

		let text_msg = req.body.text_msg;
		kakao_talk_memo_debug('text_msg');
		kakao_talk_memo_debug(text_msg);

		let template_objectObj = {	
				object_type:'text',
				text:text_msg,
				link:{
					'web_url':'https://developers.kakao.com',
					'mobile_web_url':'daum.net'
				},
				button_title:'abcde'
			}

		let template_objectStr = JSON.stringify(template_objectObj);

		let options = {
			url:'https://kapi.kakao.com/v2/api/talk/memo/default/send',
			method:'POST',

			headers:{
				"Content_Type":'x-www-form-urlencoded;charset=UTF-8',
				"Authorization":"Bearer " + access_token
			},
			form:{
				template_object:template_objectStr
			}
		}
	
		kakao_talk_memo_debug(options);
		request(options, (error, res_talk_memo, body) => {
			kakao_talk_memo_debug('callback');


			kakao_talk_memo_debug(res_talk_memo.statusCode);

			if(!error && res_talk_memo.statusCode==200)
			{
				try{
					let body_obj = JSON.parse(body);
					kakao_talk_memo_debug('body_obj:');
					kakao_talk_memo_debug(body_obj);
					kakao_talk_memo_debug("talk_memo_result_code : " + body_obj.result_code);
					kakao_talk_memo_debug("body.result_code==0 : " + (body_obj.result_code==0));
				
					if(body_obj.result_code==0){
						talk_memo_result.result='success';				
					}else{
						talk_memo_result.result='failed';
						kakao_talk_memo_error('카카오톡 나에게 보내기 작업을 실패하였습니다.');
						kakao_talk_memo_error(body_obj);
					}
				}catch(err)
				{
					kakao_talk_memo_error('카카오톡 나에게 보내기 요청 중에 에러가 발생하였습니다.');
					kakao_talk_memo_error(err);
				}finally{
					res.json(talk_memo_result);
				}
			}
		});
	}
}

module.exports = kakao_talk_memo;
