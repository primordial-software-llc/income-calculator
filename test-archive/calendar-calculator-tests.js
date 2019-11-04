const Cal = require('../src/calculators/calendar');
const CalendarCalculator = require('../src/calendar-calculator');
const calCalc = new CalendarCalculator();
const test = require('tape');

test('week start for may first', function(t) {
    t.plan(1);

    var result = calCalc.getFirstDayInWeek(
        Date.UTC(2017, Cal.MAY, 1)
    );

    t.equal(result.toISOString(), '2017-04-30T00:00:00.000Z');

});

test('describe november in weeks ', function(t) {
    t.plan(1);

    var result = calCalc.getFirstDayInWeek(
        Date.UTC(2017, Cal.MAY, 7)
    );

    t.equal(result.toISOString(), '2017-05-07T00:00:00.000Z');

});

test('describe november in weeks ', function(t) {
    t.plan(1);

    var result = calCalc.getFirstDayInWeek(
        Date.UTC(2017, Cal.MAY, 8)
    );

    t.equal(result.toISOString(), '2017-05-07T00:00:00.000Z');

});

test('describe november in weeks ', function(t) {
    t.plan(1);

    var result = calCalc.getFirstDayInWeek(
        Date.UTC(2017, Cal.MAY, 13)
    );

    t.equal(result.toISOString(), '2017-05-07T00:00:00.000Z');

});
