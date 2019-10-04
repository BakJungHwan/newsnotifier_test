const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const debug = require('debug');
const query_string = require('query-string');

const fs = require('fs');

const apis_debug = debug('apis_debug');
const apis_error = debug('apis_error');

const naver_news_services = require('./services/naver_news_services');

router.get('/init_session', init_session);
router.post('/execute_search_naver_news_term', execute_search_naver_news_term);
router.post('/stop_search_naver_news_term', stop_search_naver_news_term);

function set_header_no_cache(res)
{
	res.header('Cache-control', 'no-cache, no-store, must-revalidate');
	res.header('Pragma', 'no-cache');
	res.header('Expires', 0);
}


function init_session(req,res){
	set_header_no_cache(res);

	res.header('Content-Type', 'application/json');
	let result = 'success';
	let msg = '세션 초기화를 성공하였습니다.';

	try{
		req.session.destroy();
	}catch(e)
	{
		apis_error('Error occured destroying session');
		result = 'failed';
		msg = '세션 초기화에 실패하였습니다.'
	}
	res.json({
		result:result,
		msg:msg
	});
};

// 향후 DB로 이전 필요
const search_news_interval_ids=[];

async function execute_search_naver_news_term(req,res)
{
	const result_obj = {result:'failed'};

	const query = req.body.query.split(',');
	const search_term_num = req.body.search_term_num;
	const period_word = req.body.period_word;
	let miseconds_period = search_term_num * 1000;
	
	switch(period_word)
	{
		case 'hours':
			miseconds_period = miseconds_priod * 60 * 60;
			break;
		case 'minutes':
			miseconds_period = miseconds_period * 60;
			break;
		case 'seconds':
			break;
		default:
			let msg = '잘못된 시간단위가 입력되었습니다.';
			result_obj.msg = msg;
			api_debug(msg);
			
			res.json(result_obj);
			return;
	}

	let search_news_options = {
		query:val, 
		display:100,
		start:1,
	};

	naver_news_services.search_news_term(search_news_options,search_term_num,period_word);

	/*
	let id = setInterval(() => {
		naver_news_services.search_news_term(search_news_options,search_term_num,period_word);
	},miseconds_period);
	search_news_interval_ids.push(id);
	*/

	result_obj.result='success';
	result_obj.msg='뉴스알리미가 정상적으로 실행되었습니다.';
	res.json(result_obj);
}



async function register_search_naver_news_term(req,res)
{
	const result_obj = {result:'failed'};

	const query = req.body.query.split(',');
	const search_term_num = req.body.search_term_num;
	const period_word = req.body.period_word;
	let miseconds_period = search_term_num * 1000;
	
	switch(period_word)
	{
		case 'hours':
			miseconds_period = miseconds_priod * 60 * 60;
			break;
		case 'minutes':
			miseconds_period = miseconds_period * 60;
			break;
		case 'seconds':
			break;
		default:
			let msg = '잘못된 시간단위가 입력되었습니다.';
			result_obj.msg = msg;
			api_debug(msg);
			
			res.json(result_obj);
			return;
	}

	let search_news_options = {
		query:val, 
		display:100,
		start:1,
	};

	naver_news_services.search_news_term(search_news_options,search_term_num,period_word);

	/*
	let id = setInterval(() => {
		naver_news_services.search_news_term(search_news_options,search_term_num,period_word);
	},miseconds_period);
	search_news_interval_ids.push(id);
	*/

	result_obj.result='success';
	result_obj.msg='뉴스알리미가 정상적으로 실행되었습니다.';
	res.json(result_obj);
}






// 수정 필요
function stop_search_naver_news_term(req,res)
{
	const result_obj = {result:'failed'};

	apis_debug('search_news_interval_ids.length : ' + search_news_interval_ids.length);
	apis_debug('stopping interval tasks');
	const cleared_interval_ids = [];

	search_news_interval_ids.forEach((val,index)=>{
		clearInterval(val);
		cleared_interval_ids.push(val);
	});

	apis_debug('length of stoped interval tasks : ', cleared_interval_ids.length);
	cleared_interval_ids.forEach((val,index)=>{
		search_news_interval_ids.splice(search_news_interval_ids.indexOf(val),1);
	});
	apis_debug('init search_news_interval_ids');

	result_obj.result = 'success';
	result_obj.msg = '뉴스알리미가 정상적으로 작동을 멈췄습니다.';
	res.json(result_obj);
}

module.exports = router;