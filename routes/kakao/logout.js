const express = require('express');
const request = require('request');
const router = express.Router();
const debug = require('debug');

const kakao_logout_debug = debug('kakao_logout_debug');
const kakao_logout_error = debug('kakao_logout_error');

function kakao_logout(req, res){

	let access_token = req.session.access_token;
	kakao_logout_debug('access_token : ' + access_token);

/*	
	let options = {
		hostname:'kapi.kakao.com',
		path:'/v1/user/logout',
		port:443,
		method:'POST',

		headers:{
			"Authorization": "Bearer " + access_token
		}
	}


	let req_logout = https.request(options, (res_logout) => {
		let body_res_logout = [];
		
		res_logout.on('data', (data) => {
			body_res_logout.push(data);
		});

		res_logout.on('end', () => {
			
			kakao_logout_debug('res_logout : ' + body_res_logout);

			let logout_obj = JSON.parse(body_res_logout);
			let logout_result = {};
			
			if(logout_obj.id){
				logout_result.result='success';
				req.session.destroy();
				logout_result.msg = '카카오 로그아웃에 성공하였습니다.';			
			}else{
				logout_result.result='failed';
				logout_result.msg = '카카오 로그아웃을 실패하였습니다.';
				if(logout_obj.msg){
					kakao_logout_error('카카오 로그아웃 실패, 아래의 카카오에서 온 응답을 찹고하세요 ');
					kakao_logout_error(logout_obj.msg);
				}else{
					kakao_logout_error("예상치 못한 응답수신");
					kakao_logout_error(logout_obj);
				}
			}
			res.json(logout_result);
			
		});
	});
	req_logout.end();
*/

	let options = {
		url:'https://kapi.kakao.com/v1/user/logout',
		port:443,
		method:'POST',

		headers:{
			"Authorization": "Bearer " + access_token
		}
	}

	request(options, (err, res_logout, body) => {
		kakao_logout_debug('res_logout : ' + body);

		let logout_obj = JSON.parse(body);
		let logout_result = {};
			
		if(logout_obj.id){
			logout_result.result='success';
			req.session.destroy();
			logout_result.msg = '카카오 로그아웃에 성공하였습니다.';			
		}else{
			logout_result.result='failed';
			logout_result.msg = '카카오 로그아웃을 실패하였습니다.';
			if(logout_obj.msg){
				kakao_logout_error('카카오 로그아웃 실패, 아래의 카카오에서 온 응답을 찹고하세요 ');
				kakao_logout_error(logout_obj.msg);
			}else{
				kakao_logout_error("예상치 못한 응답수신");
				kakao_logout_error(logout_obj);
			}
		}
		res.json(logout_result);
			
		});
}


module.exports = kakao_logout;
