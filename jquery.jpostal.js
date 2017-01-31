/*jslint browser:true, devel:true */
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
var Jpostal = {};

Jpostal.Database = function () {
    "use strict";

    this.address = [];    // database cache
    this.map     = {};
    this.url     = {
        'http'  : '//jpostal-1006.appspot.com/json/',
        'https' : '//jpostal-1006.appspot.com/json/'
    };
};

Jpostal.Database.prototype.find = function (i_postcode) {
    "use strict";

    var address = [];

    this.address.forEach(function (eachAddress) {
        if (eachAddress[0] === '_' + i_postcode) {
            address = eachAddress;
        }
    });

    return address;
};

Jpostal.Database.prototype.get = function (i_postcode) {
    "use strict";

    //    --------------------------------------------------
    //    i_postcode    find()    find()    result
    //                1234567    123
    //    --------------------------------------------------
    //    1             -        -        defaults
    //    12            -        -        defaults
    //    123           -        Y        find( '123' )
    //    123           -        N        defaults
    //    1234          -        Y        find( '123' )
    //    1234          -        N        defaults
    //    1234567       Y        -        find( '1234567' )
    //    1234567       N        Y        find( '123' )
    //    1234567       N        N        defaults
    //    --------------------------------------------------
    var defaults = ['', '', '', '', '', '', '', '', ''],
        address,
        head3;

    switch (i_postcode.length) {
    case 3:
    case 4:
    case 5:
    case 6:
        head3 = i_postcode.substr(0, 3);
        address = this.find(head3);
        address = $.extend(defaults, address);
        break;

    case 7:
        address = this.find(i_postcode);
        if (address.length === 0) {
            head3 = i_postcode.substr(0, 3);
            address = this.find(head3);
        }
        address = $.extend(defaults, address);
        break;

    default:
        address = defaults;
        break;
    }

    return address;
};

Jpostal.Database.prototype.getUrl = function (i_head3) {
    "use strict";

    var url = '';

    switch (this.getProtocol()) {
    case 'http:':
        url = this.url.http;
        break;

    case 'https:':
        url = this.url.https;
        break;
    }
    url = url + i_head3 + '.json';

    return url;
};

Jpostal.Database.prototype.request = function (i_postcode, i_callback) {
    "use strict";

    var head3,
        url,
        options;

    head3 = i_postcode.substr(0, 3);

    if (i_postcode.length <= 2 || this.getStatus(head3) !== 'none' || head3.match(/\D/)) {
        return false;
    }
    this.setStatus(head3, 'waiting');

    url = this.getUrl(head3);

    options = {
        async         : false,
        dataType      : 'jsonp',
        jsonpCallback : 'jQuery_jpostal_callback',
        type          : 'GET',
        url           : url,
        success       : function () {    // function(i_data, i_dataType
            i_callback();
        },
        timeout : 5000    // msec
    };
    this.ajax(options);
    return true;
};

Jpostal.Database.prototype.ajax = function (options) {
    "use strict";

    $.ajax(options);
};

Jpostal.Database.prototype.save = function (i_data) {
    "use strict";

    var that = this;

    i_data.forEach(function (rcd) {
        var postcode = rcd[0];

        if (that.map[postcode] === undefined) {
            that.address.push(rcd);
            that.map[postcode] = {state : 'complete', time : 0};
        } else if (that.map[postcode].state === 'waiting') {
            that.address.push(rcd);
            that.map[postcode].state = 'complete';
        }
    });
};

Jpostal.Database.prototype.getStatus = function (i_postcode) {
    "use strict";

    //    --------------------------------------------------
    //    #    ['_001']    ..state        .time        result
    //    --------------------------------------------------
    //    1     =undefined    -            -            none
    //    2    !=undefined    'complete'    -           complete
    //    3    !=undefined    'waiting'    <5sec        waiting
    //    4    !=undefined    'waiting'    >=5sec       none
    //    --------------------------------------------------
    var st = '',
        postcode = '_' + i_postcode,
        t_ms;

    if (this.map[postcode] === undefined) {
        // # 1
        st = 'none';

    } else if ('complete' === this.map[postcode].state) {
        // # 2
        st = 'complete';

    } else {
        t_ms = this.getTime() - this.map[postcode].time;
        if (t_ms < 5000) {
            // # 3
            st = 'waiting';

        } else {
            // # 4
            st = 'none';
        }
    }

    return st;
};

Jpostal.Database.prototype.setStatus = function (i_postcode) {
    "use strict";

    var postcode = '_' + i_postcode;

    if (this.map[postcode] === undefined) {
        this.map[postcode] = {
            state : 'waiting',
            time  : 0
        };
    }

    this.map[postcode].time = this.getTime();
};

Jpostal.Database.prototype.getProtocol = function () {
    "use strict";

    return window.location.protocol;
};

Jpostal.Database.prototype.getTime = function () {
    "use strict";

    return (new Date()).getTime();
};

(function () {
    "use strict";

    var instance;

    Jpostal.Database.getInstance = function () {
        if (instance === undefined) {
            instance = new Jpostal.Database();
        }
        return instance;
    };
}());

Jpostal.Jpostal = function (i_JposDb) {
    "use strict";

    this.address  = '';
    this.jposDb   = i_JposDb;
    this.options  = {};
    this.postcode = '';
    this.minLen   = 3;
};

Jpostal.Jpostal.prototype.displayAddress = function () {
    "use strict";

    var that = this;

    if (this.postcode === '000info') {
        this.address[2] += ' ' + this.getScriptSrc();
    }

    Object.keys(this.options.address).forEach(function (key) {
        var format = that.options.address[key],
            value = that.formatAddress(format, that.address);

        if (that.isSelectTagForPrefecture(key, format)) {
            that.setSelectTagForPrefecture(key, value);
        } else {
            $(key).val(value);
        }
    });
};

Jpostal.Jpostal.prototype.isSelectTagForPrefecture = function (i_key, i_fmt) {
    "use strict";

    // 都道府県のSELECTタグか？
    var f;

    switch (i_fmt) {
    case '%3':
    case '%p':
    case '%prefecture':
        if ($(i_key).get(0).tagName.toUpperCase() === 'SELECT') {
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

Jpostal.Jpostal.prototype.setSelectTagForPrefecture = function (i_key, i_value) {
    "use strict";

    var value,
        el;

    // 都道府県のSELECTタグ
    // ケース1: <option value="東京都">東京都</option>
    $(i_key).val(i_value);
    if ($(i_key).val() === i_value) {
        return;
    }

    // ケース2: valueが数値(自治体コードの場合が多い)
    //    テキストが「北海道」を含むかどうかで判断する
    //    <option value="01">北海道(01)</option>
    //    <option value="1">1.北海道</option>
    value = '';
    el = $(i_key)[0];
    Object.keys(el.options).forEach(function (i) {
        var p = String(el.options[i].text).indexOf(i_value);
        if (0 <= p) {
            value = el.options[i].value;
        }
    });

    if (value !== '') {
        $(i_key).val(value);
    }

};

Jpostal.Jpostal.prototype.formatAddress = function (i_fmt, i_address) {
    "use strict";

    var    s = i_fmt;

    s = s.replace(/%3|%p|%prefecture/, i_address[1]);
    s = s.replace(/%4|%c|%city/,       i_address[2]);
    s = s.replace(/%5|%t|%town/,       i_address[3]);
    s = s.replace(/%6|%a|%address/,    i_address[4]);
    s = s.replace(/%7|%n|%name/,       i_address[5]);

    s = s.replace(/%8/,  i_address[6]);
    s = s.replace(/%9/,  i_address[7]);
    s = s.replace(/%10/, i_address[8]);

    return s;
};

Jpostal.Jpostal.prototype.getScriptSrc = function () {
    "use strict";

    var src = '',
        el_arr,
        i,
        n,
        el_src;

    el_arr = document.getElementsByTagName('script');
    n = el_arr.length;
    for (i = 0; i < n; i += 1) {
        el_src = el_arr[i].src;
        if (0 <= el_src.indexOf("jquery.jpostal.js")) {
            src = el_src;
            break;
        }
    }

    return src;
};

Jpostal.Jpostal.prototype.init = function (i_options) {
    "use strict";

    if (i_options.postcode === undefined) {
        throw new Error('postcode undefined');
    }
    if (i_options.address === undefined) {
        throw new Error('address undefined');
    }

    this.options.postcode = [];
    if (typeof i_options.postcode === 'string') {
        this.options.postcode.push(i_options.postcode);
    } else {
        this.options.postcode = i_options.postcode;
    }

    this.options.address = i_options.address;

    if (i_options.url !== undefined) {
        this.jposDb.url = i_options.url;
    }
};

Jpostal.Jpostal.prototype.main = function () {
    "use strict";

    var that,
        f;

    this.scanPostcode();
    if (this.postcode.length < this.minLen) {
        // git hub issue #4: 郵便番号欄が0～2文字のとき、住所欄を空欄にせず、入力内容を維持してほしい 
        return;
    }

    that = this;
    f = this.jposDb.request(this.postcode, function () {
        that.callback();
    });
    if (!f) {
        this.callback();
    }
};

Jpostal.Jpostal.prototype.callback = function () {
    "use strict";

    this.address = this.jposDb.get(this.postcode);
    this.displayAddress();
};

Jpostal.Jpostal.prototype.scanPostcode = function () {
    "use strict";

    var s = '',
        s3,
        s4;

    switch (this.options.postcode.length) {
    case 0:
        break;

    case 1:
        //    github issue #8: 1つ目を空欄、2つ目を「001」としても、「001」として北海道札幌市を表示してしまう
        //    ----------------------------------------
        //    case    postcode    result
        //    ----------------------------------------
        //    1        ''            ''
        //    1        12            ''
        //    2        123           123
        //    2        123-          123
        //    2        123-4         123
        //    3        123-4567      1234567
        //    2        1234          123
        //    4        1234567       1234567
        //    ----------------------------------------
        s = String($(this.options.postcode[0]).val());
        if (0 <= s.search(/^([0-9]{3})([0-9A-Za-z]{4})/)) {
            // case 4
            s = s.substr(0, 7);
        } else if (0 <= s.search(/^([0-9]{3})-([0-9A-Za-z]{4})/)) {
            // case 3
            s = s.substr(0, 3) + s.substr(4, 4);
        } else if (0 <= s.search(/^([0-9]{3})/)) {
            // case 2
            s = s.substr(0, 3);
        } else {
            // case 1
            s = '';
        }
        break;

    case 2:
        //    github issue #8: 1つ目を空欄、2つ目を「001」としても、「001」として北海道札幌市を表示してしまう
        //    ----------------------------------------
        //    case    post1    post2    result
        //    ----------------------------------------
        //    1        ''        ---        ''
        //    1        12        ---        ''
        //    2        123        ''        123
        //    2        123        4         123
        //    3        123        4567      1234567
        //    ----------------------------------------
        s3 = String($(this.options.postcode[0]).val());
        s4 = String($(this.options.postcode[1]).val());
        if (0 <= s3.search(/^[0-9]{3}$/)) {
            if (0 <= s4.search(/^[0-9A-Za-z]{4}$/)) {
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

//    MEMO: For the following reason, JposDb was put on the global scope, not local scope.
//    ---------------------------------------------------------------------
//     data file    callback            JposDb scope
//    ---------------------------------------------------------------------
//    001.js        JposDb.save            global scope
//    001.js.php    $_GET['callback']    local scopde for function($){}
//    ---------------------------------------------------------------------
var jQuery_jpostal_callback = function (i_data) {
    "use strict";

    Jpostal.Database.getInstance().save(i_data);
};

(function ($) {
    "use strict";

    $.fn.jpostal = function (i_options) {
        var Jpos,
            selector;

        Jpos = new Jpostal.Jpostal(Jpostal.Database.getInstance());
        Jpos.init(i_options);

        if (typeof i_options.click === 'string' && i_options.click !== '') {
            $(i_options.click).bind('click', function () {
                Jpos.main();
            });
        } else {
            selector = Jpos.options.postcode[0];
            $(selector).bind('keyup change', function () {
                Jpos.main();
            });

            if (1 <= Jpos.options.postcode.length) {
                selector = Jpos.options.postcode[1];
                $(selector).bind('keyup change', function () {
                    Jpos.main();
                });
            }
        }
    };
}(jQuery));
