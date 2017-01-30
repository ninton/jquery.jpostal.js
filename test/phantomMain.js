/*jslint browser:true, devel:true*/
/*global phantom, WebPage*/
"use strict";

var page = new WebPage();
page.onConsoleMessage = function (msg) {
    console.log(msg);
    phantom.exit(0);
};
page.open(phantom.args[0], function (status) {
    if (status !== "success") {
        console.log("failed to open file");
        phantom.exit(1);
    }
});
