function JpostalDatabase ( i_options ) {
	this.address = {};	// database cache
	
	this.get = function ( i_postcode ) {
		var defaults = ['', '', '', '', ''];
		var	address;
		
		switch ( i_postcode.length ) {
			case 3:
				address = $.extend( defaults, this.address['_' + i_postcode]);
				break;
				
			case 4:
			case 5:
			case 6:
				var head3 = i_postcode.substr(0, 3);
				address = $.extend( defaults, this.address['_' + head3]);
				break;
				
			case 7:
				var head3 = i_postcode.substr(0, 3);
				address = $.extend( defaults, this.address['_' + head3]);
				address = $.extend( address , this.address['_' + i_postcode]);
				break;
			
			default:
				address = defaults;
				break;
		}
		
		return address;
	};

	this.isRequested = function ( i_postcode ) {
		var f = false;
		var head3 = i_postcode.substr(0, 3);
		
		if ( typeof this.address['_' + head3] != 'undefined' ) {
			f = true;
		} else {
			f = false;
		}
		
		return f;
	};
	
	this.request = function ( i_postcode ) {
		var _this = this;
		var head3 = i_postcode.substr(0, 3);
		
		if ( i_postcode.length <= 2 || this.isRequested(head3) || head3.match(/[^0-9]/) ) {
			return ;
		}
		
		var options = { 
			async         : false,
			dataType      : 'jsonp',
			jsonp         : false,
			jsonpCallback : '',
			type          : 'GET',
			url           : '//localhost/jquery.jpostal.js/jpostal_json/' + head3 + '.json',
			error         : function(i_XMLHttpRequest, i_textStatus, i_errorThrown) {
				;
			},
			timeout : 5000	// msec
		};
		$.ajax( options );
	};
	
	this.save = function ( i_data ) {
		for ( var postcode in i_data ) {
			this.address[postcode] = i_data[postcode];
		}
	};
}

function Jpostal ( i_JposDb ) {
	this.address  = '';
	this.jposDb   = i_JposDb;
	this.options  = {};
	this.postcode = '';
	
	this.displayAddress = function () {
		for ( var key in this.options.address ) {
			var s = this.formatAddress( this.options.address[key], this.address );
			$(key).val( s );
		}
	};
	
	this.formatAddress = function ( i_fmt, i_address ) {
		var	s = i_fmt;
		
		s = s.replace( /%3|%p|%prefecture/, i_address[0] );
		s = s.replace( /%4|%c|%city/      , i_address[1] );
		s = s.replace( /%5|%t|%town/      , i_address[2] );
		
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
	};
	
	this.main = function () {
		this.scanPostcode();
		this.jposDb.request( this.postcode );
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

(function($) {
	$.fn.jpostal = function( i_options ){
		var Jpos = new Jpostal( JposDb );
		Jpos.init( i_options );
		
		for ( var i = 0; i < Jpos.options.postcode.length; ++i ) {
			var selector = Jpos.options.postcode[i];
			$(selector).bind('keyup change', function() {
				Jpos.main();
			});
		}
	};
})(jQuery);
