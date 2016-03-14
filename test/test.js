'use strict';

const chai = require('chai');
const expect = chai.expect;

let rewriteCssUrls = require('../');

describe('rewrite-css-urls', function() {
    it('should ignore URLs within multi-line comment', function() {
        let cssCode =
            `background-image: url('good1.png');
            /*
            this is a test of url('do-not-find.png');
            background-image: url('do-not-find.png');
            background-image: url("do-not-find.png");
            background-image: url(do-not-find.png);
            */
            background-image: url('good2.png');
            `;

        var found = [];
        rewriteCssUrls.find(cssCode, function(urlRef) {
            found.push(urlRef.url);
        });

        expect(found).to.deep.equal([
            'good1.png',
            'good2.png'
        ]);
    });

    it('should find import URLs', function() {
        let cssCode =
            `
            @import 'abc.css' screen;
            @import "def.css";

            @import url(123.css);
            @import url('456.css');
            @import url("789.css");
            `;

        var found = [];
        rewriteCssUrls.find(cssCode, function(urlRef) {
            found.push(urlRef.url);
            expect(urlRef.type).to.equal(rewriteCssUrls.UrlType.IMPORT_URL);
        });

        expect(found).to.deep.equal([
            'abc.css',
            'def.css',
            '123.css',
            '456.css',
            '789.css'
        ]);
    });

    it('should find asset URLs', function() {
        let cssCode =
            `
            background-image: url(abc.png);
            background-image: url("def.png");
            background-image: url('ghi.png');
            `;

        var found = [];
        rewriteCssUrls.find(cssCode, function(urlRef) {
            found.push(urlRef.url);
            expect(urlRef.type).to.equal(rewriteCssUrls.UrlType.ASSET_URL);
        });

        expect(found).to.deep.equal([
            'abc.png',
            'def.png',
            'ghi.png'
        ]);
    });
});
