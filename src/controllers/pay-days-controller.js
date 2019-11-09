const moment = require('moment/moment');
const cal = require('../calculators/calendar');
const UtcDay = require('../calculators/utc-day');
const DataClient = require('../data-client');
const Currency = require('currency.js');
const AccountSettingsController = require('./account-settings-controller');
const PayDaysView = require('../views/pay-days-view');
const Util = require('../util');
function PayDaysController() {
    'use strict';
    let dataClient;
    let settings;
    function getView(paymentNumber, payDate) {
        return `<div class="row">
                    <div class="col-xs-1 text-right">${paymentNumber}</div>
                    <div class="col-xs-11">${payDate}</div>
                </div>`;
    }
    function getPayDates() {
        let paymentDates = [];
        let current = moment().utc().startOf('day');
        let end = moment().utc().endOf('year');
        let firstPayDateTime = moment('2019-04-12T00:00:00.000Z', moment.ISO_8601);
        while (current < end) {
            let diffFromFirstPayDate = new UtcDay().getDayDiff(firstPayDateTime, current.valueOf());
            let modulusIntervalsFromFirstPayDate = diffFromFirstPayDate % cal.BIWEEKLY_INTERVAL;
            if (modulusIntervalsFromFirstPayDate === 0) {
                paymentDates.push(current.toISOString());
            }
            current = current.add(1, 'day');
        }
        return paymentDates;
    }
    async function initAsync() {
        let data = await dataClient.sendRequest('budget');
        $('#401k-contribution-for-year').val(data['401k-contribution-for-year']);
        $('#401k-contribution-per-pay-check').val(data['401k-contribution-per-pay-check']);
        $('#acceptLicense').prop('checked', settings.agreedToLicense);

        let max401kContribution = 19000;
        $('#max-401k-contribution').text(Util.format(max401kContribution));

        let payDates = getPayDates();
        payDates.forEach((paymentDate, index) => {
            $('.pay-days-container').append(getView(index + 1, paymentDate));
        });
        let projectedContributionForYear = Currency(data['401k-contribution-for-year']).add(
            Currency(data['401k-contribution-per-pay-check']).multiply(payDates.length)
        );
        $('#projected-contribution-for-year').text(Util.format(projectedContributionForYear.toString()));
        $('#paychecks-remaining').text(payDates.length);
        let shouldContributePerPaycheck = Currency(19000)
            .subtract(data['401k-contribution-for-year'])
            .divide(payDates.length);
        let remainingShouldContribute = shouldContributePerPaycheck.multiply(payDates.length);
        let totalShouldcontribute = remainingShouldContribute.add(data['401k-contribution-for-year']);
        $('#should-contribute-for-max').text(Util.format(shouldContributePerPaycheck.toString()));
        $('#remaining-should-contribute-for-year').text(Util.format(remainingShouldContribute.toString()));
        $('#total-should-contribute-for-year').text(Util.format(totalShouldcontribute.toString()));
    }
    this.init = function (settingsIn) {
        settings = settingsIn;
        dataClient = new DataClient(settings);
        new AccountSettingsController().init(settings, PayDaysView);
        initAsync()
            .catch(err => { Util.log(err); });
    };
}

module.exports = PayDaysController;