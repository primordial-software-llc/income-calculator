const cal = require('../../calculators/calendar');
export default class MonthlyView {
    static get iteration() { return 'monthly'; }
    static get dateName() { return 'day of month'; }
    getTextInputHtml() {
        let txHtmlInput = '<select class="date form-control"><option>Day of Month</option>';
        for (let day = 1; day <= cal.SAFE_LAST_DAY_OF_MONTH; day++) {
            txHtmlInput += `<option
            value=${new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), day)).toISOString()}>${day}</option>`;
        }
        txHtmlInput += '</select>';
        return txHtmlInput;
    }
    getDateText(date) {
        return new Date(date).getUTCDate();
    }
}