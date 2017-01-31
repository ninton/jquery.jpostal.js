/*jslint nomen: true*/
/*global YUI, $, Jpostal*/

YUI({logInclude: {TestRunner: true}}).use("test", "console", "test-console", "phantomjs",
    function (Y) {
        "use strict";

        var areSameArray,
            areSameObject,
            areSame,
            Mock;

        areSameArray = function (expected, actual) {
            Y.Assert.areSame(expected.length, actual.length);

            expected.forEach(function (value, i) {
                areSame(value, actual[i]);
            });
        };

        areSameObject = function (expected, actual) {
            Object.keys(expected).forEach(function (key) {
                if (!expected.hasOwnProperty(key)) {
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

        Mock = function () {
            this.wasCalled = false;
        };
        Mock.prototype.mock = function () {
            this.wasCalled = true;
        };

        Y.Test.Runner.add(new Y.Test.Case({
            name: "Jspotal.Database",

            "Database: function": function () {
                areSame("function", typeof Jpostal.Database);
            },

            "getInstance: function": function () {
                areSame("function", typeof Jpostal.Database.getInstance);
            },

            "instance: object": function () {
                var db = Jpostal.Database.getInstance();
                areSame("object", typeof db);
            },

            "find: function": function () {
                var db = Jpostal.Database.getInstance();
                areSame("function", typeof db.find);
            },

            "find: positive": function () {
                var db,
                    getProtocol,
                    data;

                // setup
                db = Jpostal.Database.getInstance();
                getProtocol = db.getProtocol;
                db.getProtocol = function () {
                    return "http:";
                };
                db.map = {};

                // do
                data = [
                    ["_100", "東京都", "千代田区", "", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", ""],
                    ["_1000001", "東京都", "千代田区", "千代田", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"]
                ];
                db.address = data;

                // verify
                areSame(data[0], db.find("100"));
                areSame(data[1], db.find("1000001"));
                areSame([],      db.find("1000002"));

                // teardown
                db.getProtocol = getProtocol;
            },

            "get: function": function () {
                var db = Jpostal.Database.getInstance();
                areSame("function", typeof db.get);
            },

            "get: positive": function () {
                var db,
                    getProtocol,
                    data;

                // setup
                db = Jpostal.Database.getInstance();
                getProtocol = db.getProtocol;
                db.getProtocol = function () {
                    return "http:";
                };
                db.map = {};

                // do
                data = [
                    ["_100", "東京都", "千代田区", "", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", ""],
                    ["_1000001", "東京都", "千代田区", "千代田", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"]
                ];
                db.address = data;

                // verify
                areSame(data[0], db.get("100"));
                areSame(data[0], db.get("1001"));
                areSame(data[0], db.get("10012"));
                areSame(data[0], db.get("100123"));

                areSame(data[1], db.get("1000001"));

                areSame(data[0], db.get("1000002"));

                // teardown
                db.getProtocol = getProtocol;
            },

            "getUrl: function": function () {
                var db = Jpostal.Database.getInstance();
                areSame("function", typeof db.getUrl);
            },

            "getUrl: http": function () {
                var db,
                    getProtocol,
                    actual;

                // setup
                db = Jpostal.Database.getInstance();
                getProtocol = db.getProtocol;
                db.getProtocol = function () {
                    return "http:";
                };

                // do
                actual = db.getUrl("123");

                // verify
                areSame("//jpostal-1006.appspot.com/json/123.json", actual);

                // teardown
                db.getProtocol = getProtocol;
            },

            "request: function": function () {
                var db = Jpostal.Database.getInstance();
                areSame("function", typeof db.request);
            },

            "save: function": function () {
                var db = Jpostal.Database.getInstance();
                areSame("function", typeof db.save);
            },

            "save: 1st": function () {
                var db,
                    data;

                // setup
                db = Jpostal.Database.getInstance();
                db.map = {};
                db.address = [];

                // do
                data = [
                    ["_100", "東京都", "千代田区", "", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", ""],
                    ["_1000001", "東京都", "千代田区", "千代田", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"]
                ];
                db.save(data);

                // verify
                areSame(data, db.address);
                areSame({state: "complete", time: 0}, db.map._100);
                areSame({state: "complete", time: 0}, db.map._1000001);

                // teardown
            },

            "save: 2nd": function () {
                var db,
                    data,
                    expected;

                // setup
                db = Jpostal.Database.getInstance();
                db.map = {_100: {state: "complete", time: 0}};
                expected = [
                    ["_100", "東京都", "千代田区", "", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", ""],
                    ["_1000001", "東京都", "千代田区", "千代田", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"]
                ];
                db.address = expected;

                // do
                data = [
                    ["_100", "xxx東京都", "千代田区", "", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", ""],
                    ["_1000001", "xxx東京都", "千代田区", "千代田", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"]
                ];
                db.save(data);

                // verify
                areSame(expected, db.address);
                areSame({state: "complete", time: 0}, db.map._100);
                areSame({state: "complete", time: 0}, db.map._1000001);

                // teardown
            },

            "save: waiting": function () {
                var db,
                    data;

                // setup
                db = Jpostal.Database.getInstance();
                db.map = {_100: {state: "waiting", time: 0}};
                db.address = [];

                // do
                data = [
                    ["_100", "xxx東京都", "千代田区", "", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", ""],
                    ["_1000001", "xxx東京都", "千代田区", "千代田", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"]
                ];
                db.save(data);

                // verify
                areSame(data, db.address);
                areSame({state: "complete", time: 0}, db.map._100);
                areSame({state: "complete", time: 0}, db.map._1000001);

                // teardown
            },

            "getStatus: function": function () {
                var db = Jpostal.Database.getInstance();
                areSame("function", typeof db.getStatus);
            },

            "getStatus: positive": function () {
                var db,
                    getTime,
                    t;

                // setup
                db = Jpostal.Database.getInstance();
                getTime = db.getTime;
                t = 10000;
                db.getTime = function () {
                    return t;
                };

                // do and verify
                db.map = {};
                areSame("none", db.getStatus("100"));

                db.map = {_100: {state: "complete"}};
                areSame("complete", db.getStatus("100"));

                db.map = {_100: {state: "waiting", time: 5001 }};
                areSame("waiting", db.getStatus("100"));

                db.map = {_100: {state: "waiting", time: 5000 }};
                areSame("none", db.getStatus("100"));

                // teardown
                db.getTime = getTime;
            },

            "setStatus: function": function () {
                var db = Jpostal.Database.getInstance();
                areSame("function", typeof db.setStatus);
            },

            "setStatus: positive": function () {
                var db,
                    getTime,
                    t;

                // setup
                db = Jpostal.Database.getInstance();
                getTime = db.getTime;
                t = 1485796135123;
                db.getTime = function () {
                    return t;
                };

                // do
                db.setStatus("1230001");

                // verify
                areSame({state: "waiting", time: 1485796135123}, db.map._1230001);

                // teardown
                db.getTime = getTime;
            }
        }));

        (new Y.Test.Console({newestOnTop: false})).render("#log");

        Y.Test.Runner.run();
    });
