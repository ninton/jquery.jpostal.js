/**
 * jquery.jpostal.js
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
		'_000' : { state : 'complete', time : 0 }
	};
	this.url     = {
		'http'  : '//jpostal.googlecode.com/svn/trunk/json/',
		'https' : '//jpostal.googlecode.com/svn/trunk/json/',
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
		var defaults = ['', '', '', '', ''];
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
		for ( var key in this.options.address ) {
			var s = this.formatAddress( this.options.address[key], this.address );
			$(key).val( s );
		}
	};
	
	this.formatAddress = function ( i_fmt, i_address ) {
		var	s = i_fmt;
		
		s = s.replace( /%3|%p|%prefecture/, i_address[1] );
		s = s.replace( /%4|%c|%city/      , i_address[2] );
		s = s.replace( /%5|%t|%town/      , i_address[3] );
		s = s.replace( /%6|%a|%address/   , i_address[4] );
		s = s.replace( /%7|%n|%name/      , i_address[5] );
		
		return s;
	};

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
				s = $(this.options.postcode[0]).val();
				break;
			
			case 2:
				s = $(this.options.postcode[0]).val() + $(this.options.postcode[1]).val()
				break;
		}

		s = s.replace( /-/, '' );
		
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
