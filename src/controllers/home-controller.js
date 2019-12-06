import HomeView from '../views/home-view';
import WeeklyView from '../views/budget/weekly-view';
import MonthlyView from '../views/budget/monthly-view';
import BiweeklyView from '../views/budget/biweekly-view';
const DataClient = require('../data-client');
const AccountSettingsController = require('./account-settings-controller');
const Util = require('../util');

export default class HomeController {
    constructor() {
        this.dataClient = {};
        this.homeView = {};
    }
    async refresh() {
        try {
            let data = await this.dataClient.getBudget();
            this.homeView.setView(data, Util.obfuscate());
        } catch (err) {
            Util.log(err);
        }
    }
    init() {
        this.homeView = new HomeView();
        this.dataClient = new DataClient();
        new AccountSettingsController().init(this.homeView);
        let self = this;
        $('.add-new-budget-item').prop('disabled', true);
        $('#add-new-biweekly').click(function () {
            $(this).hide();
            $('.new-biweekly-container').prepend(self.homeView.getEditableTransactionView(BiweeklyView));
        });
        $('#add-new-monthly').click(function () {
            $(this).hide();
            $('.new-monthly-container').prepend(self.homeView.getEditableTransactionView(MonthlyView));
        });
        $('#add-new-weekly').click(function () {
            $(this).hide();
            $('.new-weekly-container').prepend(self.homeView.getEditableTransactionView(WeeklyView));
        });
        this.refresh();
    };
}