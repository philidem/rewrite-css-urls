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

        expect(found.length).to.equal(2);
        expect(found[0]).to.equal('good1.png');
        expect(found[1]).to.equal('good2.png');
    });

    it('should find import URLs', function() {
        let cssCode =
            `
            @import "abc.css"
            @import "def.css"
            `;

        var found = [];
        rewriteCssUrls.find(cssCode, function(urlRef) {
            found.push(urlRef.url);
            expect(urlRef.type).to.equal(rewriteCssUrls.UrlType.IMPORT_URL);
        });

        expect(found.length).to.equal(2);
        expect(found[0]).to.equal('abc.css');
        expect(found[1]).to.equal('def.css');
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

        expect(found.length).to.equal(3);
        expect(found[0]).to.equal('abc.png');
        expect(found[1]).to.equal('def.png');
        expect(found[2]).to.equal('ghi.png');
    });
});
