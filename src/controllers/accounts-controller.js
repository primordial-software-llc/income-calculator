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
    let settings;
    function cancelTransfer(transferId) {
        let dataClient = new DataClient(settings);
        dataClient.sendRequest('budget')
            .then(data => {
                let patch = {};
                patch.pending = data.pending.filter(x => x.id != transferId);
                return dataClient.patch(settings.s3ObjectKey, patch);
            })
            .then(putResult => { window.location.reload(); })
            .catch(err => { Util.log(err); });
    }
    async function completeTransfer(transferId) {
        let dataClient = new DataClient(settings);
        let data = await dataClient.sendRequest('budget');
        let patch = { assets: data.assets || [] };
        let credit = data.pending.find(x => x.id === transferId);
        patch.pending = data.pending.filter(x => x.id !== transferId);
        let debitAccount = patch.assets.find(
            x => (x.id && x.id === credit.debitId)
                     /* || (x.name || '').toLowerCase() === credit.debitAccount.toLowerCase()*/); // Fail for now until I get the transfers working.
        if (credit.type && credit.type.toLowerCase() === 'bond' ||
            credit.type && credit.type.toLowerCase() === 'expense' ||
            credit.type && credit.type.toLowerCase() === 'cash') {
            let creditAmount = Util.getAmount(credit);
            // Not going to work for equity -> cash, but I'm not there yet.
            debitAccount.amount = Currency(debitAccount.amount, Util.getCurrencyDefaults()).subtract(creditAmount).toString();
            if (credit.type.toLowerCase() !== 'expense') {
                let creditAccount = patch.assets.find(asset =>
                    (asset.type || '').toLowerCase() == (credit.type || '').toLowerCase() &&
                    (asset.name || '').toLowerCase() === credit.creditAccount.toLowerCase());
                if (!creditAccount) {
                    delete credit.creditAccount;
                    delete credit.debitAccount;
                    delete credit.transferDate;
                    patch.assets.push(credit);
                } else {
                    creditAccount.amount = Currency(creditAccount.amount, Util.getCurrencyDefaults()).add(credit.amount).toString();
                }
            }
        } else if (credit.type && credit.type.toLowerCase() === 'property-plant-and-equipment') {
            debitAccount.shares = Currency(debitAccount.shares, Util.getCurrencyDefaults()).subtract(credit.amount).toString();
            patch.propertyPlantAndEquipment = data.propertyPlantAndEquipment || [];
            patch.propertyPlantAndEquipment.push({
                amount: credit.amount,
                name: credit.name
            });
        } else {
            let newDebitAmount = Currency(Util.getAmount(debitAccount), Util.getCurrencyDefaults()).subtract(Util.getAmount(credit)).toString();
            debitAccount.shares = Currency(newDebitAmount, Util.getCurrencyDefaults()).divide(debitAccount.sharePrice).toString();
            let creditAccount = patch.assets.find(x => x.name.toLowerCase() === credit.creditAccount.toLowerCase());
            if (!creditAccount) {
                creditAccount = {
                    name: credit.creditAccount,
                    shares: credit.shares,
                    sharePrice: credit.sharePrice
                };
                patch.assets.push(creditAccount);
            } else {
                creditAccount.shares = Currency(creditAccount.shares, Util.getCurrencyDefaults()).add(credit.shares).toString();
            }
            if (Currency(debitAccount.shares).intValue < 1) {
                patch.assets = patch.assets.filter(x => x.name.toLowerCase() !== debitAccount.name.toLowerCase());
            }
        }
        patch.assets = patch.assets.filter(x => Currency(Util.getAmount(x)).intValue > 0);
        try {
            await dataClient.patch(settings.s3ObjectKey, patch);
            window.location.reload();
        } catch (err) {
            Util.log(err);
        }
    }
    function setView(data) {
        if (!data.pending) {
            return;
        }
        let accounts = data.pending
            .filter(x => (x.type || '').toLowerCase() !== 'expense')
            .map(x => (x.creditAccount || '').toLowerCase())
            .concat(data.pending.map(x => (x.debitAccount || '').toLowerCase()));
        let uniqueAccounts = new Set(accounts);
        accounts = [...uniqueAccounts];
        for (let account of accounts) {
            let startingBalance = Currency(0, Util.getCurrencyDefaults());
            let settled = [];
            if (account.toLowerCase() === 'bonds') {
                settled = (data.assets || []).filter(x => (x.type || '').toLowerCase() == 'bond');
            } else {
                settled = (data.assets || []).filter(x => (x.name || '').toLowerCase() === account.toLowerCase());
            }
            for (let settledTransaction of settled) {
                startingBalance = startingBalance.add(Util.getAmount(settledTransaction));
            }
            $('.accounts-container').append(AccountsView.getAccountView(account, data.pending, startingBalance.toString(),
                cancelTransfer,
                completeTransfer
            ));
        }
    }
    async function refresh() {
        try {
            let data = await dataClient.sendRequest('budget');
            setView(data);
            if (location.hash && document.querySelector(location.hash)) {
                window.scrollTo(0, document.querySelector(location.hash).offsetTop);
            }
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function (settingsIn) {
        settings = settingsIn;
        dataClient = new DataClient(settings);
        new AccountSettingsController().init(settings, balanceSheetView);
        refresh();
    };
}

module.exports = AccountsController;