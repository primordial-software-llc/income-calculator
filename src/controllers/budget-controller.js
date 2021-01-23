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
    async refresh() {
        try {
            let data = await new DataClient().getBudget();
            this.homeView.setView(data, Util.obfuscate(), await this.getAccounts());
        } catch (err) {
            Util.log(err);
        }
    }
    async getAccounts() {
        let budget = await new DataClient().getBudget();
        let bankData = await new DataClient().get('accountBalance');
        let viewModel = BalanceSheetViewModel.getViewModel(budget, bankData, Util.obfuscate());
        let creditableAccounts = (viewModel.assets || []).filter(x => x.name && x.type === 'cash').map(x => x.name);
        return creditableAccounts.concat((viewModel.balances || []).filter(x => x.type ==='credit').map(x => x.name));
    }
    async init(usernameResponse) {
        new AccountSettingsController().init(this.homeView, usernameResponse, true);
        $('.add-new-budget-item').prop('disabled', true);
        let self = this;
        $('#add-new-biweekly').click(async function () {
            $(this).hide();
            $('.new-biweekly-container').prepend(BudgetView.getEditableTransactionView(BiweeklyView, await self.getAccounts()));
        });
        $('#add-new-monthly').click(async function () {
            $(this).hide();
            $('.new-monthly-container').prepend(BudgetView.getEditableTransactionView(MonthlyView, await self.getAccounts()));
        });
        $('#add-new-weekly').click(async function () {
            $(this).hide();
            $('.new-weekly-container').prepend(BudgetView.getEditableTransactionView(WeeklyView, await self.getAccounts()));
        });
        await this.refresh();
    };
}