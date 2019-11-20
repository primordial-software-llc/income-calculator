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
exports.formatShares = function(shares) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(shares);
};
exports.format = function(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 3 }).format(amount);
};
exports.hasAgreedToLicense = function() {
    return exports.getParameterByName('agreedToLicense') === 'true';
};
exports.rootUrl = function () {
    return window.location.origin === 'file://'
        ? 'file:///C:/Users/peon/Desktop/projects/income-calculator'
        : `${document.location.origin}/income-calculator`;
};
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
        : Currency(transaction.sharePrice, exports.getCurrencyDefaults()).multiply(transaction.shares).toString();
};
exports.getCurrencyDefaults = function() { return {precision: 3} };
exports.add = function (one, two) {
    return Currency(one, exports.getCurrencyDefaults()).add(two).toString();
};
exports.subtract = function (one, two) {
    return Currency(one, exports.getCurrencyDefaults()).subtract(two).toString();
};
exports.cleanseNumericString = function (numericString) {
    return numericString.replace(/[^-0-9.]/g, '');
};
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
exports.obfuscate = function () {
    return exports.getCookie('obfuscate') === 'true';
};
exports.obfuscationAmount = function () {
    return .2;
};
exports.getPoolData = function () {
    return {
        UserPoolId : 'us-east-1_CJmKMk0Fw',
        ClientId : '1alsnsg84noq81e7f2v5vru7m7'
    };
};
exports.getUsername = function () {
    let idToken = exports.getCookie('idToken');
    if (!idToken) {
        return '';
    }
    let payload = idToken.split('.')[1];
    let decodedPayload = atob(payload);
    let parsed = JSON.parse(decodedPayload);
    return parsed.email;
};
