'use strict';

const tokenizerRegExp = /url\(\s*[\"\']?([^\"\'\)]+)[\"\']?\s*\)|\@import\s+\"([^\"]+)\"|\/\*|\*\/|\\"/g;

// Matching groups:
// 1) url(...)
// 2) @import "..."
// 3) /*
// 4) */
// 5) "

function Replacement(url, start, end) {
    this.url = undefined;
    this.start = start;
    this.end = end;
}

exports.process = function(code, options) {
    var replaceImportUrl = options.replaceImportUrl;
    var replaceAssetUrl = options.replaceAssetUrl;

    var matches;
    var inMultiLineComment = false;
    var inString = false;
    var urlStartPos;
    var match;
    var replacementUrl;
    var replacements = [];

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
            if ((url.indexOf('data:') !== 0) &&
                replaceAssetUrl && (replacementUrl = replaceAssetUrl(url))) {
                match = matches[0];
                // Found:
                //  url("<url>")
                //  url('<url>')
                //  url(<url>)
                urlStartPos = matches.index + match.indexOf(url);
                replacements.push(new Replacement(
                    replacementUrl,
                    urlStartPos,
                    urlStartPos + url.length));
            }
        } else if ((url = matches[2])) {
            if (replaceImportUrl && (replacementUrl = replaceImportUrl(url))) {
                match = matches[0];

                // Found: @import "<url>"
                urlStartPos = matches.index + match.indexOf(url);
                replacements.push(new Replacement(
                    replacementUrl,
                    urlStartPos,
                    urlStartPos + url.length));
            }
        }
    }

    var i = replacements.length;
    while(--i >= 0) {
        var replacement = replacements[i];
        code =
            code.substring(0, replacement.start) +
            replacement.url +
            code.substring(replacement.end);
    }

    return code;
};