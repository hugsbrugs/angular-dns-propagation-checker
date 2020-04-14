# angular-dns-propagation-checker

A one folder drop to your PHP server to get your own DNS propagation checker ! Based on an open API (still require PHP server side since API does not support JSONP nor CORS).

[Free Online DNS Propagation Checker](https://hugo.maugey.fr/tools/dns-propagation-checker)

[![DNS Propagation Screenshot](/doc/angular-dsn-propagation-checker.png?raw=true "DNS Propagation Screenshot")](https://hugo.maugey.fr/tools/dns-propagation-checker)

Angular Single Page Application with local storage and [moment.js](http://momentjs.com/) as main javascript dependencies. Bootstrap for template.

This can be a good starter place to learn AngularJS because it involves following techniques :
- modularity : get external and internal modules
- create a service for HTTP request to separate controller data manipulation from data retrieval
- create a service to get/set hash URL depending on form data
- create a provider to set API Endpoint at apllication startup
- and more ...

## Dependencies

Font Awesome

AngularJS (Animate, Resource, Sanitize, Cookies, Touch)

Angular UI Bootstrap 4

Angular Moment (Moment.js)

## Install

Bower
```
bower install angular-dns-propagation-checker --save
```

NPM
```
npm  install angular-dns-propagation-checker --save
```

## Usage

```html
<link rel="stylesheet" href="dns-checker.min.css"/>
<script src="dns-checker.min.js"></script>
```

Load Modules
```js
var myApp = angular.module('myApp', [
    'ngResource',
    'ngAnimate',
    'ngCookies',
    'ngTouch',
    'ngSanitize',
    'angularMoment',
    'ui.bootstrap',
    //
    'angular-dns-propagation-checker'
]);
```

Modify API End Point
```js
myApp.config(['dnsCheckerProvider',
    function(dnsCheckerProvider)
    {
        dnsCheckerProvider.setApiListDns('get_nodes.php');
        dnsCheckerProvider.setApiGetDns('get_node.php');
    }
]);
```

In HTML template
```html
<dns-checker><dns-checker>
```

## Contribute

npm install

gulp build

gulp : not working since PHP files are downloaded and not executed by node server : quite normal so perhaps use gulp-connect-php ... or simply a real PHP server : drop this repo in you web folder and visit index.html

## Changelog
23-03-2017 : Add Flag Sprite as base64 in flag.css to avoid image path issue ([Online Base64 Encoder](https://hugo.maugey.fr/conversion/image-base-64))

## Author

Build by [Hugo Maugey](https://hugo.maugey.fr "Webmaster Narbonne")