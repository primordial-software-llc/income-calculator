const cal = require('../../calculators/calendar');
const PayoffDateCalculator = require('../../calculators/payoff-date-calculator');
const payoffDateCalculator = new PayoffDateCalculator();
const Util = require('../../util');
const Currency = require('currency.js');
export default class LoanViewModel {
    getModels() {
        let balances = [];
        let self = this;
        $('.balance-item.editable').each(function () {
            balances.push(self.getModel(this));
        });
        return balances;
    }
    getModel(target) {
        return {
            "amount": Util.cleanseNumericString($(target).find('input.amount').val().trim()),
            "name": $(target).find('input.name').val().trim(),
            "rate": Util.cleanseNumericString($(target).find('input.rate').val().trim())
        };
    }
    getView(debt, weeklyAmount, disable) {
        let payOffDateText;
        let totalInterestText;
        let lifetimeInterestText;
        if (weeklyAmount) {
            try {
                let balanceStatement = payoffDateCalculator.getPayoffDate({
                    startTime: Date.UTC(
                        new Date().getUTCFullYear(),
                        new Date().getUTCMonth(),
                        new Date().getUTCDate()
                    ),
                    totalAmount: debt.amount,
                    payment: weeklyAmount,
                    DayOfTheWeek: cal.FRIDAY,
                    rate: debt.rate
                });
                payOffDateText = balanceStatement.date.getUTCFullYear() + '-' +
                    (balanceStatement.date.getUTCMonth() + 1) + '-' +
                    balanceStatement.date.getUTCDate();
                totalInterestText = Util.format(Math.ceil(balanceStatement.totalInterest));
            } catch (err) {
                payOffDateText = err;
                totalInterestText = err;
            }
            lifetimeInterestText = Currency(totalInterestText).divide(debt.amount).multiply(100).toString() + '%';
        } else {
            let isCreditCard = debt.type === 'credit';
            payOffDateText = isCreditCard ? 'no payment specified' : 'WARNING: no payment specified'; // Warning is intended for long-term loans.
            let infinitySymbol = '&#8734;';
            totalInterestText = isCreditCard ? 'N/A' : infinitySymbol;
            lifetimeInterestText = isCreditCard ? 'N/A' : infinitySymbol;
        }
        let icon = debt.isAuthoritative
            ? `<span title="This account data is current and directly from your bank account" alt="This account data is current and directly from your bank account" class="glyphicon glyphicon-cloud" aria-hidden="true" style="color: #5cb85c;"></span>`
            : '';
        let view = $(`<div class="balance-item row transaction-input-view ${debt.isAuthoritative ? 'read-only' : 'editable'}">
                    <div class="col-xs-2">
                        <input
                            ${debt.isAuthoritative ? 'disabled=disabled' : ''}
                            class="amount form-control text-right"
                            type="text"
                            value="${Util.format(debt.amount || '0')}" />
                    </div>
                    <div class="col-xs-3">
                        <div class="input-group">
                            <div class="input-group-addon ">${icon}</div>
                            <input ${debt.isAuthoritative ? 'disabled=disabled' : ''} class="name form-control" type="text" value="${debt.name || ''}" />
                        </div>
                    </div>
                    <div class="col-xs-1"><input ${debt.isAuthoritative ? 'disabled=disabled' : ''} class="rate form-control text-right" type="text" value="${debt.rate || 'Unknown'}" /></div>
                    <div class="col-xs-2 text-center vertical-align amount-description-column">${payOffDateText}</div>
                    <div class="col-xs-2 text-right vertical-align amount-description-column">${totalInterestText}</div>
                    <div class="col-xs-1 text-right vertical-align amount-description-column">${lifetimeInterestText}</div>
                    </div>
        `);
        if (!debt.isAuthoritative) {
            let removeButtonHtml = `<div class="col-xs-1">
                                <button ${disable ? 'disabled="disabled"' : ''} class="btn remove add-remove-btn" title="Remove Loan">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                </button>
                            </div>`;
            let removeButton = $(removeButtonHtml);
            removeButton.click(function () {
                view.remove();
            });
            view.append(removeButton);
        }
        return view;
    }
}