const express = require('express');
const request = require('request');
const router = express.Router();
const debug = require('debug');

const kakao_unlink_debug = debug('kakao_unlink_debug');
const kakao_unlink_error = debug('kakao_unlink_error');

function kakao_unlink(req, res){

	let access_token = req.session.access_token;
	kakao_unlink_debug('access_token : ' + access_token);
	
	let options = {
		url : 'https://kapi.kakao.com/v1/user/unlink',
		port:443,
		method:'POST',

		headers:{
			"Authorization": "Bearer " + access_token
		}
	}

	request(options, (err, res_unlink, body_res_unlink) => {
		req.session.destroy();
		let unlink_obj = JSON.parse(body_res_unlink);
		let unlink_result = {};

		kakao_unlink_debug("unlink_obj");
		kakao_unlink_debug(unlink_obj);

		if(unlink_obj.id){
			unlink_result.result='success';
			unlink_result.msg = unlink_obj.msg;
		}else{
			unlink_result.result='failed';
			unlink_result.msg='카카오 unlink를 실패하였습니다.';
			if(unlink_obj.msg){
				kakao_unlink_error("카카오unlink 실패, 카카오로부터 응답은 아래 출력  참조 ");	
				kakao_unlink_error(unlink_obj);
			}else{
				kakao_unlink_error("예상치 못한 카카오 unlink 응답 수신, 자세한 내용은 로그 참고 ");
				kakao_unlink_error(unlink_obj);
			}
		}
		res.json(unlink_result);
	});
}

module.exports = kakao_unlink;
