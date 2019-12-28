const AccountSettingsController = require('./account-settings-controller');
const balanceSheetView = require('../views/balance-sheet/balance-sheet-view');
const Currency = require('currency.js');
const DataClient = require('../data-client');
const LoanViewModel = require('../views/balance-sheet/loan-view-model');
const Util = require('../util');

async function refresh() {
    try {
        let data = await new DataClient().getBudget();
        let bankData = await new DataClient().get('accountBalance'); // Synchronous so there are no uncaught promises if authentication fails. Call to budget is fast anyway.
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
}
function getViewModel(data, bankData) {
    let viewModel = JSON.parse(JSON.stringify(data));
    viewModel.assets = viewModel.assets || [];
    viewModel.balances = viewModel.balances || [];
    for (let bankAccount of bankData.allAccounts || []) {
        for (let account of bankAccount.accounts.filter(x => x.type === 'depository')) {
            viewModel.assets.push({
                type: 'cash',
                name: `${bankAccount.item.institution.name} - ${account.subtype} - ${account.mask}`,
                amount: account.balances.available,
                currentBalance: account.balances.current,
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
export default class BalanceSheetController {
    static getName() {
        return 'Balance Sheet';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/balance-sheet.html`;
    }
    async init() {
        new AccountSettingsController().init(balanceSheetView);
        if (Util.obfuscate()) {
            $('#add-new-balance').prop('disabled', true);
        }
        $('#add-new-balance').click(function () {
            $('#balance-input-group').append(new LoanViewModel().getView(
                {
                    name: 'New Loan',
                    rate: '.00',
                    amount: '0',
                    type: 'credit'
                }));
        });
        await refresh();
    };
}