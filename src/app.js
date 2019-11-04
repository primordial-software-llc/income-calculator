const HomeController = require('./controllers/home-controller');
const BudgetCalendarController = require('./controllers/budget-calendar-controller');
const BalanceSheetController = require('./controllers/balance-sheet-controller');
const PayDaysController = require('./controllers/pay-days-controller');
const AccountsController = require('./controllers/accounts-controller');
const DepositController = require('./controllers/deposit-controller');
const PricesController = require('./controllers/prices-controller');
const LoginController = require('./controllers/login-controller');
const Nav = require('./nav');
const AccountSettingsView = require('./views/account-settings-view');
const Util = require('./util');

$(document).ready(function () {
    'use strict';
    Nav.initNav($('.tab-nav-bar'));
    let controller;
    let pageName = window.location.href.split('/').pop().toLocaleLowerCase();
    if (pageName.startsWith('index.html')) {
        controller = new HomeController();
    } else if (pageName.startsWith('balance-sheet.html')) {
        controller = new BalanceSheetController();
    } else if (pageName.startsWith('pay-days.html')) {
        controller = new PayDaysController();
    } else if (pageName.startsWith('accounts.html')) {
        controller = new AccountsController();
    } else if (pageName.startsWith('budget-calendar.html')) {
        controller = new BudgetCalendarController();
    } else if (pageName.startsWith('deposit.html')) {
        controller = new DepositController();
    } else if (pageName.startsWith('prices.html')) {
        controller = new PricesController();
    } else if (pageName.startsWith('login.html')) {
        controller = new LoginController();
    }
    $('#command-buttons-container').append(AccountSettingsView.getCommandButtonsContainerView());
    $('body').append('<div id="page-footer"></div>');
    $('#page-footer').append(`<div id="debug-console" class="no-print"></div>`);
    $('#page-footer').append(`<div id="account-settings-container"></div>`).append(AccountSettingsView.getAccountSettingsView());
    $('#page-footer').append(`<div id="raw-data-container"></div>`).append(AccountSettingsView.getRawDataView());
    controller.init(Util.settings());
});
