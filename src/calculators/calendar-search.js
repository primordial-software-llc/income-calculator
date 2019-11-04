function CalendarSearch() {

    this.find = function (startTime, endTime, transactions) {
        let matches = [];
        for (let transaction of transactions) {
            if (this.within(startTime, endTime, transaction.date.getTime())) {
                matches.push(transaction);
            }
        }
        return matches;
    };

    this.within = function (startTime, endTime, sampleTime) {
        return sampleTime >= startTime &&
            sampleTime < endTime;
    };

}

module.exports = CalendarSearch;