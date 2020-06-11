import AccountSettingsController from './account-settings-controller';
const balanceSheetView = require('../views/balance-sheet/balance-sheet-view');
const DataClient = require('../data-client');
import LoanViewModel from '../views/balance-sheet/loan-view-model';
import BalanceSheetViewModel from '../view-models/balance-sheet-view-model';
const Util = require('../util');

async function refresh() {
    try {
        let data = await new DataClient().getBudget();
        let bankData = await new DataClient().get('accountBalance'); // Synchronous so there are no uncaught promises if authentication fails. Call to budget is fast anyway.
        let obfuscate = Util.obfuscate();
        let viewModel = BalanceSheetViewModel.getViewModel(data, bankData, obfuscate);
        balanceSheetView.setView(viewModel, obfuscate);
    } catch (err) {
        Util.log(err);
    }
}
export default class BalanceSheetController {
    static getName() {
        return 'Balance Sheet';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/balance-sheet.html`;
    }
    async init(usernameResponse) {
        new AccountSettingsController().init(balanceSheetView, usernameResponse);
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