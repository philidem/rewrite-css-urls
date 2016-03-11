rewrite-css-urls
================

This module is used to assist with rewriting URLs inside CSS code.
It looks for URL patterns and provides convenience functions for
replacing the URLs that were found.

To reduce complexity and code size, this utility does not use
a fully CSS-compliant parser. In fact, the _parser_ simply uses
a couple of regular expressions and ignores comment blocks.

This utility searches for `url(*)` and `@import "*"` patterns specifically.

## Installation

`npm install rewrite-css-urls --save`

## Usage

### Find
```javascript
require('rewrite-css-urls').find(cssCode, function(urlRef) {
    console.log('Found URL: ' + urlRef.url);
});
```

### Find & Replace
```javascript
var transformedCssCode = require('rewrite-css-urls').findAndReplace(cssCode, {
    replaceUrl: function(urlRef) {
        return urlRef.url.replace('blah.com', 'mycompany.com');
    }
});
```

## JavaScript API

The `require('rewrite-css-urls')` module exports the properties below.

### Method: `findAndReplace(cssCode, options)`

#### Arguments:

| Argument                   | JavaScript Type    | Required / Optional | Description |
|----------------------------|--------------------|-------------------|---------------|
| `cssCode`                  | `String`           | required          | The raw CSS code |
| `options`                  | `Object`           | required          | Collection of options |
| `options.replaceUrl`       | `Function(UrlRef)` | optional          | This function will be called to replace all types of URLs and will be used when a more specific `options.replaceImportUrl` or `options. replaceAssetUrl ` is not provided. Return `undefined` to not perform subsitution. |
| `options.replaceImportUrl` | `Function(UrlRef)` | optional          | This function will be called to replace `@import "*"` URLs. Return `undefined` to not perform subsitution. |
| `options.replaceAssetUrl`  | `Function(UrlRef)` | optional          | This function will be called to replace `url(*)` URLs. Return `undefined` to not perform subsitution. |

#### Returns:

`String` The transformed CSS code after URL substitutions.

### Method: `find(cssCode, forEachFn)`

| Argument                   | JavaScript Type    | Required / Optional | Description |
|----------------------------|--------------------|---------------------|---------------|
| `cssCode`                  | `String`           | required            | The raw CSS code |
| `forEachFn`                | `Function(UrlRef)` | required            | Function that will be called for each URL |

### Type: `UrlRef`

Instances of `UrlRef` will be passed to the `replaceUrl`, `replaceImportUrl`,
and `replaceAssetUrl` functions.

| Property    | JavaScript Type    | Description |
|-------------|--------------------|-------------|
| `url`       | `String`           | The actual URL
| `start`     | `Number`           | Start character position |
| `end`       | `Number`           | End character position |
| `type`      | `Number`           | Either `require('rewrite-css-urls').UrlType.IMPORT_URL` (@import URL) or `require('rewrite-css-urls').UrlType.ASSET_URL` (image or font URL) |