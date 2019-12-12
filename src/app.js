const AccountsController = require('./controllers/accounts-controller');
const BudgetCalendarController = require('./controllers/budget-calendar-controller');
const BalanceSheetController = require('./controllers/balance-sheet-controller');
import HomeController from './controllers/home-controller';
const PayDaysController = require('./controllers/pay-days-controller');
const DepositController = require('./controllers/deposit-controller');
const PricesController = require('./controllers/prices-controller');
const LoginController = require('./controllers/login-controller');
const LoginSignupController = require('./controllers/login-signup-controller');
const LinkBankAccountController = require('./controllers/link-bank-account-controller');
const Nav = require('./nav');
const AccountSettingsView = require('./views/account-settings-view');
const Util = require('./util');
const DataClient = require('./data-client');

async function init() {
    'use strict';
    let pageName = window.location.href.split('/').pop().toLocaleLowerCase();
    let showPayroll;
    let usernameResponse;
    try {
        if (!pageName.startsWith('login.html')) { // Avoid infinite loop when logged outf
            usernameResponse = await new DataClient().get('getusername');
            showPayroll = (usernameResponse || '').username === 'timg456789@yahoo.com';
        }
    } catch (err) {
        Util.log(err);
    }
    let navView = Nav.getNavView(showPayroll);
    $('.tab-nav-bar').append(navView);
    let controller;
    if (pageName === '' || pageName.startsWith('index.html')) {
        controller = new HomeController();
    } else if (pageName.startsWith('balance-sheet.html')) {
        controller = new BalanceSheetController();
    } else if (pageName.startsWith('pay-days.html')) {
        controller = new PayDaysController();
    } else if (pageName.startsWith('budget-calendar.html')) {
        controller = new BudgetCalendarController();
    }  else if (pageName.startsWith('accounts.html')) {
        controller = new AccountsController();
    } else if (pageName.startsWith('deposit.html')) {
        controller = new DepositController();
    } else if (pageName.startsWith('prices.html')) {
        controller = new PricesController();
    } else if (pageName.startsWith('login.html')) {
        controller = new LoginController();
    } else if (pageName.startsWith('login-signup.html')) {
        controller = new LoginSignupController();
    } else if (pageName.startsWith('link-bank-account.html')) {
        controller = new LinkBankAccountController();
    }
    let obfuscate = Util.obfuscate();
    $('#command-buttons-container').append(AccountSettingsView.getCommandButtonsContainerView(obfuscate));
    $('body').append('<div id="page-footer"></div>');
    $('#page-footer').append(`
        <hr />
        <p class="text-center">By browsing and using this site you agree to our <a target="_blank" href="https://www.primordial-software.com/LICENSE.txt">license</a>
    `);
    $('#page-footer').append(`<div id="debug-console" class="no-print"></div>`);
    $('#page-footer').append(`<div id="account-settings-container"></div>`).append(AccountSettingsView.getAccountSettingsView());
    $('#account-settings-view-cognito-user').val((usernameResponse || '').username);
    $('#page-footer').append(`<div id="raw-data-container"></div>`).append(AccountSettingsView.getRawDataView());
    $('#page-footer').append(`
        <div class="loader-container loader-group hide modal fade in" id="account-settings-view" role="dialog" style="display: block; padding-right: 17px;">
              <div class="modal-dialog">
                <div class="loader"></div>
              </div>
          </div>
        <div class="loader-group hide modal-backdrop fade in"></div>
    `);
    controller.init();
}

$(document).ready(function () {
    init();
});