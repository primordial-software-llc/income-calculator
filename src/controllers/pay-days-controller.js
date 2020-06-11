import AccountSettingsController from './account-settings-controller';
const moment = require('moment/moment');
const cal = require('../calculators/calendar');
const UtcDay = require('../calculators/utc-day');
const DataClient = require('../data-client');
const Currency = require('currency.js');
const PayDaysView = require('../views/pay-days-view');
const Util = require('../util');
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
export default class PayDaysController {
    static getName() {
        return 'Payroll';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/payroll.html`;
    }
    async init() {
        const max401kContribution = 19500;
        new AccountSettingsController().init(PayDaysView);
        let data = await new DataClient().getBudget();
        $('#401k-contribution-for-year').val(data['401k-contribution-for-year']);
        $('#401k-contribution-per-pay-check').val(data['401k-contribution-per-pay-check']);
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
        let shouldContributePerPaycheck = Currency(max401kContribution)
            .subtract(data['401k-contribution-for-year'])
            .divide(payDates.length);
        let remainingShouldContribute = shouldContributePerPaycheck.multiply(payDates.length);
        let totalShouldContribute = remainingShouldContribute.add(data['401k-contribution-for-year']);
        $('#should-contribute-for-max').text(Util.format(shouldContributePerPaycheck.toString()));
        $('#remaining-should-contribute-for-year').text(Util.format(remainingShouldContribute.toString()));
        $('#total-should-contribute-for-year').text(Util.format(totalShouldContribute.toString()));
    }
}