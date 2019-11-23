const Currency = require('currency.js');
const Util = require('../util');
function AvailableBalanceCalculator() {
    this.getAvailableBalance = function (accountName, startingBalance, allPendingTransfers, accountType,
                                         accountId) {
        return (allPendingTransfers || []).filter(x =>
            x.creditAccount.toLowerCase() === accountName.toLowerCase() || // No credit id while accounts are typed with free-text
            x.debitId === accountId
        ).reduce((sumTransfer, transfer) => {
                    sumTransfer.amount =
                        transfer.creditAccount.toLowerCase() === accountName.toLowerCase() &&
                        (transfer.type || '').toLowerCase() === (accountType || '').toLowerCase()
                            ? sumTransfer.amount.add(Util.getAmount(transfer))
                            : sumTransfer.amount.subtract(Util.getAmount(transfer));
                    return sumTransfer;
        }, {amount: Currency(startingBalance, Util.getCurrencyDefaults())}).amount.toString();
    };
}
module.exports = AvailableBalanceCalculator;