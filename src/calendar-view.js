const cal = require('./calculators/calendar');
const CalendarCalculator = require('./calendar-calculator');
const Util = require('./util');
const calCalc = new CalendarCalculator();
const NetIncomeCalculator = require('./calculators/net-income-calculator');
const netIncomeCalculator = new NetIncomeCalculator();
const CalendarAggregator = require('./calculators/calendar-aggregator');
const calendarAggregator = new CalendarAggregator();

function getTransactionView(name, amount, type) {
    return `<div class="transaction-view ${type}"> 
                <div class="name">${name}</div>
                <div class="amount">$${amount}</div>
            </div>`;
}

function getMonthContainerId(date) {
    return `items-container-for-month-${date.getFullYear()}-${date.getMonth()}`;
}

function getDateTarget(date) {
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

function getDayTarget(date) {
    return `day-of-${getDateTarget(date)}`;
}

function getDayView(date, inMonth) {
    let css = !inMonth ? 'out-of-month' : '';
    css += ' day-view';
    css = css.trim();
    let dayViewHtml = `<div class="${css} day-col col-xs-1 ${getDayTarget(date)}">
            <span class="calendar-day-number">
            ${date.getUTCDate()}</div>`;
    return dayViewHtml;
}

function addMonthContainer(monthContainerId, date) {
    $('#months-container').append(`
        <div class="month-heading-totals-container">
            <div class="month-heading container">${cal.MONTH_NAMES[date.getUTCMonth()]} ${date.getFullYear()}</div>
            <div class="month-heading-totals-headers row">
                <div class="col-xs-3 text-center"><span class="month-heading-total-description">&nbsp;</span></div>
                <div class="col-xs-2 text-center">Income</div>
                <div class="col-xs-2 text-center">Expenses</div>
                <div class="col-xs-5"><button type="button" class="btn btn-info show-breakdown-by-source no-print">Show Account Totals</button></div>
            </div>
            <div class="month-heading-totals-values row">
                <div class="col-xs-3 subtotal-line">Subtotal</div>
                <div class="col-xs-2 subtotal-line month-heading-total text-right"><span id="month-credits-header-value"></span></div>
                <div class="col-xs-2 subtotal-line month-heading-total text-right"><span id="month-debits-header-value"></span></div>
                <div class="col-xs-5">&nbsp;</div>
            </div>
            <div class="row">
                <div class="col-xs-3 total">Total</div>
                <div class="col-xs-2 total text-right">&nbsp;</div>
                <div class="col-xs-2 total month-heading-total text-right"><span id="month-net-header-value"></span></div>
                <div class="col-xs-5">&nbsp;</div>
            </div>
        </div>
        <div class="items-container-for-month" id="${monthContainerId}"></div>`);
}

function addWeekAbbreviationHeaders(monthTarget) {
    for (let day of cal.DAY_NAME_ABBRS) {
        $(monthTarget + '>' + '.weeks').append(`<div class="day-col col-xs-1 week-name">${day}</div>`);
    }
}

function addMonth(year, month) {
    let date = calCalc.createByMonth(year, month);
    $('#months-container').empty();
    let monthContainerId = getMonthContainerId(date);
    addMonthContainer(monthContainerId, date);

    let monthTarget = '#' + monthContainerId;
    $(monthTarget).append('<div class="weeks row"></div>');
    addWeekAbbreviationHeaders(monthTarget);

    return monthContainerId;
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

function loadTransactions(items) {
    for (let budgetItem of items) {
        let view = getTransactionView(budgetItem.name, budgetItem.amount, budgetItem.type);
        $('.' + getDayTarget(budgetItem.date)).append(view);
    }
}

exports.load = function (budgetSettings, start, end) {
    $('#debug-console').html(
        `<div>Showing from: ${start.toISOString()} UTC</div>
        <div>Until: ${end.toISOString()} UTC</div>`);
    let budget = netIncomeCalculator.getBudget(budgetSettings, start.getTime(), end.getTime());
    let summary = calendarAggregator.getSummary(start.getTime(), end.getTime(), budget);
    loadTransactions(summary.budgetItems);
    $('#month-credits-header-value').append(Util.format(summary.credits));
    $('#month-debits-header-value').append(Util.format(summary.debits));
    $('#month-net-header-value').append(Util.format(summary.net));
    $('.show-breakdown-by-source').click(function () {
        $('.month-heading-total-description').text('Account');
        for (let debitSummary of summary.debitsByPaymentSource) {
            $('.month-heading-totals-values').before(`
            <div class="display-flex row">
                <div class="col-xs-3 display-flex-valign-bottom dotted-underline">${debitSummary.paymentSource}</div>
                <div class="col-xs-2 display-flex-valign-bottom dotted-underline text-right">${Util.format(debitSummary.amount)}</div>
                <div class="col-xs-2">&nbsp;</div>
                <div class="col-xs-2">&nbsp;</div>
                <div class="col-xs-3 text-center">&nbsp;</div>
            </div>`);
        }
        for (let creditSummary of summary.creditsByPaymentSource) {
            $('.month-heading-totals-values').before(`
            <div class="display-flex row">
                <div class="col-xs-3 display-flex-valign-bottom dotted-underline">${creditSummary.paymentSource}</div>
                <div class="col-xs-2 dotted-underline">&nbsp;</div>
                <div class="col-xs-2 display-flex-valign-bottom dotted-underline text-right">${Util.format(creditSummary.amount)}</div>
                <div class="col-xs-2">&nbsp;</div>
                <div class="col-xs-3 text-center">&nbsp;</div>
            </div>`);
        }
        $(this).prop('disabled', true);
    });
};
