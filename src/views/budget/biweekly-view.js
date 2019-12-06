export default class BiweeklyView {
    static get iteration() { return 'biweekly'; }
    static get dateName() { return 'start date'; }
    getTextInputHtml() {
        return `<input type="text" placeholder="2015-12-25T00:00:00Z" class="date form-control" />`;
    }
    getDateText(date) {
        return date;
    }
}