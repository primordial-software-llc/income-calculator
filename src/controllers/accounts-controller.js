const AccountSettingsController = require('./account-settings-controller');
const AccountsView = require('../views/accounts-view');
const AvailableBalanceCalculator = require('../calculators/available-balance-calculator');
const balanceSheetView = require('../views/balance-sheet/balance-sheet-view');
const Currency = require('currency.js');
const DataClient = require('../data-client');
const Util = require('../util');
function AccountsController() {
    'use strict';
    let dataClient;
    async function cancelTransfer(transferId) {
        try {
            let data = await dataClient.getBudget();
            let patch = {};
            patch.pending = data.pending.filter(x => x.id != transferId);
            await dataClient.patch(patch);
            window.location.reload();
        } catch (error) {
            Util.log(error);
        }
    }
    async function completeTransfer(transferId) {
        let data = await dataClient.getBudget();
        let patch = { assets: data.assets || [] };
        let credit = data.pending.find(x => x.id === transferId);
        credit.type = credit.type || '';
        patch.pending = data.pending.filter(x => x.id !== transferId);
        let debitAccount = patch.assets.find(x => x.id === credit.debitId);
        let creditAmount = Util.getAmount(credit);
        if (debitAccount.shares && debitAccount.sharePrice) {
            let newDebitAmount = Currency(Util.getAmount(debitAccount), Util.getCurrencyDefaults()).subtract(Util.getAmount(credit)).toString();
            debitAccount.shares = Currency(newDebitAmount, Util.getCurrencyDefaults()).divide(debitAccount.sharePrice).toString();
        } else {
            debitAccount.amount = Currency(debitAccount.amount, Util.getCurrencyDefaults()).subtract(creditAmount).toString();
        }
        if (credit.type.toLowerCase() !== 'expense') {
            let creditAccount = patch.assets.find(asset =>
                (asset.type || '').toLowerCase() == (credit.type).toLowerCase() &&
                (asset.name || '').toLowerCase() === credit.creditAccount.toLowerCase());
            if (!creditAccount) {
                delete credit.creditAccount;
                delete credit.debitAccount;
                delete credit.transferDate;
                creditAccount = {
                    name: credit.name,
                    amount: credit.amount,
                    sharePrice: credit.sharePrice,
                    shares: credit.shares,
                    daysToMaturation: credit.daysToMaturation,
                    id: credit.id,
                    issueDate: credit.issueDate,
                    type: credit.type
                };
                patch.assets.push(creditAccount);
            } else {
                if (credit.shares && credit.sharePrice) {
                    creditAccount.shares = Currency(creditAccount.shares, Util.getCurrencyDefaults()).add(credit.shares).toString();
                } else {
                    creditAccount.amount = Currency(creditAccount.amount, Util.getCurrencyDefaults()).add(credit.amount).toString();
                }
            }
        }
        patch.assets = patch.assets.filter(x => Currency(Util.getAmount(x)).intValue > 0);
        try {
            await dataClient.patch(patch);
            window.location.reload();
        } catch (err) {
            Util.log(err);
        }
    }
    function setView(data) {
        for (let transfer of data.pending || []) {
            let transferView = AccountsView.getTransferView(transfer);
            transferView.find('.cancel-transfer').click(function () { cancelTransfer(transfer.id) });
            transferView.find('.complete-transfer').click(function () { completeTransfer(transfer.id) });
            $('.accounts-container').append(transferView);
        }
        return;
    }
    async function refresh() {
        try {
            let data = await dataClient.getBudget('budget');
            setView(data);
            if (location.hash && document.querySelector(location.hash)) {
                window.scrollTo(0, document.querySelector(location.hash).offsetTop);
            }
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function () {
        dataClient = new DataClient();
        new AccountSettingsController().init(balanceSheetView);
        refresh();
    };
}

module.exports = AccountsController;