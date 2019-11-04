exports.UTC_DAY_MILLISECONDS = 86400000;

function UtcDay() {

    this.getDayDiff = function (startTime, endTime) {
        let diffMs = endTime - startTime;
        let diff = diffMs / exports.UTC_DAY_MILLISECONDS;
        return diff;
    };

}

module.exports = UtcDay;