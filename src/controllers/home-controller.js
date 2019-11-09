const HomeView = require('../views/home-view');
const DataClient = require('../data-client');
const AccountSettingsController = require('./account-settings-controller');
const Util = require('../util');
function HomeController() {
    'use strict';
    let dataClient;
    let homeView;
    async function refresh() {
        try {
            let data = await dataClient.sendRequest('budget');
            homeView.setView(data);
            $('#add-new-monthly').prop('disabled', false);
            $('#add-new-weekly').prop('disabled', false);
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function (settings) {
        homeView = new HomeView();
        dataClient = new DataClient(settings);
        new AccountSettingsController().init(settings, homeView);
        $('#add-new-monthly').prop('disabled', true);
        $('#add-new-weekly').prop('disabled', true);
        $('#add-new-monthly').click(function () {
            $(this).hide();
            $('.new-monthly-container').prepend(homeView.getEditableTransactionView('monthly'));
        });
        $('#add-new-weekly').click(function () {
            $(this).hide();
            $('.new-weekly-container').prepend(homeView.getEditableTransactionView('weekly'));
        });
        refresh();
    };
}
module.exports = HomeController;