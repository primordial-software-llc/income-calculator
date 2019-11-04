const AccountSettingsController = require('./account-settings-controller');
const CalendarView = require('../calendar-view');
const DataClient = require('../data-client');
const Util = require('../util');

function BudgetCalendarController() {
    'use strict';
    let settings;
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

            let dataClient = new DataClient(settings);
            data = await dataClient.getData();
            for (let mre of data.monthlyRecurringExpenses) {
                mre.date = new Date(mre.date);
            }
            data.biWeeklyIncome.date = new Date(data.biWeeklyIncome.date);

            var year = new Date().getUTCFullYear();
            month = new Date().getUTCMonth();
            var start = new Date(Date.UTC(year, month, 1));
            var end = new Date(start.getTime());
            end.setUTCMonth(end.getUTCMonth() + 1);
            CalendarView.build(year, month);
            CalendarView.load(data, start, end);
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function (settingsIn) {
        settings = settingsIn;
        new AccountSettingsController().init(settings);
        load();
    };
}

module.exports = BudgetCalendarController;