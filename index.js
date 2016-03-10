'use strict';

var tokenizerRegExp = /url\(\s*[\"\']?([^\"\'\)]+)[\"\']?\s*\)|\@import\s+\"([^\"]+)\"|\/\*|\*\/|\\"/g;

// Matching groups:
// 1) url(...)
// 2) @import "..."
// 3) /*
// 4) */
// 5) "

var Type = exports.Type = {
    'IMPORT_URL': 1,
    'URL': 2
};

function UrlRef(url, start, end, type) {
    this.url = url;
    this.start = start;
    this.end = end;
    this.type = type;
}

function findUrlReferences(code, options) {
    var matches;
    var inMultiLineComment = false;
    var inString = false;
    var urlStartPos;
    var match;
    var urlReferences = [];
    var urlRef;
    var forEachFn;

    if (options) {
        if (options.constructor === Function) {
            forEachFn = options;
        } else {
            forEachFn = options.forEach;
        }
    }

    while((matches = tokenizerRegExp.exec(code)) != null) {
        var url;

        if (inMultiLineComment) {
            if (matches[4]) {
                inMultiLineComment = false;
            }
        } else if (inString) {
            if (matches[5]) {
                inString = false;
            }
        } else if (matches[3]) {
            inMultiLineComment = true;
        } else if (matches[5]) {
            inString = true;
        } else if ((url = matches[1])) {
            // ignore "data:" URLs
            if (url.indexOf('data:') !== 0) {
                match = matches[0];
                // Found:
                //  url("<url>")
                //  url('<url>')
                //  url(<url>)
                urlStartPos = matches.index + match.indexOf(url);

                forEachFn(new UrlRef(
                    url,
                    urlStartPos,
                    urlStartPos + url.length,
                    Type.URL));

                urlReferences.push(urlRef);
            }
        } else if ((url = matches[2])) {
            match = matches[0];

            // Found: @import "<url>"
            urlStartPos = matches.index + match.indexOf(url);

            forEachFn(new UrlRef(
                url,
                urlStartPos,
                urlStartPos + url.length,
                Type.IMPORT_URL
            ));
        }
    }
}

exports.findUrlReferences = findUrlReferences;

exports.process = function(code, options) {
    var replaceImportUrl = options.replaceImportUrl;
    var replaceAssetUrl = options.replaceAssetUrl;
    var replacementUrl;

    var urlReferences = options.urlReferences;

    if (!urlReferences) {
        urlReferences = [];
        findUrlReferences(code, function(urlRef) {
            urlReferences.push(urlRef);
        });
    }

    var i = urlReferences.length;

    // Always perform replacements starting from the end of the
    // string so that character ranges don't change!!!
    while(--i >= 0) {
        var urlRef = urlReferences[i];
        if (urlRef.type === Type.IMPORT_URL) {
            if (!replaceImportUrl || !(replacementUrl = replaceImportUrl(urlRef))) {
                continue;
            }
        } else {
            if (!replaceAssetUrl || !(replacementUrl = replaceAssetUrl(urlRef))) {
                continue;
            }
        }

        if (replacementUrl) {
            code = code.substring(0, urlRef.start) +
                   replacementUrl +
                   code.substring(urlRef.end);
        }
    }

    return code;
};
