export default class CalendarMonthlyTotalsView {
    static getView(monthContainerId, monthName, year) {
        return `
        <div class="month-heading-totals-container color-white">
            <div class="month-heading font-subheading1 color-imago-cream">${monthName} ${year}</div>
            <div class="month-heading-totals-headers row color-imago-cream">
                <div class="col-xs-3 text-center"><span class="month-heading-total-description">&nbsp;</span></div>
                <div class="col-xs-2 text-center">Income</div>
                <div class="col-xs-2 text-center">Expenses</div>
                <div class="col-xs-5"><button type="button" class="btn btn-info show-breakdown-by-source no-print">Show Account Totals</button></div>
            </div>
            <div class="month-heading-totals-values row">
                <div class="col-xs-3 white-subtotal-line">Subtotal</div>
                <div class="col-xs-2 white-subtotal-line month-heading-total text-right"><span id="month-credits-header-value"></span></div>
                <div class="col-xs-2 white-subtotal-line month-heading-total text-right"><span id="month-debits-header-value"></span></div>
                <div class="col-xs-5">&nbsp;</div>
            </div>
            <div class="row">
                <div class="col-xs-3 total">Total</div>
                <div class="col-xs-2 total text-right">&nbsp;</div>
                <div class="col-xs-2 total month-heading-total text-right"><span id="month-net-header-value"></span></div>
                <div class="col-xs-5">&nbsp;</div>
            </div>
        </div>
        <div class="items-container-for-month" id="${monthContainerId}"></div>`.trim();
    }
}