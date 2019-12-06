const AccountSettingsController = require('./account-settings-controller');
const CalendarView = require('../calendar-view');
const DataClient = require('../data-client');
const Util = require('../util');
function BudgetCalendarController() {
    'use strict';
    let data;
    let month;
    async function load() {
        try {
            $('#calendar-date-select').val(new Date().getUTCMonth());
            $('#calendar-date-select').change(function () {
                month = $(this).val();
                var start = new Date(Date.UTC(new Date().getUTCFullYear(), month, 1));
                var end = new Date(start.getTime());
                end.setUTCMonth(end.getUTCMonth() + 1);
                CalendarView.build(new Date().getUTCFullYear(), month);
                CalendarView.load(data, start, end);
            });

            let dataClient = new DataClient();
            data = await dataClient.getBudget();

            for (let mre of data.monthlyRecurringExpenses) {
                mre.date = new Date(mre.date);
            }

            for (let biweekly of data.biweekly) {
                biweekly.date = new Date(biweekly.date);
            }

            let year = new Date().getUTCFullYear();
            month = new Date().getUTCMonth();
            let start = new Date(Date.UTC(year, month, 1));
            let end = new Date(start.getTime());
            end.setUTCMonth(end.getUTCMonth() + 1);
            CalendarView.build(year, month);
            CalendarView.load(data, start, end);
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function () {
        new AccountSettingsController().init();
        load();
    };
}

module.exports = BudgetCalendarController;