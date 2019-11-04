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
            if (config.biWeeklyIncome) {
                getIncome(
                    config.biWeeklyIncome.amount,
                    current.getTime(),
                    breakdown,
                    config.biWeeklyIncome.date.getTime());
            }
            current.setUTCDate(current.getUTCDate() + 1);
        }
        return breakdown;
    };

    function getMonthly(monthly, current, breakdown) {
        for (let txn of monthly) {
            let shouldAdd =
                (current.getUTCDate() === cal.SAFE_LAST_DAY_OF_MONTH && !txn.date) ||
                (txn.date && txn.date.getUTCDate() === current.getUTCDate());
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
            let dt = typeof txn.date === "object" ? txn.date : new Date(txn.date);
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

    function getIncome(amount, time, breakdown, startTime) {
        let incomeAccrual = getIncomeAccrual(amount, time, startTime);
        if (incomeAccrual) {
            breakdown.push(incomeAccrual);
        }
    }

    function getIncomeAccrual(amount, time, startTime) {
        let accrual;
        let diffFromFirstPayDate = utcDay.getDayDiff(startTime, time);
        let modulusIntervalsFromFirstPayDate = diffFromFirstPayDate % cal.BIWEEKLY_INTERVAL;
        if (modulusIntervalsFromFirstPayDate === 0) {
            accrual = {
                'name': 'biweekly income',
                'amount': amount,
                'date': new Date(time),
                'type': 'income',
                'paymentSource': 'salary'
            };
        }
        return accrual;
    }

}

module.exports = NetIncomeCalculator;