var test = require('tape');
var cal = require('./calendar');
var calc = require('./calculator');
var data = require('./data');

test('profits for april 2016', function(t) {
    t.plan(3);

    var oneTimeExpense = [{ amount: 143200 }];

    var netIncome = calc.getNetIncome(
        {
            monthlyExpenses: data.monthlyExpenses,
            weeklyExpenses: data.weeklyExpenses,
            dayOfWeek: cal.FRIDAY
        },
        {
            calendarConfig: cal.BIWEEKLY_CALENDAR_CONFIG,
            rate: data.biweeklyRate
        },
        oneTimeExpense,
        {
            startTime: new Date(2016, 2, 26).getTime(),
            endTime: new Date(2016, 3, 27).getTime()
        }
    );

    var expectedNetIncome = 3200 * 100 - 165035;
    expectedNetIncome = expectedNetIncome - oneTimeExpense[0].amount;
    t.equal(expectedNetIncome, 11765, 'profit or loss for month');
    t.equal(netIncome, expectedNetIncome, 'profits for april 2016: ' + netIncome);

    var savings =  [
        { amount: 126341 },
        { amount: 821 }
    ];

    var expect = netIncome + savings[0].amount + savings[1].amount;
    t.equal(expect, 138927);
});
