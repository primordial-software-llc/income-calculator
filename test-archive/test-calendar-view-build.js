const Cal = require('./calculators/calendar');
const CalendarCalculator = require('../src/calendar-calculator');
const calCalc = new CalendarCalculator();
const test = require('tape');

test('describe november in weeks ', function(t) {
    t.plan(4);

    var result = calCalc.getMonthAdjustedByWeek(2016, Cal.NOVEMBER);

    t.equal(result.startOfMonth.toISOString(), '2016-11-01T00:00:00.000Z', 'month start november');
    t.equal(result.adjustedStart.toISOString(), '2016-10-30T00:00:00.000Z', 'adjusted month start november');
    t.equal(result.end.toISOString(), '2016-12-01T00:00:00.000Z', 'month end');
    t.equal(result.currentDate.toISOString(), '2016-12-04T00:00:00.000Z', 'adjusted month end november');

});

test('describe december in weeks ', function(t) {
    t.plan(4);

    var result = calCalc.getMonthAdjustedByWeek(2016, Cal.DECEMBER);

    t.equal(result.startOfMonth.toISOString(), '2016-12-01T00:00:00.000Z', 'month start');
    t.equal(result.adjustedStart.toISOString(), '2016-11-27T00:00:00.000Z', 'adjusted month start december');
    t.equal(result.end.toISOString(), '2017-01-01T00:00:00.000Z', 'month end');
    t.equal(result.currentDate.toISOString(), '2017-01-01T00:00:00.000Z', 'adjusted month end december');

});

test('describe december in weeks ', function(t) {
    t.plan(4);

    var result = calCalc.getMonthAdjustedByWeek(2017, Cal.MAY);

    t.equal(result.startOfMonth.toISOString(), '2017-05-01T00:00:00.000Z', 'month start may');
    t.equal(result.adjustedStart.toISOString(), '2017-04-30T00:00:00.000Z', 'adjusted month start may');
    t.equal(result.end.toISOString(), '2017-06-01T00:00:00.000Z', 'month end');
    t.equal(result.currentDate.toISOString(), '2017-06-04T00:00:00.000Z', 'adjusted month end december');

});

