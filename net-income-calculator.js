function NetIncomeCalculator() {

    const cal = require('./calendar');
    const UtcDay = require('./utc-day');
    const utcDay = new UtcDay();

    this.getBreakdown = function(config, startTime, endTime) {
        var breakdown = [];
        var mre = config.monthlyRecurringExpenses;
        var wre = config.weeklyRecurringExpenses;

        var current = new Date(startTime);
        while (current.getTime() < endTime) {

            if (current.getDate() == cal.SAFE_LAST_DAY_OF_MONTH) {
                for (var i = 0; i < mre.length; i++) {
                    var processed = {};
                    processed.name = mre[i].name;
                    processed.amount = mre[i].amount;
                    processed.date = new Date(current.getTime());
                    processed.type = 'expense';
                    breakdown.push(processed);
                }
            }

            if (current.getDay() == cal.FRIDAY) {
                for (var i = 0; i < wre.length; i++) {
                    var processed = {};
                    processed.name = wre[i].name;
                    processed.amount = wre[i].amount;
                    processed.date = new Date(current.getTime());
                    processed.type = 'expense';
                    breakdown.push(processed);
                }
            }

            for (var i=0; i < config.oneTimeExpenses.length; i++) {
                var potentialOneTimeExpense = config.oneTimeExpenses[i];
                if (current.getTime() == potentialOneTimeExpense.dateIncurred.getTime()) {
                    var expense = {};
                    expense.name = potentialOneTimeExpense.name;
                    expense.amount = potentialOneTimeExpense.amount;
                    expense.date = new Date(current.getTime());
                    expense.type = 'expense';
                    breakdown.push(expense);
                }
            }

            var incomeAccrual = getIncomeAccrual(config, current);
            if (incomeAccrual) {
                breakdown.push(incomeAccrual);
            }

            current.setDate(current.getDate() + 1);
        }

        return breakdown;
    };

    function getIncomeAccrual(config, date) {
        var accrual;
        var diffFromFirstPayDate = utcDay.getDayDiff(
            cal.BIWEEKLY_PAY_START_DATE.getTime(),
            date.getTime()
        );

        var modulusIntervalsFromFirstPayDate = diffFromFirstPayDate % cal.BIWEEKLY_INTERVAL;

        if (modulusIntervalsFromFirstPayDate === 0) {
            var accrual = {};
            accrual.name = 'biweekly income';
            accrual.amount = config.biWeeklyIncome.amount;
            accrual.date = new Date(date.getTime());
            accrual.type = 'income';
        }

        return accrual;
    }

}

module.exports = NetIncomeCalculator;