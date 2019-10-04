const express = require('express');
const request = require('request');
const https = require('https');
const router = express.Router();
const crypto = require('crypto');
const debug = require('debug');
const query_string = require('query-string');
const keys = require('./key_getter');

// 향후 파일로 관리할 것
const rest_api_key = keys.rest_api_key;
const client_secret = keys.client_secret;


const kakao_login_debug = debug('kakao_login_debug');
const kakao_login_error = debug('kakao_login_error');
/* GET home page. */
function kakao_login(req, res) {
	set_header_no_cache(res);

	let req_state = req.query.state;
	let session = req.session;

	kakao_login_debug("req_state : " + req_state);
	if(!req_state)
	{
		before_kakao_login_process(req, res, session);
	}
	else
	{
		after_kakao_login_process(req, res, session);
	}
};

function after_kakao_login_process(req, res, session){
	kakao_login_debug('session.state : ' + session.state);
	kakao_login_debug('req.state : ' + req.query.state);
	if(session.state !== req.query.state){
		kakao_login_debug('Session state and Request state are different');
		let error_msg = '잘못된 접근입니다.';
		req.body.error = error_msg;

		res.render('home',{req:req});
	}else{
		delete session.state;
		let code = req.query.code;
			
		kakao_login_debug(code);
			
		get_client_token(code, req, res, (body_client_token) => {
			let client_token_obj = JSON.parse(body_client_token);

			kakao_login_debug("access_token : " + client_token_obj.access_token);
			kakao_login_debug(client_token_obj.token_type);
			kakao_login_debug("refresh_token" + client_token_obj.refresh_token);
			kakao_login_debug(client_token_obj.expires_in);
			kakao_login_debug(client_token_obj.scope);

			session.access_token = client_token_obj.access_token;
			session.refresh_token = client_token_obj.refresh_token;

			res.render('home',{
				req:req,
			});
		});
	}
	
}

function before_kakao_login_process(req, res, session){
	let date = new Date();
	let unix_time_str = '' + date.getTime();
	let state = crypto.createHash('sha512').update(unix_time_str).digest('base64');

	session.state = state;
		
	kakao_login_debug('!req_state : ' + state);
		
	let kakao_authorize_query_str = query_string.stringify({
		client_id:rest_api_key,
		redirect_uri:'https://newsnotifier.halx.tk/kakao_apis/kakao_login',
		state:state,
		response_type:'code'
	});

	let kakao_authorize_uri = 'https://kauth.kakao.com/oauth/authorize?' + kakao_authorize_query_str;
			
	res.redirect(301,kakao_authorize_uri);
}

function set_header_no_cache(res)
{
	res.header('Cache-control', 'no-cache, no-store, must-revalidate');
	res.header('Pragma', 'no-cache');
	res.header('Expires', 0);
}


function get_client_token(code, req, res, end_callback)
{
	let form_data = {
		grant_type:"authorization_code",
		client_id:rest_api_key,
		redirect_uri:'https://newsnotifier.halx.tk/kakao_apis/kakao_login',
		code:code,
		client_secret:client_secret	
	};

	let options = {
		url : 'https://kauth.kakao.com/oauth/token',
		port : 443,
		method : 'POST',
		form : form_data,	
		
		headers:{
			'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
		}
	};

	request(options, (err, res_client_token, body) => {
		kakao_login_debug('res_client_token');
		kakao_login_debug(res_client_token);	
		if(!err && res_client_token.statusCode==200) end_callback(body);
		else{
			kakao_login_error('kakao에 client token을 요청하는 동안 에러가 발생하였습니다.');
			kakao_login_error(err);
			let result_obj = {
				result:'failed',
				msg:'kakao로그인 과정에 에러가 발생하였습니다.'
			}
			res.json(result_obj);
		}
	});


}


module.exports = kakao_login;
