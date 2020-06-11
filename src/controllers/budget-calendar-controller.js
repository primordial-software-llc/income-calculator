import AccountSettingsController from './account-settings-controller';
const CalendarView = require('../views/calendar-view');
const DataClient = require('../data-client');
const Util = require('../util');
const NetIncomeCalculator = require('../calculators/net-income-calculator');
const netIncomeCalculator = new NetIncomeCalculator();
const CalendarSearch = require('../calculators/calendar-search');
const Currency = require('currency.js');

export default class BudgetCalendarController {
    static getName() {
        return 'Budget Calendar';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/budget-calendar.html`;
    }
    loadAccountSummary(summary) {
        $('.month-heading-totals-values').first().before(CalendarView.getMonthlyAccountSummaryView(summary));
        for (let transaction of summary.transactions) {
            $('.month-heading-totals-values').first().before(CalendarView.getTransactionForAccountView(transaction));
        }
    }
    loadCalendar(data, year, month) {
        CalendarView.build(year, month);

        const calendarSearch = new CalendarSearch();
        let start = new Date(Date.UTC(new Date().getUTCFullYear(), month, 1));
        let end = new Date(start.getTime());
        end.setUTCMonth(end.getUTCMonth() + 1);
        let budget = netIncomeCalculator.getBudget(data, start.getTime(), end.getTime());
        let budgetItems = calendarSearch.find(start.getTime(), end.getTime(), budget);
        for (let budgetItem of budgetItems) {
            let view = CalendarView.getTransactionView(budgetItem.name, budgetItem.amount, budgetItem.type);
            $('.' + CalendarView.getDayTarget(budgetItem.date)).append(view);
        }
        let debits = budgetItems.filter(x => x.type === 'expense');
        let credits = budgetItems.filter(x => x.type !== 'expense');
        let debitsTotal = debits
            .map(x => x.amount)
            .reduce((total, amount) => Currency(total, Util.getCurrencyDefaults()).add(amount), 0);
        let creditsTotal =  credits
            .map(x => x.amount)
            .reduce((total, amount) => Currency(total, Util.getCurrencyDefaults()).add(amount), 0);
        $('#month-credits-header-value').append(Util.format(creditsTotal.toString()));
        $('#month-debits-header-value').append(Util.format(debitsTotal.toString()));
        $('#month-net-header-value').append(Util.format(Currency(creditsTotal - debitsTotal, Util.getCurrencyDefaults()).toString()));
        $('.show-breakdown-by-source').unbind();
        let self = this;
        $('.show-breakdown-by-source').click(function () {
            self.showingTotals = true;
            $('.month-heading-total-description').text('Account');
            let paymentSources = new Set(budgetItems.map(x => (x.paymentSource || '').toLowerCase()));
            for (let p of paymentSources) {
                let creditsForAccount = budgetItems.filter(x => x.type !== 'expense' && (x.paymentSource || '').toLowerCase() === p);
                if (creditsForAccount.length) {
                    self.loadAccountSummary({
                        paymentSource: p,
                        amount: creditsForAccount.reduce((accumulator, credit) => accumulator.add(credit.amount), Currency(0, Util.getCurrencyDefaults())).toString(),
                        transactions: creditsForAccount
                    });
                }
                let debitsForAccount = budgetItems.filter(x => x.type === 'expense' && (x.paymentSource || '').toLowerCase() === p);
                if (debitsForAccount.length) {
                    self.loadAccountSummary({
                        paymentSource: p,
                        amount: debitsForAccount.reduce((accumulator, debit) => accumulator.add(debit.amount), Currency(0, Util.getCurrencyDefaults())).toString(),
                        transactions: debitsForAccount
                    });

                }
            }
            $(this).prop('disabled', true);
        });
        self.showingTotals = false;
    }
    async load() {
        let self = this;
        let data = await new DataClient().getBudget();
        $('#calendar-date-select').val(new Date().getUTCMonth());
        $('#calendar-date-select').change(function () {
            self.loadCalendar(data, new Date().getUTCFullYear(), $(this).val());
            $('.show-transactions-for-account').prop('disabled', false);
            $('.show-breakdown-by-source').prop('disabled', false);
        });
        this.loadCalendar(data, new Date().getUTCFullYear(), new Date().getUTCMonth());
        $('.show-transactions-for-account').click(function () {
            if (!self.showingTotals) {
                $('.show-breakdown-by-source').click();
            }
            $('.account-transaction-container').removeClass('hide');
            $('.month-heading-account-total').addClass('font-bold');
            $(this).prop('disabled', true);
        });
    }

    async init(usernameResponse) {
        new AccountSettingsController().init({}, usernameResponse);
        await this.load();
    }
}