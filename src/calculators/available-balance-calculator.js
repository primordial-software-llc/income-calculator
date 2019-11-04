const Currency = require('currency.js');
const Util = require('../util');
function AvailableBalanceCalculator() {
    this.getAvailableBalance = function (accountName, startingBalance, allPendingTransfers) {
        return (allPendingTransfers || []).filter(x =>
            x.creditAccount.toLowerCase() === accountName.toLowerCase() ||
            x.debitAccount.toLowerCase() === accountName.toLowerCase())
                .reduce((sumTransfer, transfer) => {
                    sumTransfer.amount = transfer.creditAccount.toLowerCase() === accountName.toLowerCase()
                        ? sumTransfer.amount.add(Util.getAmount(transfer))
                        : sumTransfer.amount.subtract(Util.getAmount(transfer));
                    return sumTransfer;
        }, {amount: Currency(startingBalance, Util.getCurrencyDefaults())}).amount.toString();
    };
}
module.exports = AvailableBalanceCalculator;