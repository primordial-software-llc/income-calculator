const AccountSettingsController = require('./account-settings-controller');
const balanceSheetView = require('../views/balance-sheet/balance-sheet-view');
const CashOrStockViewModel = require('../views/balance-sheet/cash-or-stock-view-model');
const Currency = require('currency.js');
const DataClient = require('../data-client');
const LoanViewModel = require('../views/balance-sheet/loan-view-model');
const Util = require('../util');
function HomeController() {
    'use strict';
    let dataClient;
    async function refresh() {
        try {
            let data = dataClient.getBudget();
            let bankData = dataClient.get('accountBalance');
            data = await data;
            bankData = await bankData;
            let viewModel = getViewModel(data, bankData);
            if (Util.obfuscate()) {
                obfuscate(viewModel);
            }
            balanceSheetView.setView(viewModel, Util.obfuscate());
        } catch (err) {
            Util.log(err);
        }
    }
    function obfuscate(viewModel) {
        for (let asset of viewModel.assets) {
            if (asset.shares) {
                asset.shares = Currency(asset.shares, Util.getCurrencyDefaults()).multiply(
                    Util.obfuscationAmount()
                ).toString();
            }
            if (asset.amount) {
                asset.amount = Currency(asset.amount, Util.getCurrencyDefaults()).multiply(
                    Util.obfuscationAmount()
                ).toString();
            }
        }
        for (let debt of viewModel.balances) {
            debt.amount = Currency(debt.amount, Util.getCurrencyDefaults()).multiply(
                Util.obfuscationAmount()
            ).toString();
        }
        for (let ppe of viewModel.propertyPlantAndEquipment) {
            ppe.amount = Currency(ppe.amount, Util.getCurrencyDefaults()).multiply(
                Util.obfuscationAmount()
            ).toString();
        }
    }
    function getViewModel(data, bankData) {
        let viewModel = JSON.parse(JSON.stringify(data));
        viewModel.assets = viewModel.assets || [];
        viewModel.balances = viewModel.balances || [];
        for (let bankAccount of bankData.allAccounts) {
            for (let account of bankAccount.accounts.filter(x => x.type === 'depository')) {
                viewModel.assets.push({
                    type: account.type === 'depository' ? 'cash' : '',
                    name: `${bankAccount.item.institution.name} - ${account.subtype} - ${account.mask}`,
                    amount: account.balances.available,
                    id: account['account_id'],
                    isAuthoritative: true
                });
            }
            for (let account of bankAccount.accounts.filter(x => x.type === 'credit')) {
                viewModel.balances.push({
                    type: account.type,
                    name: `${bankAccount.item.institution.name} - ${account.subtype} - ${account.mask}`,
                    amount: account.balances.current,
                    isAuthoritative: true
                });
            }
        }
        return viewModel;
    }
    this.init = function () {
        dataClient = new DataClient();
        new AccountSettingsController().init(balanceSheetView);
        if (Util.obfuscate()) {
            $('#add-new-balance').prop('disabled', true);
        }
        $('#add-new-balance').click(function () {
            $('#balance-input-group').append(new LoanViewModel().getView(100, 'new balance', '.035'));
        });
        refresh();
    };
}

module.exports = HomeController;