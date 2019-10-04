const querystring = require('querystring');
const rp = require('request-promise');

const moment = require('moment');
const moment_timezone = require('moment-timezone');

const debug = require('debug');
const naver_news_services_debug = debug('naver_news_services_debug');
const naver_news_services_error = debug('naver_news_services_error');

const data = require('../data/data');
const Naver_Client_Id = data.naver.Naver_Client_Id;
const Naver_Client_Secret = data.naver.Naver_Client_Secret;

const telegram_utils = require('./utils/telegram_utils');


// settings
const search_term_num = 7;
const period_word = 'minutes';

const naver_news_services = {

	// DB연동 필요
	latestPubDate_previous_search:'',

	search_news : async (query, display, start, sort) => {
		let qs_data = {
			query:query,
			display:display,
			start:start,
			sort:sort
		}

		let req_newssearch_options = {
			url:"https://openapi.naver.com/v1/search/news.json",
			method:'GET',
			qs:qs_data,
			headers:{
				'X-Naver-Client-Id':Naver_Client_Id,
				'X-Naver-Client-Secret':Naver_Client_Secret
			}
		}

		try{
			let body = await rp(req_newssearch_options);
			let body_obj = JSON.parse(body);
			return body_obj;
		}catch(err)
		{
			naver_news_services_error('naver에 news검색을 요청하는 과정에서 에러가 발생하였습니다.');
			naver_news_services_error(err);
			throw new Error('news검색 중에 에러가 발생하였습니다.');
		}
	},

	search_news_term : async (search_news_options,search_term_num, period_word) => {

		// latestPubDate_previous_search는 향후에 DB에서 마지막 검색 기사를 기반으로 가져오면 된다.
		let standard_time = this.latestPubDate_previous_search || moment().tz('asia/seoul').subtract(search_term_num,period_word);
		let news_items = await get_every_news_before_standard_time(search_news_options, standard_time, []);

		let query = search_news_options.query;

		naver_news_services_debug('search_news_term is called');
		naver_news_services_debug('search_news_options:');
		naver_news_services_debug(search_news_options);
		naver_news_services_debug('search_term_num: ' + search_term_num + '       period_word: ' + period_word);
		naver_news_services_debug('search_news_term - return news_items')
		naver_news_services_debug(news_items);

		if(news_items.length > 0)
		{
			let latestPubDate = moment(news_items[0].pubDate).tz('asia/seoul');
			this.latestPubDate_previous_search = latestPubDate;
			naver_news_services_debug('비교 기준 시간(현시간 대비 설정한 시간 전) :	' + standard_time);
			naver_news_services_debug('검색된 기사 중 가장 빠른 게시시간:			' + moment(latestPubDate).tz('asia/seoul'));
			naver_news_services_debug('비교 기준 시간 < 가장 빠른 게시시간:		' + (standard_time < latestPubDate));
		
			let korPeriod = getKorPeriod(period_word);
		
			if(standard_time < latestPubDate)
			{
				let context = standard_time.format("MM월 DD일, HH:mm") + "부터 약 "+ search_term_num + korPeriod + "사이\n<b>'" + query + "'</b> 검색어로\n<b>'네이버'</b>에서 검색된 새로운 뉴스입니다.";
				telegram_utils.sendMessage("halxNewsNotifierBot", "testAlarm", context);
				send_news_items_to_telegram("halxNewsNotifierBot","testAlarm",news_items);
			}else{
				let context = standard_time.format("MM월 DD일, HH:mm") + "부터 약 "+ search_term_num + korPeriod + "사이\n<b>'" + query + "'</b> 검색어로\n<b>'네이버'</b>에서 검색된 새로운 뉴스가 없습니다.";
				telegram_utils.sendMessage("halxNewsNotifierBot", "testAlarm", context);
			}
		}
		else{
			let context = standard_time.format("MM월 DD일, HH:mm") + "부터 약 "+ search_term_num + korPeriod + "사이\n<b>'" + query + "'</b> 검색어로\n<b>'네이버'</b>에서 검색된 새로운 뉴스가 없습니다.";
			telegram_utils.sendMessage("halxNewsNotifierBot", "testAlarm", context);
		}

	},
}

async function get_every_news_before_standard_time(search_news_options, standard_time, acc_items)
{
	let query = search_news_options.query;
	let display = search_news_options.display;
	let start = search_news_options.start;

	let body_obj = await naver_news_services.search_news(query, display, start, 'date');
	let items = body_obj.items;
	items.forEach((val,index)=>{
		naver_news_services_debug(val.pubDate);
	});

	let news_index_last_new_pubDate = get_items_index_last_new_pubDate(items, standard_time);
	naver_news_services_debug(news_index_last_new_pubDate);

	if(news_index_last_new_pubDate==-1){
		return acc_items;
	}
	else if(news_index_last_new_pubDate!=99)
	{
		return acc_items.concat(items.slice(0,news_index_last_new_pubDate+1));
	}else{
		acc_items = acc_items.concat(items);
		if(start>1000) return acc_items;
		else{
			search_news_options.start = start + display;
			return get_every_news_before_standard_time(search_news_options, standard_time, acc_items);
		}
	}
}


function get_items_index_last_new_pubDate(items,standard_time){
	let start_item_pubDate = moment(items[0].pubDate).tz('asia/seoul');

	naver_news_services_debug('standard_time:'+standard_time);
	naver_news_services_debug('start_item:'+start_item_pubDate);
	naver_news_services_debug('start_item_pubDate < standard_time : ' + (start_item_pubDate < standard_time));

	if(start_item_pubDate < standard_time) return -1;
	let start = 0;
	let end = items.length-1;
	while(start<end){
		let mid = parseInt((start+end+1)/2);
		let mid_item_pubDate = moment(items[mid].pubDate).tz('asia/seoul');
		if(mid_item_pubDate >= standard_time) start = mid;
		else end = mid-1;		
	}
	return end;	
}

function getKorPeriod(period_word)
{
	let korPeriod;
	switch(period_word)
	{
		case 'hour':
		case 'hours':
			korPeriod = '시간';
			break;
		case 'second':
		case 'seconds':
			korPeroid = '초';
			break;
		case 'day':
		case 'days':
			korPeroid = '일';
			break;
		case 'minutes':
		default:
			korPeriod = '분';
	}
	return korPeriod;
}

function send_news_items_to_telegram(bot_name, chat_name, news_items)
{
	news_items.forEach((val,index)=>{
		let context = 
			"ID : 향후 DB와 연동\n" + 
			moment(val.pubDate).tz('asia/seoul').format("MM월 DD일, HH:mm") + "\n" +
			"<a href='" + val.link + "'>" + val.link + "</a>\n";
						
		telegram_utils.sendMessage(bot_name, chat_name, context);
	});
}

module.exports = naver_news_services;