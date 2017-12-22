/*jslint browser: true, devel: true */
/*global YUI, $, Jpostal*/

YUI({logInclude: {TestRunner: true}}).use("test", "console", "test-console", "phantomjs",
    function (Y) {
        "use strict";

        var areSameArray,
            areSameObject,
            areSame,
            Mock,
            array_unique,
            newJpostal;

        areSameArray = function (expected, actual) {
            Y.Assert.areSame(expected.length, actual.length);

            expected.forEach(function (value, i) {
                areSame(value, actual[i]);
            });
        };

        array_unique = function (arr) {
            var map = {},
                i = 0,
                n = 0,
                result = [];

            n = arr.length;
            for (i = 0; i < n; i += 1) {
                map[arr[i]] = 1;
            }

            result = Object.keys(map);
            return result;
        };

        areSameObject = function (expected, actual) {
            var keys = [];
            keys = keys.concat(Object.keys(expected), Object.keys(actual));
            keys = array_unique(keys);

            keys.forEach(function (key) {
                if (!expected.hasOwnProperty(key) && !actual.hasOwnProperty(key)) {
                    return;
                }

                areSame(expected[key], actual[key]);
            });
        };

        areSame = function (expected, actual) {
            if (typeof expected !== "object") {
                Y.Assert.areSame(expected, actual);
            } else {
                if (expected.length === undefined) {
                    areSameObject(expected, actual);
                } else {
                    areSameArray(expected, actual);
                }
            }
        };

        newJpostal = function (database) {
            return new Jpostal.Jpostal(database);
        };

        Mock = function () {
            this.wasCalled = false;
        };
        Mock.prototype.mock = function () {
            this.wasCalled = true;
        };

        Y.Test.Runner.add(new Y.Test.Case({
            name: "Jspotal.Jspotal",

            "Jspotal: opject": function () {
                areSame("function", typeof Jpostal.Jpostal);

                var jpos = newJpostal();
                areSame("object", typeof jpos);

                areSame("function", typeof jpos.displayAddress);
                areSame("function", typeof jpos.isSelectTagForPrefecture);
                areSame("function", typeof jpos.setSelectTagForPrefecture);
                areSame("function", typeof jpos.formatAddress);
                areSame("function", typeof jpos.getScriptSrc);
                areSame("function", typeof jpos.init);
                areSame("function", typeof jpos.main);
                areSame("function", typeof jpos.callback);
                areSame("function", typeof jpos.scanPostcode);
            },

            "displayAddress: positive": function () {
                var jpos;

                // setup
                jpos = newJpostal();
                jpos.options = {
                    postcode : [
                        '#postcode1',
                        '#postcode2'
                    ],
                    address : {
                        '#address1'  : '%3',
                        '#address2'  : '%4',
                        '#address3'  : '%5',
                        '#address4'  : '%6',
                        '#address5'  : '%7',
                        '#address1_kana'  : '%8',
                        '#address2_kana'  : '%9',
                        '#address3_kana'  : '%10'
                    }
                };

                // do
                jpos.postcode = "1000001";
                jpos.address = ["_1000001", "東京都", "千代田区", "千代田", "xxx", "yyy", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"];
                jpos.displayAddress();

                // verify
                areSame("東京都",   document.getElementById("address1").value);
                areSame("千代田区",  document.getElementById("address2").value);
                areSame("千代田",    document.getElementById("address3").value);
                areSame("xxx",      document.getElementById("address4").value);
                areSame("yyy",      document.getElementById("address5").value);
                areSame("ﾄｳｷｮｳﾄ",   document.getElementById("address1_kana").value);
                areSame("ﾁﾖﾀﾞｸ",    document.getElementById("address2_kana").value);
                areSame("ﾁﾖﾀﾞ",     document.getElementById("address3_kana").value);
            },

            "isSelectTagForPrefecture: positive": function () {
                var jpos;

                jpos = newJpostal();

                areSame(true, jpos.isSelectTagForPrefecture("#address1", "%3"));
                areSame(false, jpos.isSelectTagForPrefecture("#address1", "%4"));
                areSame(false, jpos.isSelectTagForPrefecture("#address2", "%3"));
            },

            "setSelectTagForPrefecture: positive": function () {
                var jpos;

                jpos = newJpostal();

                jpos.setSelectTagForPrefecture("#address1", "東京都");
                areSame("東京都", document.getElementById("address1").value);

                jpos.setSelectTagForPrefecture("#address1_b", "東京都");
                areSame("13", document.getElementById("address1_b").value);
            },

            "formatAddress: positive": function () {
                var jpos,
                    address;

                jpos = newJpostal();
                address = ["_1000001", "東京都", "千代田区", "千代田", "xxx", "yyy", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"];

                areSame("東京都",   jpos.formatAddress("%3", address));
                areSame("千代田区", jpos.formatAddress("%4", address));
                areSame("千代田",   jpos.formatAddress("%5", address));
                areSame("xxx",     jpos.formatAddress("%6", address));
                areSame("yyy",     jpos.formatAddress("%7", address));
                areSame("ﾄｳｷｮｳﾄ",  jpos.formatAddress("%8", address));
                areSame("ﾁﾖﾀﾞｸ",   jpos.formatAddress("%9", address));
                areSame("ﾁﾖﾀﾞ",    jpos.formatAddress("%10", address));
            },

            "getScriptSrc: positive": function () {
                var jpos,
                    actual;

                jpos = newJpostal();
                actual = jpos.getScriptSrc();
                areSame(true, 0 <= actual.indexOf("jquery.jpostal.js"));
            },

            "init: positive": function () {
                var jpos;

                jpos = newJpostal(Jpostal.Database.getInstance());

                [
                    {
                        options: {
                            postcode: "#postcode1",
                            address: {
                                "#address1": "%3",
                                "#address2": "%4",
                                "#address3": "%5"
                            }
                        },
                        expected: {
                            postcode: [
                                "#postcode1"
                            ],
                            address: {
                                "#address1": "%3",
                                "#address2": "%4",
                                "#address3": "%5"
                            },
                            trigger: {}
                        }
                    }
                ].forEach(function (data) {
                    jpos.init(data.options);
                    areSame(data.expected, jpos.options);
                });
            },

            "main: in cache": function () {
                var jpos,
                    jposDb,
                    ajax,
                    mockAjax;

                // setup
                jposDb = Jpostal.Database.getInstance();
                jposDb.address = [
                    ["_1000001", "東京都", "千代田区", "千代田", "xxx", "yyy", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"]
                ];
                jposDb.map = {
                    "_100":      {state: "complete", time: 0},
                    "_1000001" : {state: "complete", time: 0}
                };

                jpos = newJpostal(jposDb);
                jpos.init({
                    postcode: "#postcode1",
                    address: {
                        "#address1": "%3",
                        "#address2": "%4",
                        "#address3": "%5"
                    }
                });

                // mock setup
                ajax = jposDb.ajax;

                mockAjax = new Mock();
                jposDb.ajax = function () {
                    mockAjax.mock();
                };

                // do
                document.getElementById("postcode1").value = "1000001";
                jpos.main();

                // verify
                areSame(false, mockAjax.wasCalled);
                areSame("東京都",   document.getElementById("address1").value);
                areSame("千代田区", document.getElementById("address2").value);
                areSame("千代田",   document.getElementById("address3").value);

                // teardown
                jposDb.ajax = ajax;
            },

            "main: no cache": function () {
                var jpos,
                    jposDb,
                    ajax,
                    mockAjax;

                // setup
                jposDb = Jpostal.Database.getInstance();
                jposDb.address = [];
                jposDb.map = [];

                jpos = newJpostal(jposDb);
                jpos.init({
                    postcode: "#postcode1",
                    address: {
                        "#address1": "%3",
                        "#address2": "%4",
                        "#address3": "%5"
                    }
                });

                // mock setup
                ajax = jposDb.ajax;

                mockAjax = new Mock();
                jposDb.ajax = function () {
                    mockAjax.mock();
                };

                // do
                document.getElementById("postcode1").value = "1000001";
                jpos.main();

                // verify
                areSame(true, mockAjax.wasCalled);

                // teardown
                jposDb.ajax = ajax;
            },

            "callback: positive": function () {
                var jpos,
                    jposDb;

                jposDb = Jpostal.Database.getInstance();
                jposDb.address = [
                    ["_1000001", "東京都", "千代田区", "千代田", "xxx", "yyy", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"]
                ];

                jpos = newJpostal(jposDb);
                jpos.init({
                    postcode: "#postcode1",
                    address: {
                        "#address1": "%3",
                        "#address2": "%4",
                        "#address3": "%5"
                    }
                });
                jpos.postcode = "1000001";

                jpos.callback();

                areSame(["_1000001", "東京都", "千代田区", "千代田", "xxx", "yyy", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"], jpos.address);
                areSame("東京都",   document.getElementById("address1").value);
                areSame("千代田区", document.getElementById("address2").value);
                areSame("千代田",   document.getElementById("address3").value);
            },

            "scanPostcode: one field": function () {
                var jpos;

                jpos = newJpostal();
                jpos.options.postcode = [
                    "#postcode1"
                ];

                [
                    {postcode1: "",         expected: ""},
                    {postcode1: "1",        expected: ""},
                    {postcode1: "12",       expected: ""},
                    {postcode1: "123",      expected: "123"},
                    {postcode1: "123-",     expected: "123"},
                    {postcode1: "123-4",    expected: "123"},
                    {postcode1: "123-45",   expected: "123"},
                    {postcode1: "123-456",  expected: "123"},
                    {postcode1: "123-4567", expected: "1234567"},
                    {postcode1: "1234",     expected: "123"},
                    {postcode1: "12345",    expected: "123"},
                    {postcode1: "123456",   expected: "123"},
                    {postcode1: "1234567",  expected: "1234567"}
                ].forEach(function (data) {
                    // do
                    document.getElementById("postcode1").value = data.postcode1;
                    jpos.scanPostcode();

                    // verify
                    areSame(data.expected, jpos.postcode);
                });
            },

            "scanPostcode: two fields": function () {
                var jpos = newJpostal();
                jpos.options.postcode = [
                    "#postcode1",
                    "#postcode2"
                ];

                [
                    {postcode1: "",    postcode2: "",     expected: ""},
                    {postcode1: "1",   postcode2: "",     expected: ""},
                    {postcode1: "12",  postcode2: "",     expected: ""},
                    {postcode1: "123", postcode2: "",     expected: "123"},
                    {postcode1: "123", postcode2: "4",    expected: "123"},
                    {postcode1: "123", postcode2: "45",   expected: "123"},
                    {postcode1: "123", postcode2: "456",  expected: "123"},
                    {postcode1: "123", postcode2: "4567", expected: "1234567"}
                ].forEach(function (data) {
                    // do
                    document.getElementById("postcode1").value = data.postcode1;
                    document.getElementById("postcode2").value = data.postcode2;
                    jpos.scanPostcode();

                    // verify
                    areSame(data.expected, jpos.postcode);
                });
            }

        }));

        (new Y.Test.Console({newestOnTop: false})).render("#log");

        Y.Test.Runner.run();
    });
