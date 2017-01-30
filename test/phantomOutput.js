/*jslint */
/*global YUI*/
"use strict";

YUI().add("phantomjs", function (Y) {
    var TR;
    if (console !== undefined) {
        TR = Y.Test.Runner;
        TR.subscribe(TR.COMPLETE_EVENT, function (obj) {
            console.log(Y.Test.Format.JUnitXML(obj.results));
        });
    }
});
