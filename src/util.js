const Currency = require('currency.js');
exports.log = function (error) {
    console.log(error);
    console.log(JSON.stringify(error, 0, 4));
    $('#debug-console').append(`<div>${error}</div>`);
    $('#debug-console').append(`<div>${JSON.stringify(error, 0, 4)}</div>`);
};
exports.getParameterByName = function (name) {
    'use strict';
    var url = location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return results[2];
};
exports.updateQueryStringParameter = function (uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1
        ? "&"
        : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
};
exports.formatShares = (shares) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(shares);
exports.format = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 3 }).format(amount);
exports.hasAgreedToLicense = function() { // SHOULD REMOVE THIS
    return exports.getParameterByName('agreedToLicense') === 'true';
};
exports.rootUrl = () => `${document.location.origin}`;
exports.guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};
exports.getAmount = function (transaction) {
    return !transaction.sharePrice && !transaction.shares
        ? transaction.amount
        : Currency(transaction.sharePrice, exports.getCurrencyDefaults())
            .multiply(Currency(transaction.shares, exports.getCurrencyDefaults())).toString();
};
exports.getCurrencyDefaults = () => { return {precision: 3} };
exports.add = (one, two) => Currency(one, exports.getCurrencyDefaults()).add(two).toString();
exports.subtract = (one, two) => Currency(one, exports.getCurrencyDefaults()).subtract(two).toString();
exports.cleanseNumericString = (numericString) => numericString.replace(/[^-0-9.]/g, '');
exports.getCookie = function (cookieNmae) {
    let name = cookieNmae + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
};
exports.obfuscate = () => exports.getCookie('obfuscate') === 'true';
exports.obfuscationAmount = () => Math.random()/10;
// ENVIRONMENT
// Test
//exports.getPoolData = () => {
//    return {
//        UserPoolId : 'us-east-1_CJmKMk0Fw',
//        ClientId : '1alsnsg84noq81e7f2v5vru7m7'
//    };
//};
//exports.getApiUrl = () => 'https://9hls6nao82.execute-api.us-east-1.amazonaws.com/production/';
// Production
exports.getPoolData = () => {
    return {
        UserPoolId : 'us-east-1_rHS4WOhz6',
        ClientId : '2js93kg56gbvp0huq66fbh0gap'
    };
};
exports.getApiUrl = () => 'https://api.primordial-software.com/';
// I exposed the origin at some point, so I need to deploy the api to a new endpoint.
// Or block traffic from non-cloudflare IP's.
// I should have something to block traffic for non-cloudflare IP's from the gallery project.