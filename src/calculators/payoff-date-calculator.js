const Calendar = require('./calendar');

function PayoffDateCalculator() {

    this.getWeeklyInterest = function (balance, apr) {
        let monthlyInterest = this.getMonthlyInterest(balance, apr);
        let weeklyInterest = monthlyInterest / Calendar.WEEKS_IN_MONTH;
        return weeklyInterest;
    };

    this.getMonthlyInterest = function (balance, apr) {
        let monthlyRate = apr/12;
        return balance * monthlyRate;
    };

    this.getPayoffDate = function(params) {
        let balance = params.totalAmount;
        let response = {};
        response.date = new Date(params.startTime);
        response.totalInterest = 0;

        if (!params.rate) {
            params.rate = 0;
        }

        while (balance > 0) {
            if (params.abortDate &&
                params.abortDate.getTime() <= response.date.getTime()) {
                break;
            }
            if (response.date.getUTCDay() === params.DayOfTheWeek) {
                let weeklyInterest = this.getWeeklyInterest(balance, params.rate);
                response.totalInterest += weeklyInterest;
                if (weeklyInterest > params.payment) {
                    throw 'payment must be greater than interest accrued.';
                }
                let principle = params.payment - weeklyInterest;
                balance -= principle;
            }
            response.date.setUTCDate(response.date.getUTCDate() + 1);
        }
        response.date.setUTCDate(response.date.getUTCDate() - 1);
        return response;
    };

}

module.exports = PayoffDateCalculator;
