const cal = require('../calculators/calendar');
const CalendarCalculator = require('../calendar-calculator');
const Util = require('../util');
const calCalc = new CalendarCalculator();

exports.getTransactionView = function(name, amount, type) {
    return `<div class="transaction-view ${type}"> 
                <div class="name">${name}</div>
                <div class="amount">$${amount}</div>
            </div>`;
}

function getDateTarget(date) {
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

exports.getDayTarget = function(date) {
    return `day-of-${getDateTarget(date)}`;
}

function getDayView(date, inMonth) {
    let css = !inMonth ? 'out-of-month' : '';
    css += ' day-view';
    css = css.trim();
    let dayViewHtml = `<div class="${css} bg-color-imago-cream day-col col-xs-1 ${exports.getDayTarget(date)}">
            <span class="calendar-day-number">
            ${date.getUTCDate()}</div>`;
    return dayViewHtml;
}

function addMonth(year, month) {
    let date = calCalc.createByMonth(year, month);
    $('#months-container').empty();
    let monthContainerId = `items-container-for-month-${date.getFullYear()}-${date.getMonth()}`;

    $('#months-container').append(
        getMonthlyTotalsView(
            monthContainerId,
            cal.MONTH_NAMES[date.getUTCMonth()],
            date.getUTCFullYear()));

    let monthTarget = '#' + monthContainerId;
    $(monthTarget).append('<div class="weeks row color-imago-cream"></div>');
    for (let day of cal.DAY_NAME_ABBRS) {
        $(monthTarget + '>' + '.weeks').append(`<div class="day-col col-xs-1 week-name">${day}</div>`);
    }
    return monthContainerId;
}

function getMonthlyTotalsView(monthContainerId, monthName, year) {
    return `
        <div class="month-heading-totals-container color-white">
            <div class="month-heading font-subheading1 color-imago-cream">${monthName} ${year}</div>
            <div class="month-heading-totals-headers row color-imago-cream">
                <div class="col-xs-9 text-center"><span class="month-heading-total-description">&nbsp;</span></div>
                <div class="col-xs-3 text-center">Amount</div>
            </div>
            <div class="month-heading-totals-values row">
                <div class="col-xs-9 white-subtotal-line">Total Income</div>
                <div class="col-xs-3 white-subtotal-line month-heading-total text-right"><span id="month-credits-header-value"></span></div>
            </div>
            <div class="month-heading-totals-values row">
                <div class="col-xs-9 white-subtotal-line">Total Expenses</div>
                <div class="col-xs-3 white-subtotal-line month-heading-total text-right"><span id="month-debits-header-value"></span></div>
            </div>
            <div class="row">
                <div class="col-xs-8 total">Net Income</div>
                <div class="col-xs-2 total text-right">&nbsp;</div>
                <div class="col-xs-2 total month-heading-total text-right"><span id="month-net-header-value"></span></div>
            </div>
        </div>
        <div class="items-container-for-month" id="${monthContainerId}"></div>`.trim();
}

exports.getMonthlyAccountSummaryView = function(summary) {
    let monthlyAccountSummary = $('<div class="display-flex row"></div>');
    let accountType = summary.transactions[0].type === 'expense' ? 'Expense' : 'Income';
    let accountName = summary.paymentSource ? `${summary.paymentSource} - ${accountType}` : 'Unspecified';
    monthlyAccountSummary.append(`<div class="col-xs-9 display-flex-valign-bottom capitalize-first white-subtotal-line">${accountName}</div>`);
    monthlyAccountSummary.append(`<div class="col-xs-3 month-heading-account-total display-flex-valign-bottom white-subtotal-line text-right">
        ${getDisplayAmount(summary.amount, summary.transactions[0].type)}</div>`);
    return monthlyAccountSummary;
}

exports.getTransactionForAccountView = function(transaction) {
    return `<div class="display-flex row account-transaction-container hide">
                    <div class="col-xs-9 display-flex-valign-bottom white-dotted-underline text-lowercase">&nbsp;&nbsp;&nbsp;&nbsp;${transaction.name}</div>
                    <div class="col-xs-3 display-flex-valign-bottom white-dotted-underline text-right">
                        ${getDisplayAmount(transaction.amount, transaction.type)}
                    </div>
                </div>`;
}

exports.build = function (year, month) {
    'use strict';
    let monthContainerId = addMonth(year, month);
    let dayViewContainer;
    let transactionsForWeekTarget;
    calCalc.getMonthAdjustedByWeek(
        year,
        month,
        function (currentDate) {
            let dayView = getDayView(currentDate, month.toString() === currentDate.getUTCMonth().toString());
            $('.' + transactionsForWeekTarget).append(dayView);
        },
        function (currentDate) {
            transactionsForWeekTarget = 'week-of-' + getDateTarget(currentDate);
            dayViewContainer = (`<div class="transactions-for-week row ${transactionsForWeekTarget}"></div>`);
            $('#' + monthContainerId).append(dayViewContainer);
        });
};

function getDisplayAmount(amount, type) {
    let displayAmount = amount;
    if (type === 'expense') {
        displayAmount *= -1;
    }
    displayAmount = Util.format(displayAmount);
    return displayAmount;
}