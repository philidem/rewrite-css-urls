'use strict';

var tokenizerRegExp = /(@import\s+)?url\(\s*[\"\']?([^\"\'\)]+)[\"\']?\s*\)|@import\s+[\"\']([^\"\']+)[\"\']|(\/\*)|(\*\/)/g;

// Matching groups:
// 1) url(...)
// 2) @import "..."
// 3) /*
// 4) */
// 5) "

var UrlType = exports.UrlType = {
    'IMPORT_URL': {},
    'ASSET_URL': {}
};

function UrlRef(url, start, end, type) {
    this.url = url;
    this.start = start;
    this.end = end;
    this.type = type;
}

function find(code, options) {
    var matches;
    var inMultiLineComment = false;
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
            if (matches[5]) {
                inMultiLineComment = false;
            }
        } else if (matches[4]) {
            inMultiLineComment = true;
        } else if ((url = matches[2])) {
            // Found one of the following:
            // url("<url>")
            // url('<url>')
            // url(<url>)
            // @import url("<url>")
            // @import url('<url>')
            // @import url(<url>)

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
                    matches[1] ? UrlType.IMPORT_URL : UrlType.ASSET_URL));

                urlReferences.push(urlRef);
            }
        } else if ((url = matches[3])) {
            match = matches[0];

            // Found one of the following:
            // @import "<url>"
            // @import '<url>'
            urlStartPos = matches.index + match.indexOf(url);

            forEachFn(new UrlRef(
                url,
                urlStartPos,
                urlStartPos + url.length,
                UrlType.IMPORT_URL
            ));
        }
    }
}

exports.find = find;

exports.findAndReplace = function(code, options) {
    var replaceImportUrl = options.replaceImportUrl || options.replaceUrl;
    var replaceAssetUrl = options.replaceAssetUrl || options.replaceUrl;
    var replacementUrl;

    var urlReferences = options.urlReferences;

    if (!urlReferences) {
        urlReferences = [];
        find(code, function(urlRef) {
            urlReferences.push(urlRef);
        });
    }

    var i = urlReferences.length;

    // Always perform replacements starting from the end of the
    // string so that character ranges don't change!!!
    while(--i >= 0) {
        var urlRef = urlReferences[i];
        if (urlRef.type === UrlType.IMPORT_URL) {
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
