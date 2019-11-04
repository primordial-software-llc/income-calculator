const Currency = require('currency.js');

exports.getModel = function () {
    let model = {};
    model['401k-contribution-for-year'] = Currency($('#401k-contribution-for-year').val().trim()).toString();
    model['401k-contribution-per-pay-check'] = Currency($('#401k-contribution-per-pay-check').val().trim()).toString();
    return model;
};