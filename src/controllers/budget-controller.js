import AccountSettingsController from './account-settings-controller';
import BalanceSheetViewModel from '../view-models/balance-sheet-view-model';
import BudgetView from '../views/budget/budget-view';
import WeeklyView from '../views/budget/weekly-view';
import MonthlyView from '../views/budget/monthly-view';
import BiweeklyView from '../views/budget/biweekly-view';
import DataClient from '../data-client';
const Util = require('../util');

export default class BudgetController {
    static getName() {
        return 'Budget';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/budget.html`;
    }
    constructor() {
        this.homeView = new BudgetView();
    }
    async refresh(budget) {
        try {
            this.homeView.setView(budget, Util.obfuscate(), await this.getAccounts(budget));
        } catch (err) {
            Util.log(err);
        }
    }
    async getAccounts(budget) {
        let bankData = await new DataClient().get('accountBalance');
        let viewModel = BalanceSheetViewModel.getViewModel(budget, bankData, Util.obfuscate());
        return (viewModel.assets || []).map(x => x.name);
    }
    async init(usernameResponse) {
        new AccountSettingsController().init(this.homeView, usernameResponse, true);
        $('.add-new-budget-item').prop('disabled', true);
        let self = this;
        $('#add-new-biweekly').click(async function () {
            $(this).hide();
            let accounts = await self.getAccounts(await new DataClient().getBudget());
            $('.new-biweekly-container').prepend(BudgetView.getEditableTransactionView(BiweeklyView, accounts));
        });
        $('#add-new-monthly').click(async function () {
            $(this).hide();
            let accounts = await self.getAccounts(await new DataClient().getBudget());
            $('.new-monthly-container').prepend(BudgetView.getEditableTransactionView(MonthlyView, accounts));
        });
        $('#add-new-weekly').click(async function () {
            $(this).hide();
            let accounts = await self.getAccounts(await new DataClient().getBudget());
            $('.new-weekly-container').prepend(BudgetView.getEditableTransactionView(WeeklyView, accounts));
        });
        await this.refresh(usernameResponse);
    };
}