const Cal = require('../src/calculators/calendar');
const CalendarCalculator = require('../src/calendar-calculator');
const PayoffDateCalculator = require('../src/calculators/payoff-date-calculator');

const calCalc = new CalendarCalculator();
const payoffDateCalculator = new PayoffDateCalculator();
const test = require('tape');

test('weekly payment interest', function(t) {
    t.plan(2);

    let balanceStatement = payoffDateCalculator.getPayoffDate({
        startTime: Date.UTC(
            2020,
            0,
            1
        ),
        totalAmount: 160,
        payment: 4,
        DayOfTheWeek: Cal.FRIDAY,
        rate: .0425
    });

    var result = calCalc.getFirstDayInWeek(
        Date.UTC(2017, Cal.MAY, 1)
    );

    t.equal(balanceStatement.date.toISOString(), '2020-10-09T00:00:00.000Z');
    t.ok(balanceStatement.totalInterest, 2.7311138657728877);

});

test('monthly payment interest', function(t) {
    t.plan(2);

    let balanceStatement = payoffDateCalculator.getPayoffDate({
        startTime: Date.UTC(
            2020,
            0,
            1
        ),
        totalAmount: 160,
        payment: 4 * Cal.WEEKS_IN_MONTH,
        DayOfTheMonth: 28,
        rate: .0425
    });

    console.log(balanceStatement);

    var result = calCalc.getFirstDayInWeek(
        Date.UTC(2017, Cal.MAY, 1)
    );

    t.equal(balanceStatement.date.toISOString(), '2020-10-28T00:00:00.000Z');
    t.ok(balanceStatement.totalInterest, 2.9595654546982297);

});