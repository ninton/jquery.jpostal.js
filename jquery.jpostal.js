/*jslint browser:true, devel:true, white:true*/
/*global window, $, jQuery*/

/**
 * jquery.jpostal.js ver2.7
 * 
 * Copyright 2014, Aoki Makoto, Ninton G.K. http://www.ninton.co.jp
 * 
 * Released under the MIT license - http://en.wikipedia.org/wiki/MIT_License
 * 
 * Requirements
 * jquery.js
 */
var JpostalDatabase = function () {
	"use strict";

	var self = {};

	self.address = [];	// database cache
	self.map     = {
	};
	self.url     = {
		'http'  : '//jpostal-1006.appspot.com/json/',
		'https' : '//jpostal-1006.appspot.com/json/'
	};
	
	self.find = function ( i_postcode ) {
		var	address = [];
		
		self.address.forEach(function(eachAddress, ignore) {
			if ( eachAddress[0] === '_' + i_postcode ) {
				address = eachAddress;
			}
		});
		
		return address;
	};
	
	self.get = function ( i_postcode ) {
		//	--------------------------------------------------
		//	i_postcode	find()	find()	result
		//				1234567	123
		//	--------------------------------------------------
		//	1			-		-		defaults
		//	12			-		-		defaults
		//	123			-		Y		find( '123' )
		//	123			-		N		defaults
		//	1234		-		Y		find( '123' )
		//	1234		-		N		defaults
		//	1234567		Y		-		find( '1234567' )
		//	1234567		N		Y		find( '123' )
		//	1234567		N		N		defaults
		//	--------------------------------------------------
		var defaults = ['', '', '', '', '', '', '', '', ''],
			address,
			head3;
		
		switch ( i_postcode.length ) {
			case 3:
			case 4:
			case 5:
			case 6:
				head3 = i_postcode.substr(0, 3);
				address = self.find(head3);
				address = $.extend( defaults, address );
				break;
				
			case 7:
				address = self.find(i_postcode);
				if ( !address ) {
					head3 = i_postcode.substr(0, 3);
					address = self.find(head3);
				}
				address = $.extend( defaults, address );
				break;
			
			default:
				address = defaults;
				break;
		}
		
		return address;
	};

	self.getUrl = function ( i_head3 ) {
		var url = '';
		
		switch ( window.location.protocol ) {
			case 'http:':
				url = self.url.http;
				break;
			
			case 'https:':
				url = self.url.https;
				break;
		}
		url = url + i_head3 + '.json';
		
		return url;
	};

	self.request = function ( i_postcode, i_callback ) {
		var head3,
			url,
			options;

		head3 = i_postcode.substr(0, 3);
		
		if ( i_postcode.length <= 2 || self.getStatus(head3) !== 'none' || head3.match(/\D/) ) {
			return false;
		}
		self.setStatus(head3, 'waiting');
		
		url = self.getUrl( head3 );
		
		options = {
			async         : false,
			dataType      : 'jsonp',
			jsonpCallback : 'jQuery_jpostal_callback',
			type          : 'GET',
			url           : url,
			success       : function() {	// function(i_data, i_dataType
				i_callback();
			},
			error         : function() { // function(i_XMLHttpRequest, i_textStatus, i_errorThrown) {
			},
			timeout : 5000	// msec
		};
		$.ajax( options );
		return true;
	};
	
	self.save = function ( i_data ) {
		i_data.forEach(function(rcd, ignore) {
			var postcode = rcd[0];
			
			if ( self.map[postcode] === undefined ) {
				self.address.push( rcd );
				self.map[postcode] = {state : 'complete', time : 0};
			} else if ( self.map[postcode].state === 'waiting' ) {
				self.address.push( rcd );
				self.map[postcode].state = 'complete';
			}			
		});		
	};

	self.getStatus = function ( i_postcode ) {
		//	--------------------------------------------------
		//	#	['_001']	..state		.time		result
		//	--------------------------------------------------
		//	1	 =undefined	-			-			none
		//	2	!=undefined	'complete'	-			complete
		//	3	!=undefined	'waiting'	<5sec		waiting
		//	4	!=undefined	'waiting'	>=5sec		none
		//	--------------------------------------------------
		var st = '',
			postcode = '_' + i_postcode,
			t_ms;
		
		if ( self.map[postcode] === undefined ) {
			// # 1
			st = 'none';
			
		} else if ( 'complete' === self.map[postcode].state ) {
			// # 2
			st = 'complete';
			
		} else {
			t_ms = (new Date()).getTime() - self.map[postcode].time;
			if ( t_ms < 5000 ) {
				// # 3
				st = 'waiting';
			
			} else {
				// # 4
				st = 'none';
			}
		}
		
		return st;
	};
	
	self.setStatus = function ( i_postcode ) {
		var	postcode = '_' + i_postcode;
		
		if ( self.map[postcode] === undefined ) {
			self.map[postcode] = {
				state : 'waiting',
				time  : 0
			};
		}
		
		self.map[postcode].time = (new Date()).getTime();
	};

	return self;
};

var Jpostal = function ( i_JposDb ) {
	"use strict";

	var self = {};

	self.address  = '';
	self.jposDb   = i_JposDb;
	self.options  = {};
	self.postcode = '';
	self.minLen   = 3;
	
	self.displayAddress = function () {
		if ( self.postcode === '000info') {
			self.address[2] += ' ' + self.getScriptSrc();
		}
		
		Object.keys(self.options.address).forEach(function(key) {
			var format = self.options.address[key];
			var value = self.formatAddress( format, self.address );
			if ( self.isSelectTagForPrefecture( key, format ) ) {
				self.setSelectTagForPrefecture( key, value );
			} else {
				$(key).val( value );
			}			
		});
	};
	
	self.isSelectTagForPrefecture = function( i_key, i_fmt ) {
		// 都道府県のSELECTタグか？
		var f;

		switch ( i_fmt ) {
			case '%3':
			case '%p':
			case '%prefecture':
				if ( $(i_key).get(0).tagName.toUpperCase() === 'SELECT' ) {
					f = true;
				} else {
					f = false;
				}	
				break;

			default:
				f = false;
				break;
		}
		return f;
	};

	self.setSelectTagForPrefecture = function ( i_key, i_value ) {
		var value,
			el;

		// 都道府県のSELECTタグ
		// ケース1: <option value="東京都">東京都</option>
		$(i_key).val(i_value);
		if ( $(i_key).val() === i_value ) {
			return;
		}

		// ケース2: valueが数値(自治体コードの場合が多い)
		//	テキストが「北海道」を含むかどうかで判断する
		//	<option value="01">北海道(01)</option>
		//	<option value="1">1.北海道</option>
		value = '';
		el = $(i_key)[0];
		Object.keys(el.options).forEach(function(i) {
			var p = el.options[i].text.indexOf( i_value );
			if ( 0 <= p ) {
				value = el.options[i].value;
			}
		});

		if ( value !== '' ) {
			$(i_key).val( value );
		}

	};

	self.formatAddress = function ( i_fmt, i_address ) {
		var	s = i_fmt;
		
		s = s.replace( /%3|%p|%prefecture/, i_address[1] );
		s = s.replace( /%4|%c|%city/      , i_address[2] );
		s = s.replace( /%5|%t|%town/      , i_address[3] );
		s = s.replace( /%6|%a|%address/   , i_address[4] );
		s = s.replace( /%7|%n|%name/      , i_address[5] );
		
		s = s.replace( /%8/      , i_address[6] );
		s = s.replace( /%9/      , i_address[7] );
		s = s.replace( /%10/      , i_address[8] );
		
		return s;
	};

	self.getScriptSrc = function () {
		var src = '',
			el_arr;
		
		el_arr = document.getElementsByTagName('script');
		Object.keys(el_arr).forEach(function(key) {
			var el = el_arr[key];
			if ( 0 <= el.src.search(/jquery\.jpostal\.js/) ) {
				src = el.src; 		
			}
		});

		return src;
	};

	self.init = function ( i_options ) {
		if ( i_options.postcode === undefined ) {
			throw new Error('postcode undefined');
		}
		if ( i_options.address === undefined ) {
			throw new Error('address undefined');
		}
		
		self.options.postcode = [];
		if ( typeof i_options.postcode === 'string' ) {
			self.options.postcode.push( i_options.postcode );
		} else {
			self.options.postcode = i_options.postcode;
		}
		
		self.options.address = i_options.address;
		
		if ( i_options.url !== undefined ) {
			self.jposDb.url = i_options.url;
		}
	};
	
	self.main = function () {
		var that,
			f;

		self.scanPostcode();
		if ( self.postcode.length < self.minLen ) {
			// git hub issue #4: 郵便番号欄が0～2文字のとき、住所欄を空欄にせず、入力内容を維持してほしい 
			return ;
		}
		
		that = self;
		f = self.jposDb.request( self.postcode, function () {
			that.callback();
		});
		if ( !f ) {
			self.callback();
		}
	};
	
	self.callback = function () {
		self.address = self.jposDb.get( self.postcode );
		self.displayAddress();
	};

	self.scanPostcode = function () {
		var s = '',
			s3,
			s4;

		switch ( self.options.postcode.length ) {
			case 0:
				break;
			
			case 1:
				//	github issue #8: 1つ目を空欄、2つ目を「001」としても、「001」として北海道札幌市を表示してしまう
				//	----------------------------------------
				//	case	postcode	result
				//	----------------------------------------
				//	1		''			''
				//	1		12			''
				//	2		123			123
				//	2		123-		123
				//	2		123-4		123
				//	3		123-4567	1234567
				//	2		1234		123
				//	4		1234567		1234567
				//	----------------------------------------
				s = String($(self.options.postcode[0]).val());
				if ( 0 <= s.search(/^([0-9]{3})([0-9A-Za-z]{4})/) ) {
					// case 4
					s = s.substr(0, 7);
				} else if ( 0 <= s.search(/^([0-9]{3})-([0-9A-Za-z]{4})/) ) {
					// case 3
					s = s.substr(0, 3) + s.substr(4, 4);
				} else if ( 0 <= s.search(/^([0-9]{3})/) ) {
					// case 2
					s = s.substr(0, 3);
				} else {
					// case 1
					s = '';
				}
				break;
			
			case 2:
				//	github issue #8: 1つ目を空欄、2つ目を「001」としても、「001」として北海道札幌市を表示してしまう
				//	----------------------------------------
				//	case	post1	post2	result
				//	----------------------------------------
				//	1		''		---		''
				//	1		12		---		''
				//	2		123		''		123
				//	2		123		4		123
				//	3		123		4567	1234567
				//	----------------------------------------
				s3 = String($(self.options.postcode[0]).val());
				s4 = String($(self.options.postcode[1]).val());
				if ( 0 <= s3.search(/^[0-9]{3}$/) ) {
					if ( 0 <= s4.search(/^[0-9A-Za-z]{4}$/) ) {
						// case 3
						s = s3 + s4;					
					} else {
						// case 2
						s = s3;
					}
				} else {
					// case 1
					s = '';
				}
				break;
		}
		
		self.postcode = s;
	};

	return self;
};

//	MEMO: For the following reason, JposDb was put on the global scope, not local scope. 
//	---------------------------------------------------------------------
// 	data file	callback			JposDb scope
//	---------------------------------------------------------------------
//	001.js		JposDb.save			global scope
//	001.js.php	$_GET['callback']	local scopde for function($){}
//	---------------------------------------------------------------------
var JposDb = new JpostalDatabase();

var jQuery_jpostal_callback = function ( i_data ) {
	"use strict";

	JposDb.save( i_data );	
};

(function($) {
	"use strict";

	$.fn.jpostal = function( i_options ){
		var Jpos,
			selector;

		Jpos = new Jpostal( JposDb );
		Jpos.init( i_options );
		
		if ( typeof i_options.click === 'string' && i_options.click !== '' ) {
			$(i_options.click).bind('click', function(ignore) {
				Jpos.main();
			});			
		} else {
			selector = Jpos.options.postcode[0];
			$(selector).bind('keyup change', function(ignore) {
				Jpos.main();
			});
			
			if (1 <= Jpos.options.postcode.length) {
				selector = Jpos.options.postcode[1];
				$(selector).bind('keyup change', function(ignore) {
					Jpos.main();
				});
			}
		}
	};
}(jQuery));
