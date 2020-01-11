const AccountSettingsController = require('./account-settings-controller');
const CalendarView = require('../views/calendar-view');
const DataClient = require('../data-client');
const Util = require('../util');
export default class BudgetCalendarController {
    static getName() {
        return 'Budget Calendar';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/budget-calendar.html`;
    }
    async load() {
        $('#calendar-date-select').val(new Date().getUTCMonth());
        $('#calendar-date-select').change(function () {
            let month = $(this).val();
            let start = new Date(Date.UTC(new Date().getUTCFullYear(), month, 1));
            let end = new Date(start.getTime());
            end.setUTCMonth(end.getUTCMonth() + 1);
            CalendarView.build(new Date().getUTCFullYear(), month);
            CalendarView.load(data, start, end);
        });
        let data = await new DataClient().getBudget();
        for (let mre of data.monthlyRecurringExpenses) {
            mre.date = new Date(mre.date);
        }
        for (let biweekly of data.biweekly) {
            biweekly.date = new Date(biweekly.date);
        }
        let year = new Date().getUTCFullYear();
        let month = new Date().getUTCMonth();
        let start = new Date(Date.UTC(year, month, 1));
        let end = new Date(start.getTime());
        end.setUTCMonth(end.getUTCMonth() + 1);
        CalendarView.build(year, month);
        CalendarView.load(data, start, end);
    }
    async init() {
        new AccountSettingsController().init();
        await this.load();
    };
}