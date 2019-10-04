const express = require('express');
const request = require('request');
const router = express.Router();
const debug = require('debug');
const keys = require('./key_getter');

const kakao_refresh_token_debug = debug('kakao_refresh_token_debug');
const kakao_refresh_token_error = debug('kakao_refresh_token_error');

const rest_api_key = keys.rest_api_key;
const client_secret = keys.client_secret;

function kakao_refresh_token(req,res) {		
	kakao_refresh_token_debug(req.session);
	let refresh_token = req.session.refresh_token;

	let form_data = {
		grant_type:"refresh_token",
		client_id:rest_api_key,
		client_secret:client_secret,
		refresh_token:refresh_token
	};

	let options = {
		url:'https://kauth.kakao.com/oauth/token',
		method:'POST',
		port:443,
		form:form_data,
		headers:{
			"Content-type":"application/x-www-form-urlencoded;charset=utf-8"
		}
	};

	request(options, (err, res_refresh, body_res_refresh) => {
		let refresh_result = {};

		try{
			kakao_refresh_token_debug(body_res_refresh);
			let refresh_obj = JSON.parse(body_res_refresh);
			kakao_refresh_token_debug(refresh_obj);

			if(refresh_obj.error)
			{
				kakao_refresh_token_error(refresh_obj);
				throw new Error('카카오에 토큰 갱신 요청 중 에러, 자세한 내용은 로그 참고');
			}
			refresh_result.result = 'success';
			req.session.access_token = refresh_obj.access_token;

			if(req.session.refresh_token)
				req.session.refresh_token = refresh_obj.refresh_token;
			}catch(err)
			{
				kakao_refresh_token_error(err);
				refresh_result.result = 'failed';
				refresh_result.msg = '토큰 갱신 중에 에러가 발생하였습니다.';
			}finally{
				res.json(refresh_result);
			}
		});
}


module.exports = kakao_refresh_token;
