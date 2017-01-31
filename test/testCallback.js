/*jslint nomen: true*/
/*global YUI, $*/
/*global Jpostal, jQuery_jpostal_callback*/

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
            name: "Jspotal.jQuery_jpostal_callback",

            "jQuery_jpostal_callback: function": function () {
                areSame("function", typeof jQuery_jpostal_callback);
            },

            "save: 1st": function () {
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

                // verify before
                areSame([], db.find("100"));
                areSame([], db.find("1000001"));

                // do
                data = [
                    ["_100", "東京都", "千代田区", "", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", ""],
                    ["_1000001", "東京都", "千代田区", "千代田", "", "", "ﾄｳｷｮｳﾄ", "ﾁﾖﾀﾞｸ", "ﾁﾖﾀﾞ"]
                ];
                jQuery_jpostal_callback(data);

                // verify after
                areSame(data[0], db.find("100"));
                areSame(data[1], db.find("1000001"));
                areSame([],      db.find("1000002"));

                // teardown
                db.getProtocol = getProtocol;
            }
        }));

        (new Y.Test.Console({newestOnTop: false})).render("#log");

        Y.Test.Runner.run();
    });
