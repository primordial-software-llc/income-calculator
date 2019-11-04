const AvailableBalanceCalculator = require('../calculators/available-balance-calculator');
const Currency = require('currency.js');
const DataClient = require('../data-client');
const Moment = require('moment');
const Util = require('../util');
exports.getAccountView = function (account, allPendingTransfers, startingBalance,
                                   cancelTransfer,
                                   completeTransfer) {
    let pendingTransfers = allPendingTransfers.filter(x =>
        x.creditAccount.toLowerCase() === account.toLowerCase() ||
        x.debitAccount.toLowerCase() === account.toLowerCase());
    let accountContainer = $(`
                <div>
                    <h4 id="$account-${account}" class="capitalize-first">${account}</h3>
                    <div class="row table-header-row">
                        <div class="col-xs-3"></div>
                        <div class="col-xs-3">Account</div>
                        <div class="col-xs-2">Debit Amount</div>
                        <div class="col-xs-2">Credit Amount</div>
                        <div class="col-xs-1">Complete</div>
                        <div class="col-xs-1">Cancel</div>
                    </div>   
                </div>`);
    accountContainer.append(getJournalEntryView({
        transferDate: '',
        transferAccount: 'STARTING BALANCE',
        debitAmount: '',
        creditAmount: Util.format(startingBalance)
    }));
    for (let transfer of pendingTransfers) {
        let isCredit = transfer.creditAccount.toLowerCase() === account.toLowerCase();
        let journalEntryView = getJournalEntryView({
            transferDate: Moment(transfer.issueDate || transfer.transferDate).format('LL'),
            transferAccount: isCredit ? transfer.debitAccount : transfer.creditAccount,
            debitAmount: isCredit ? '' : Util.format(Util.getAmount(transfer)),
            creditAmount: isCredit ? Util.format(Util.getAmount(transfer)) : '',
            transferId: transfer.id
        });
        accountContainer.append(journalEntryView);
        journalEntryView.find('.cancel-transfer').click(function () { cancelTransfer(transfer.id) });
        journalEntryView.find('.complete-transfer').click(function () { completeTransfer(transfer.id) });
    }
    let availableBalanceCalculator = new AvailableBalanceCalculator();
    let availableBalance = availableBalanceCalculator.getAvailableBalance(account, startingBalance, allPendingTransfers);
    let totalDebits = Currency(startingBalance, Util.getCurrencyDefaults()).subtract(availableBalance);
    accountContainer.append(`
                    <div class="row">
                        <div class="col-xs-6 subtotal">Totals</div>
                        <div class="col-xs-2 subtotal-amount">${totalDebits.intValue > 0 ? Util.format(totalDebits.toString()) : '&nbsp;'}</div>
                        <div class="col-xs-2 subtotal-amount">${Util.format(availableBalance.toString())}</div>
                        <div class="cols-xs-2">&nbsp;</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-8 total">Total Future Balance</div>
                        <div class="col-xs-2 total total-amount">${Util.format(availableBalance.toString())}</span></div>
                        <div class="cols-xs-2">&nbsp;</div>
                    </div>`);
    return accountContainer;
};
function getJournalEntryView(viewModel) {
    let journalEntryView = $(`
                        <div class="row account-row">
                            <div class="col-xs-3 vertical-align amount-description-column">${viewModel.transferDate}</div>
                            <div class="col-xs-3 vertical-align amount-description-column">${viewModel.transferAccount}</div>
                            <div class="col-xs-2 vertical-align amount-description-column text-right">${viewModel.debitAmount}</div>
                            <div class="col-xs-2 vertical-align amount-description-column text-right">${viewModel.creditAmount}</div>

                        </div>`);
    if (viewModel.transferId) {
        journalEntryView.append(`<div class="col-xs-1 text-center">
                                <button type="button" class="complete-transfer btn btn-success add-remove-btn-container add-remove-btn" title="Complete transfer">
                                    <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
                                </button>
                            </div>
                            <div class="col-xs-1 remove-button-container text-center">
                                <button type="button" class="cancel-transfer btn remove add-remove-btn-container add-remove-btn" title="Cancel transfer">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                </button>
                            </div>`);
    }
    return journalEntryView;
}
