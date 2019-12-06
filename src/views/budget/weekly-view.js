const cal = require('../../calculators/calendar');
export default class WeeklyView {
    static get iteration() { return 'weekly'; }
    static get dateName() { return 'day of week'; }
    getDateWithDay(day) {
        let date = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
        let distance = day - date.getUTCDay();
        date.setDate(date.getDate() + distance);
        return date.toISOString();
    }
    getTextInputHtml() {
        let txtHtmlInput = '<select class="date form-control"><option>Day of Week</option>';
        for (let day = 0; day < 7; day++) {
            txtHtmlInput += `<option value="${this.getDateWithDay(day)}">${cal.DAY_NAMES[day]}</option>`;
        }
        txtHtmlInput += '</select>';
        return txtHtmlInput;
    }
    getDateText(date) {
        return cal.DAY_NAMES[new Date(date).getUTCDay()];
    }
}