const CalendarSearch = require('./calendar-search');
const Currency = require('currency.js');
const Util = require('../util');

function CalendarAggregator() {
    const calendarSearch = new CalendarSearch();
    this.getSummary = function (startTime, endTime, budget) {
        let summary = {};
        summary.budgetItems = calendarSearch.find(startTime, endTime, budget);
        let debits = summary.budgetItems
                .filter(x => x.type === 'expense')
                .map(x => x.amount)
                .reduce((total, amount) => Currency(total, Util.getCurrencyDefaults()).add(amount));
        let credits =  summary.budgetItems
                .filter(x => x.type !== 'expense')
                .map(x => x.amount)
                .reduce((total, amount) => Currency(total, Util.getCurrencyDefaults()).add(amount));
        summary.debits = Currency(debits, {precision: 2}).toString();
        summary.credits = Currency(credits, {precision: 2}).toString();
        summary.net = Currency(credits - debits, {precision: 2}).toString();
        let paymentSources = new Set(summary.budgetItems.map(x => (x.paymentSource || '').toLowerCase()));
        summary.debitsByPaymentSource = [];
        summary.creditsByPaymentSource = [];
        for (let p of paymentSources) {
            let credits = summary.budgetItems.filter(x => (x.paymentSource || '').toLowerCase() === p
                && x.type === 'expense');
            let debits = summary.budgetItems.filter(x => (x.paymentSource || '').toLowerCase() === p
                && x.type !== 'expense');
            let creditsTotal = Currency(0, Util.getCurrencyDefaults());
            for (let credit of credits) {
                creditsTotal = creditsTotal.add(credit.amount);
            }
            let debitsTotal = Currency(0, Util.getCurrencyDefaults());
            for (let debit of debits) {
                debitsTotal = debitsTotal.add(debit.amount);
            }
            if (credits.length) {
                summary.creditsByPaymentSource.push({
                    paymentSource: p,
                    amount: creditsTotal.toString(),
                    transactions: credits
                });
            }
            if (debits.length) {
                summary.debitsByPaymentSource.push({
                    paymentSource: p,
                    amount: debitsTotal.toString(),
                    transactions: debits
                });
            }
        }
        return summary;
    };
}

module.exports = CalendarAggregator;
