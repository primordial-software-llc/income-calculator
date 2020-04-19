const Util = require('../../util');
import WeeklyView from './weekly-view';
import MonthlyView from './monthly-view';
import BiweeklyView from './biweekly-view';
function sortByAmount(a,b) {
    return b.amount - a.amount;
}
function getTransactionModel(target) {
    return {
        amount: Util.cleanseNumericString($(target).find('.amount').text().trim()) ||
                Util.cleanseNumericString($(target).find('.amount').val().trim()),
        date: $(target).find('.date').val().trim() || $(target).find('.date').data().date,
        name: $(target).find('.name').val().trim() || $(target).find('.name').text().trim(),
        type: $(target).find('.transaction-type').val() || $(target).data().txntype,
        paymentSource: $(target).find('select.transaction-payment-source').val() ||
            $(target).find('span.transaction-payment-source').text() ||
            $(target).find('.name').text() ||
            $(target).find('.name').val()
    };
}
export default class BudgetView {
    constructor() {
        this.data = {};
    }
    static getEditableTransactionView(viewType, accounts) {
        let iteration = viewType.iteration;
        let paymentSourceHtml = '';
        for (let paymentSource of accounts) {
            paymentSourceHtml += `<option value='${paymentSource}'>${paymentSource}</option>`;
        }
        return `<h4>New ${iteration.charAt(0).toUpperCase()}${iteration.slice(1)} Transaction</h4>
                <form class="transferring container-fluid ${iteration}-budget-item new-transaction-view">
                <div class="form-group row display-flex">
                    <div class="col-xs-3 display-flex-valign-center">Amount:</div>
                    <div class="col-xs-9"><input placeholder="Amount" class="amount form-control text-right" type="text" /></div>
                </div>
                <div class="form-group row display-flex">
                    <div class="col-xs-3 display-flex-valign-center capitalize">${viewType.dateName}:</div>
                    <div class="col-xs-9">${new viewType().getTextInputHtml()}</div>
                </div>
                <div class="form-group row display-flex">
                  <div class="col-xs-3 display-flex-valign-center">Name:</div>
                  <div class="col-xs-9"><input placeholder="Name" class="name form-control" type="text" /></div>
                </div>
                <div class="form-group row display-flex">
                  <div class="col-xs-3">Income or Expense:</div>
                  <div class="col-xs-9">
                      <select class="transaction-type form-control">
                        <option>Transaction Type</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                  </div>
                </div>
                <div class="form-group row display-flex">
                  <div class="col-xs-3">Account:</div>
                  <div class="col-xs-9">
                      <select class="transaction-payment-source form-control">
                        <option value="">Account</option>
                        ${paymentSourceHtml};
                      </select>
                  </div>
                </div>
            </form>`;
    };
    getTransactionView(transaction, viewType, disable) {
        let date = transaction.date || '';
        transaction.type = transaction.type || 'expense';
        let paidReceivedVerbiage = transaction.type.toLowerCase() === 'expense' ? 'paid by' : 'received at';
        let paidByHtml = transaction.paymentSource ?
            ` <div class="payment-source-appended-to-name">${paidReceivedVerbiage} <span class="transaction-payment-source">${transaction.paymentSource}</span></div>`
            : '';
        let view = $(`
        <div class="row transaction-input-view ${viewType.iteration}-budget-item budget-${transaction.type}-item display-flex" data-txntype="${transaction.type}">
            <div class="col-xs-2 display-flex-valign-center capitalize">
                ${transaction.type}
            </div>
            <div class="col-xs-2 display-flex-valign-center text-right amount color-black">
                $${transaction.amount ? Util.formatShares(transaction.amount) : Util.format(0)}
            </div>
            <div class="col-xs-3 display-flex-valign-center"><span class="date" data-date="${date}">${new viewType().getDateText(date)}</span></div>
            <div class="col-xs-4 display-flex-valign-center"><span class="name">${transaction.name || ''}</span>${paidByHtml}</div>
            <div class="col-xs-1 add-remove-btn-container display-flex-valign-center">
                <button ${disable ? 'disabled="disabled"' : ''} class="btn remove row-remove-button add-remove-btn-container add-remove-btn">
                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>
            </div>
        </div>`);
        view.find('.row-remove-button').click(function () { view.remove(); });
        return view;
    };
    setView(budget, obfuscate) {
        this.data = budget;
        for (let transaction of budget.biweekly) {
            $('#biweekly-input-group').append(this.getTransactionView(transaction, BiweeklyView, obfuscate));
        }
        for (let transaction of budget.weeklyRecurringExpenses) {
            $('#weekly-input-group').append(this.getTransactionView(transaction, WeeklyView, obfuscate));
        }
        for (let transaction of budget.monthlyRecurringExpenses) {
            $('#monthly-input-group').append(this.getTransactionView(transaction, MonthlyView, obfuscate));
        }
        $('.add-new-budget-item').prop('disabled', obfuscate);
    };
    getModel() {
        let budgetSettings = {
            biweekly: [],
            monthlyRecurringExpenses: [],
            weeklyRecurringExpenses: []
        };

        $('.biweekly-budget-item, .monthly-income-item').each(function () {
            budgetSettings.biweekly.push(getTransactionModel(this));
        });

        $('.monthly-budget-item').each(function () {
            budgetSettings.monthlyRecurringExpenses.push(getTransactionModel(this));
        });
        $('.weekly-budget-item').each(function () {
            budgetSettings.weeklyRecurringExpenses.push(getTransactionModel(this));
        });

        budgetSettings.biweekly.sort(sortByAmount);
        budgetSettings.monthlyRecurringExpenses.sort(sortByAmount);
        budgetSettings.weeklyRecurringExpenses.sort(sortByAmount);
        return budgetSettings;
    };
}