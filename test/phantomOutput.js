/*global YUI*/

YUI().add("phantomjs", function (Y) {
    "use strict";

    var TR;
    if (console !== undefined) {
        TR = Y.Test.Runner;
        TR.subscribe(TR.COMPLETE_EVENT, function (obj) {
            console.log(Y.Test.Format.JUnitXML(obj.results));
        });
    }
});
