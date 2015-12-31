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
function JpostalDatabase ( i_options ) {
	this.address = [];	// database cache
	this.map     = {
	};
	this.url     = {
		'http'  : '//jpostal-1006.appspot.com/json/',
		'https' : '//jpostal-1006.appspot.com/json/',
	};
	
	this.find = function ( i_postcode ) {
		var	address = [];
		
		for ( var i = 0; i < this.address.length; ++i ) {
			if ( this.address[i][0] == '_' + i_postcode ) {
				address = this.address[i];
			}
		}
		
		return address;
	};
	
	this.get = function ( i_postcode ) {
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
		var defaults = ['', '', '', '', '', '', '', '', ''];
		var	address;
		var	head3;
		
		switch ( i_postcode.length ) {
			case 3:
			case 4:
			case 5:
			case 6:
				head3 = i_postcode.substr(0, 3);
				address = this.find(head3);
				address = $.extend( defaults, address );
				break;
				
			case 7:
				address = this.find(i_postcode);
				if ( !address ) {
					head3 = i_postcode.substr(0, 3);
					address = this.find(head3);
				}
				address = $.extend( defaults, address );
				break;
			
			default:
				address = defaults;
				break;
		}
		
		return address;
	};

	this.getUrl = function ( i_head3 ) {
		var url = '';
		
		switch ( window.location.protocol ) {
			case 'http:':
				url = this.url['http'];
				break;
			
			case 'https:':
				url = this.url['https'];
				break;
		}
		url = url + i_head3 + '.json';
		
		return url;
	};

	this.request = function ( i_postcode, i_callback ) {
		var _this = this;
		var head3 = i_postcode.substr(0, 3);
		
		if ( i_postcode.length <= 2 || this.getStatus(head3) != 'none' || head3.match(/[^0-9]/) ) {
			return false;
		}
		this.setStatus(head3, 'waiting');
		
		var url = this.getUrl( head3 );
		
		var options = { 
			async         : false,
			dataType      : 'jsonp',
			jsonpCallback : 'jQuery_jpostal_callback',
			type          : 'GET',
			url           : url,
			success       : function(i_data, i_dataType) {
				i_callback();
			},
			error         : function(i_XMLHttpRequest, i_textStatus, i_errorThrown) {
			},
			timeout : 5000	// msec
		};
		$.ajax( options );
		return true;
	};
	
	this.save = function ( i_data ) {
		for ( var i = 0; i < i_data.length; ++i ) {
			var	rcd = i_data[i];
			var postcode = rcd[0];
			
			if ( typeof this.map[postcode] == 'undefined' ) {
				this.address.push( rcd );
				this.map[postcode] = {state : 'complete', time : 0};
			} else if ( this.map[postcode].state == 'waiting' ) {
				this.address.push( rcd );
				this.map[postcode].state = 'complete';
			}
		}
	};

	this.getStatus = function ( i_postcode ) {
		//	--------------------------------------------------
		//	#	['_001']	..state		.time		result
		//	--------------------------------------------------
		//	1	 =undefined	-			-			none
		//	2	!=undefined	'complete'	-			complete
		//	3	!=undefined	'waiting'	<5sec		waiting
		//	4	!=undefined	'waiting'	>=5sec		none
		//	--------------------------------------------------
		var st = '';
		var	postcode = '_' + i_postcode;
		
		if ( typeof this.map[postcode] == 'undefined' ) {
			// # 1
			st = 'none';
			
		} else if ( 'complete' == this.map[postcode].state ) {
			// # 2
			st = 'complete';
			
		} else {
			var t_ms = (new Date()).getTime() - this.map[postcode].time;
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
	
	this.setStatus = function ( i_postcode ) {
		var	postcode = '_' + i_postcode;
		
		if ( typeof this.map[postcode] == 'undefined' ) {
			this.map[postcode] = {
				state : 'waiting',
				time  : 0
			};
		}
		
		this.map[postcode].time = (new Date()).getTime();
	};

}

function Jpostal ( i_JposDb ) {
	this.address  = '';
	this.jposDb   = i_JposDb;
	this.options  = {};
	this.postcode = '';
	this.minLen   = 3;
	
	this.displayAddress = function () {
		if ( this.postcode == '000info') {
			this.address[2] += ' ' + this.getScriptSrc();
		}
		
		for ( var key in this.options.address ) {
			var s = this.formatAddress( this.options.address[key], this.address );
			if ( this.isSelectTagForPrefecture( key, this.options.address[key] ) ) {
				this.setSelectTagForPrefecture( key, s );
			} else {
				$(key).val( s );
			}
		}
	};
	
	this.isSelectTagForPrefecture = function( i_key, i_fmt ) {
		// 都道府県のSELECTタグか？
		switch ( i_fmt ) {
			case '%3':
			case '%p':
			case '%prefecture':
				if ( $(i_key).get(0).tagName.toUpperCase() == 'SELECT' ) {
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
	}

	this.setSelectTagForPrefecture = function ( i_key, i_value ) {
		// 都道府県のSELECTタグ
		// ケース1: <option value="東京都">東京都</option>
		$(i_key).val(i_value);
		if ( $(i_key).val() == i_value ) {
			return;
		}

		// ケース2: valueが数値(自治体コードの場合が多い)
		//	テキストが「北海道」を含むかどうかで判断する
		//	<option value="01">北海道(01)</option>
		//	<option value="1">1.北海道</option>
		value = '';
		var el = $(i_key)[0];
		for ( var i = 0; i < el.options.length; ++i ) {
			var p = el.options[i].text.indexOf( i_value );
			if ( 0 <= p ) {
				value = el.options[i].value;
				break;
			}
		}

		if ( value != '' ) {
			$(i_key).val( value );
		}

	}

	this.formatAddress = function ( i_fmt, i_address ) {
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

	this.getScriptSrc = function () {
		var src = '';
		
		var	el_arr = document.getElementsByTagName('script');
		for ( var i = 0; i < el_arr.length; ++i ) {
			if ( 0 <= el_arr[i].src.search(/jquery.jpostal.js/) ) {
				src = el_arr[i].src; 		
			}
		}

		return src;
	}

	this.init = function ( i_options ) {
		
		if ( typeof i_options.postcode == 'undefined' ) {
			throw new Error('postcode undefined');
		}
		if ( typeof i_options.address == 'undefined' ) {
			throw new Error('address undefined');
		}
		
		this.options.postcode = [];
		if ( typeof i_options.postcode == 'string' ) {
			this.options.postcode.push( i_options.postcode );
		} else {
			this.options.postcode = i_options.postcode;
		}
		
		this.options.address = i_options.address;
		
		if ( typeof i_options.url != 'undefined' ) {
			this.jposDb.url = i_options.url;
		}
	};
	
	this.main = function () {
		this.scanPostcode();
		if ( this.postcode.length < this.minLen ) {
			// git hub issue #4: 郵便番号欄が0～2文字のとき、住所欄を空欄にせず、入力内容を維持してほしい 
			return ;
		}
		
		var _this = this;
		var f = this.jposDb.request( this.postcode, function () {
			_this.callback();
		});
		if ( !f ) {
			this.callback();
		}
	};
	
	this.callback = function () {
		this.address = this.jposDb.get( this.postcode );
		this.displayAddress();
	};

	this.scanPostcode = function () {
		var s = '';
		
		switch ( this.options.postcode.length ) {
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
				s = String($(this.options.postcode[0]).val());
				if ( 0 <= s.search(/^([0-9]{3})([0-9A-Za-z]{4})/) ) {
					// case 4
					s = RegExp.$1 + '' +  RegExp.$2;
				} else if ( 0 <= s.search(/^([0-9]{3})-([0-9A-Za-z]{4})/) ) {
					// case 3
					s = RegExp.$1 + '' +  RegExp.$2;
				} else if ( 0 <= s.search(/^([0-9]{3})/) ) {
					// case 2
					s = RegExp.$1;
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
				var s3 = String($(this.options.postcode[0]).val());
				var s4 = String($(this.options.postcode[1]).val());
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
		
		this.postcode = s;
	};	
}

//	MEMO: For the following reason, JposDb was put on the global scope, not local scope. 
//	---------------------------------------------------------------------
// 	data file	callback			JposDb scope
//	---------------------------------------------------------------------
//	001.js		JposDb.save			global scope
//	001.js.php	$_GET['callback']	local scopde for function($){}
//	---------------------------------------------------------------------
var JposDb = new JpostalDatabase();

function jQuery_jpostal_callback( i_data ) {
	JposDb.save( i_data );
}

(function($) {
	$.fn.jpostal = function( i_options ){
		var Jpos = new Jpostal( JposDb );
		Jpos.init( i_options );
		
		if ( typeof i_options.click == 'string' && i_options.click != '' ) {
			$(i_options.click).bind('click', function(e) {
				Jpos.main();
			});			
		} else {
			for ( var i = 0; i < Jpos.options.postcode.length; ++i ) {
				var selector = Jpos.options.postcode[i];
				$(selector).bind('keyup change', function(e) {
					Jpos.main();
				});
			}
		}
	};
})(jQuery);
