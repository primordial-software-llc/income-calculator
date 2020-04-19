const cal = require('./calendar');
const UtcDay = require('./utc-day');
function NetIncomeCalculator() {
    const utcDay = new UtcDay();
    this.getBudget = function(config, startTime, endTime) {
        let breakdown = [];
        let wre = config.weeklyRecurringExpenses;
        let current = new Date(startTime);
        while (current.getTime() < endTime) {
            if (config.monthlyRecurringExpenses) {
                getMonthly(config.monthlyRecurringExpenses, current, breakdown);
            }
            if (wre) {
                getWeeklyExpenses(wre, current, breakdown);
            }
            for (let biweeklyItem of (config.biweekly || [])
                    .filter(x => utcDay.getDayDiff(new Date(x.date).getTime(), current.getTime()) % cal.BIWEEKLY_INTERVAL === 0)) {
                breakdown.push({
                    'name': biweeklyItem.name,
                    'amount': biweeklyItem.amount,
                    'date': new Date(current.getTime()),
                    'type': biweeklyItem.type,
                    'paymentSource': biweeklyItem.paymentSource
                });
            }
            current.setUTCDate(current.getUTCDate() + 1);
        }
        return breakdown;
    };

    function getMonthly(monthly, current, breakdown) {
        for (let txn of monthly) {
            let shouldAdd =
                (current.getUTCDate() === cal.SAFE_LAST_DAY_OF_MONTH && !txn.date) ||
                (new Date(txn.date).getUTCDate() === current.getUTCDate());
            if (shouldAdd) {
                breakdown.push({
                    'name': txn.name,
                    'amount': txn.amount,
                    'date': new Date(current.getTime()),
                    'type': txn.type || 'expense',
                    'paymentSource': txn.paymentSource
                });
            }
        }
    }

    function matchesDefaultWeekly(transactionDate, current) {
        return cal.FRIDAY === current.getUTCDay() &&
            !transactionDate;
    }

    function matchesSpecifiedWeekly(transactionDate, currentDay) {
        return transactionDate &&
            currentDay === transactionDate.getUTCDay();
    }

    function getWeeklyExpenses(wre, current, breakdown) {
        let currentDay = current.getUTCDay();
        for (let txn of wre) {
            let dt = new Date(txn.date);
            if (matchesDefaultWeekly(dt, current) ||
                matchesSpecifiedWeekly(dt, currentDay)) {
                let endDate = new Date(current.getTime());
                endDate.setUTCDate(endDate.getUTCDate() + 7);
                breakdown.push({
                    'name': txn.name,
                    'amount': txn.amount,
                    'date': new Date(current.getTime()),
                    'endDate': endDate,
                    'type': txn.type,
                    'paymentSource': txn.paymentSource
                });
            }
        }
    }

}

module.exports = NetIncomeCalculator;