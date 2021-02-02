import AccountSettingsController from './account-settings-controller';
const moment = require('moment/moment');
const cal = require('../calculators/calendar');
const UtcDay = require('../calculators/utc-day');
import DataClient from '../data-client';
const Currency = require('currency.js');
const PayDaysView = require('../views/pay-days-view');
const Util = require('../util');
function getView(paymentNumber, payDate) {
    return `<div class="row">
                    <div class="col-xs-1 text-right">${paymentNumber}</div>
                    <div class="col-xs-11">${payDate}</div>
                </div>`;
}

function getFriday(date) {
    let diff = date.day() === 6
        ? 6
        : 5 - date.day();
    date.add(diff, 'day');
    return date;
}
// There is a biweekly pay schedule in source control,
// but I removed it, because I'm not sure I could ever make this public.
// The problem is it needs to come from the budget and honestly
// this should be a paid feature, because if you have a 401k you could
// probably afford
function getPayDates() {
    let paymentDates = [];
    let current = getFriday(moment().utc().startOf('day'));
    let end = moment().utc().endOf('year');
    while (current < end) {
        if (current.day() === 5) {
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
    async init(usernameResponse) {
        const max401kContribution = 19500;
        new AccountSettingsController().init(PayDaysView, usernameResponse, true);
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