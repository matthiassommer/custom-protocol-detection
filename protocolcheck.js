/**
 * Detect whether a custom protocol is available in browser (FF, Chrome, IE8-11, Edge).
 */
 (function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        let g;
        if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }
        g.protocolCheck = f();
    }
})(function () {
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    const a = typeof require === "function" && require;
                    if (!u && a) { return a(o, !0); }
                    if (i) { return i(o, !0); }
                    const f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f;
                }
                const l = n[o] = { exports: {} };
                t[o][0].call(l.exports, (e) => {
                    const n = t[o][1][e];
                    return s(n ? n : e);
                }, l, l.exports, e, t, n, r);
            }
            return n[o].exports;
        }
        const i = typeof require === "function" && require;
        for (let o = 0; o < r.length; o++) {
            s(r[o]);
        }
        return s;
    })({
        1: [function (_, module, __) {
            function _registerEvent(target, eventType, cb) {
                if (target.addEventListener) {
                    target.addEventListener(eventType, cb);
                    return {
                        remove: () => {
                            target.removeEventListener(eventType, cb);
                        },
                    };
                } else {
                    target.attachEvent(eventType, cb);
                    return {
                        remove: () => {
                            target.detachEvent(eventType, cb);
                        },
                    };
                }
            }

            function _createHiddenIframe(target, uri) {
                const iframe = document.createElement("iframe");
                iframe.src = uri;
                iframe.id = "hiddenIframe";
                iframe.style.display = "none";
                iframe.sandbox = true;
                target.appendChild(iframe);

                return iframe;
            }

            function openUriWithHiddenFrame(uri, failCb, successCb) {
                const timeout = setTimeout(() => {
                    failCb();
                    handler.remove();
                }, 6000);

                let iframe = document.querySelector("#hiddenIframe");
                if (!iframe) {
                    iframe = _createHiddenIframe(document.body, "about:blank");
                }

                const handler = _registerEvent(window, "blur", onBlur);

                function onBlur() {
                    clearTimeout(timeout);
                    handler.remove();
                    successCb();
                }

                iframe.contentWindow.location.href = uri;
            }

            function openUriWithTimeoutHack(uri, failCb, successCb) {
                const timeout = setTimeout(() => {
                    failCb();
                    handler.remove();
                }, 6000);

                //handle page running in an iframe (blur must be registered with top level window)
                let target = window;
                while (target !== target.parent) {
                    target = target.parent;
                }

                const handler = _registerEvent(target, "blur", onBlur);

                function onBlur() {
                    clearTimeout(timeout);
                    handler.remove();
                    successCb();
                }

                window.location = uri;
            }

            function openUriUsingFirefox(uri, failCb, successCb) {
                let iframe = document.querySelector("#hiddenIframe");
                if (!iframe) {
                    iframe = _createHiddenIframe(document.body, "about:blank");
                }

                try {
                    iframe.contentWindow.location.href = uri;
                    setTimeout(() => {
                        try {
                            if (iframe.contentWindow.location.protocol === "about:") {
                                successCb();
                            } else {
                                failCb();
                            }
                        } catch (e) {
                            if (e.name === "NS_ERROR_UNKNOWN_PROTOCOL" || e.name === "NS_ERROR_FAILURE" || e.name === "SecurityError") {
                                failCb();
                            }
                        }
                    }, 500);
                } catch (e) {
                    if (e.name === "NS_ERROR_UNKNOWN_PROTOCOL" || e.name === "NS_ERROR_FAILURE" || e.name === "SecurityError") {
                        failCb();
                    }
                }
            }

            function openUriUsingIEInOlderWindows(uri, failCb, successCb) {
                if (getInternetExplorerVersion() === 10) {
                    openUriUsingIE10InWindows7(uri, failCb, successCb);
                } else if (getInternetExplorerVersion() === 9 || getInternetExplorerVersion() === 11) {
                    openUriWithHiddenFrame(uri, failCb, successCb);
                } else {
                    openUriInNewWindowHack(uri, failCb, successCb);
                }
            }

            function openUriUsingIE10InWindows7(uri, failCb, successCb) {
                const timeout = setTimeout(failCb, 1000);
                window.addEventListener("blur", () => {
                    clearTimeout(timeout);
                });

                let iframe = document.querySelector("#hiddenIframe");
                if (!iframe) {
                    iframe = _createHiddenIframe(document.body, "about:blank");
                }
                try {
                    iframe.contentWindow.location.href = uri;
                    successCb();
                } catch (e) {
                    failCb();
                    clearTimeout(timeout);
                }
            }

            function openUriWithMsLaunchUri(uri, failCb, successCb) {
                navigator.msLaunchUri(uri, successCb, failCb);
            }

            function openUriInNewWindowHack(uri, failCb, successCb) {
                const myWindow = window.open("", "", "width=0,height=0,noopener,noreferrer");
                myWindow.document.write("<iframe src='" + uri + "' sandbox></iframe>");

                setTimeout(() => {
                    try {
                        myWindow.location.href;
                        myWindow.setTimeout("window.close()", 1000);
                        successCb();
                    } catch (e) {
                        myWindow.close();
                        failCb();
                    }
                }, 1000);
            }

            function checkBrowser() {
                const isOpera = !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0;
                const ua = navigator.userAgent.toLowerCase();
                return {
                    isOpera: isOpera,
                    isFirefox: typeof InstallTrigger !== "undefined",
                    isSafari: (~ua.indexOf("safari") && !~ua.indexOf("chrome")) ||
                        Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0,
                    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
                    isChrome: !!window.chrome && !isOpera,
                    isIE: /*@cc_on!@*/false || !!document.documentMode, // At least IE6
                };
            }

            function getInternetExplorerVersion() {
                var rv = -1;
                const ua = navigator.userAgent;
                const re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                const result = re.exec(ua)
                if (result != null) {
                    rv = parseFloat(result[1]);
                }
                return rv;
            }

            module.exports = function checkAndOpenUri(uri, failCb, successCb, unsupportedCb) {
                function failCallback() {
                    failCb && failCb();
                }

                function successCallback() {
                    successCb && successCb();
                }

                if (navigator.msLaunchUri) { //for IE and Edge in Win 8 and Win 10
                    openUriWithMsLaunchUri(uri, failCb, successCb);
                } else {
                    const browser = checkBrowser();

                    if (browser.isFirefox) {
                        openUriUsingFirefox(uri, failCallback, successCallback);
                    } else if (browser.isChrome || browser.isIOS) {
                        openUriWithTimeoutHack(uri, failCallback, successCallback);
                    } else if (browser.isIE) {
                        openUriUsingIEInOlderWindows(uri, failCallback, successCallback);
                    } else if (browser.isSafari) {
                        openUriWithHiddenFrame(uri, failCallback, successCallback);
                    } else {
                        unsupportedCb();
                        //not supported, implement please
                    }
                }
            };

        }, {}],
    }, {}, [1])(1);
});