const cal = require('../calculators/calendar');
const CalendarCalculator = require('../calendar-calculator');
const calCalc = new CalendarCalculator();
function HomeView() {
    let self = this;
    let data;
    function getTxInputHtmlMonthly() {
        let txHtmlInput = '<select class="date form-control"><option>Day of Month</option>';
        for (let day = 1; day <= cal.SAFE_LAST_DAY_OF_MONTH; day++) {
            txHtmlInput += `<option
            value=${new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), day)).toISOString()}>${day}</option>`;
        }
        txHtmlInput += '</select>';
        return txHtmlInput;
    }
    function getTxInputHtmlWeekly() {
        let txtHtmlInput = '<select class="date form-control"><option>Day of Week</option>';
        for (let day = 0; day < 7; day++) {
            txtHtmlInput += `<option value="${getDateWithDay(day)}">${cal.DAY_NAMES[day]}</option>`;
        }
        txtHtmlInput += '</select>';
        return txtHtmlInput;
    }
    function getDateWithDay(day) {
        let date = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
        let distance = day - date.getUTCDay();
        date.setDate(date.getDate() + distance);
        return date.toISOString();
    }
    function getTransactionModel(target) {
        return {
            amount: $(target).find('.amount').val().trim(),
            date: $(target).find('.date').val().trim() || $(target).find('.date').data().date,
            name: $(target).find('.name').val().trim() || $(target).find('.name').text().trim(),
            type: $(target).find('.transaction-type').val() || $(target).data().txntype,
            paymentSource: $(target).find('.transaction-payment-source').val() || $(target).find('.transaction-payment-source').text()
        };
    }
    this.getEditableTransactionView = function (iteration) {
        let paymentSourceHtml = '';
        for (paymentSource of data.paymentSources) {
            paymentSourceHtml += `<option value='${paymentSource}'>${paymentSource}</option>`;
        }
        return `<h4>New ${iteration.charAt(0).toUpperCase()}${iteration.slice(1)} Transaction</h4>
                <form class="transferring container-fluid ${iteration}-expense-item new-transaction-view">
                <div class="form-group row">
                    <div class="col-xs-6"><input placeholder="Amount" class="amount form-control text-right" type="text" /></div>
                </div>
                <div class="form-group row">
                    <div class="col-xs-12">
                        ${iteration === 'weekly' ? getTxInputHtmlWeekly() : getTxInputHtmlMonthly()}
                    </div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-12"><input placeholder="Name" class="name form-control" type="text" /></div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-12">
                      <select class="transaction-type form-control">
                        <option>Transaction Type</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-xs-12">
                      <select class="transaction-payment-source form-control">
                        <option>Payment Method</option>
                        ${paymentSourceHtml};
                      </select>
                  </div>
                </div>
            </form>`;
    };
    this.getTransactionView = function (transaction, iteration, disable) {
        let date = transaction.date || '';
        transaction.type = transaction.type || 'expense';
        let paidByHtml = transaction.paymentSource ?
            ` <span class="payment-source-appended-to-name">paid by <span class="transaction-payment-source">${transaction.paymentSource}</span></span>`
            : '';
        let view = $(`
        <div class="row transaction-input-view ${iteration}-${transaction.type}-item" data-txntype="${transaction.type}">
            <div class="col-xs-4">
                <div class="input-group">
                    <div class="input-group-addon ">$</div>
                    <input class="amount form-control" type="text" value="${transaction.amount ? transaction.amount : ''}" />
                </div>
            </div>
            <div class="col-xs-3"><span class="date" data-date="${date}">${iteration === 'weekly'
            ? cal.DAY_NAMES[new Date(date).getUTCDay()]
            : new Date(date).getUTCDate()}</span></div>
            <div class="col-xs-4"><span class="name">${transaction.name || ''}</span>${paidByHtml}</div>
            <div class="col-xs-1 add-remove-btn-container">
                <button ${disable ? 'disabled="disabled"' : ''} class="btn remove row-remove-button add-remove-btn-container add-remove-btn">
                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>
            </div>
        </div>`);
        view.find('.row-remove-button').click(function () { view.remove(); });
        return view;
    };
    this.setView = function (budget, obfuscate) {
        data = budget;
        'use strict';
        $('#biweekly-input').val(budget.biWeeklyIncome.amount);
        $('#weekly-input-group').empty();
        $('#monthly-input-group').empty();
        for (let transaction of budget.weeklyRecurringExpenses) {
            $('#weekly-input-group').append(self.getTransactionView(transaction, 'weekly', obfuscate));
        }
        for (let transaction of budget.monthlyRecurringExpenses) {
            $('#monthly-input-group').append(self.getTransactionView(transaction, 'monthly', obfuscate));
        }
        if (data.licenseAgreement && data.licenseAgreement.agreedToLicense) {
            $('#acceptLicense').prop('checked', true);
            $('#acceptLicense').prop('disabled', true);
            $('.licenseAgreementDetails').append(`agreed to license on ${data.licenseAgreement.agreementDateUtc} from IP ${data.licenseAgreement.ipAddress}`);
        }
        if (!obfuscate) {
            $('#add-new-monthly').prop('disabled', false);
            $('#add-new-weekly').prop('disabled', false);
        }
    };
    this.getModel = function () {
        'use strict';
        let budgetSettings = {};
        budgetSettings.biWeeklyIncome = {};
        budgetSettings.biWeeklyIncome.amount = parseInt($('#biweekly-input').val().trim());
        budgetSettings.biWeeklyIncome.date = new Date(Date.UTC(2015, 11, 25));
        budgetSettings.monthlyRecurringExpenses = [];
        $('.monthly-expense-item, .monthly-income-item').each(function () {
            budgetSettings.monthlyRecurringExpenses.push(getTransactionModel(this));
        });
        budgetSettings.monthlyRecurringExpenses.sort(function(a,b) {
            return b.amount - a.amount;
        });
        budgetSettings.weeklyRecurringExpenses = [];
        $('.weekly-expense-item').each(function () {
            budgetSettings.weeklyRecurringExpenses.push(getTransactionModel(this));
        });
        budgetSettings.weeklyRecurringExpenses.sort(function(a,b) {
            return b.amount - a.amount;
        });
        return budgetSettings;
    };
}
module.exports = HomeView;
