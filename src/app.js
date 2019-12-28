const AccountSettingsView = require('./views/account-settings-view');
const DataClient = require('./data-client');
import DepositController from './controllers/deposit-controller';
import BalanceSheetController from './controllers/balance-sheet-controller';
import BanksController from './controllers/banks-controller';
import BudgetCalendarController from './controllers/budget-calendar-controller';
import BudgetController from './controllers/budget-controller';
const LoginController = require('./controllers/login-controller');
import LoginSignupController from './controllers/login-signup-controller';
import Navigation from './nav';
import PayDaysController from './controllers/pay-days-controller';
import PricesController from './controllers/prices-controller';
import TransfersController from './controllers/transfers-controller';
const Util = require('./util');

async function init() {
    'use strict';
    let obfuscate = Util.obfuscate();
    $('#command-buttons-container').append(AccountSettingsView.getCommandButtonsContainerView(obfuscate));
    $('body').append('<div id="page-footer"></div>');
    $('#page-footer').append(`
        <hr />
        <p class="text-center">By browsing and using this site you agree to our <a target="_blank" href="https://www.primordial-software.com/LICENSE.txt">license</a>
    `);
    $('#page-footer').append(`<div id="debug-console" class="no-print"></div>`);
    $('#page-footer').append(`<div id="account-settings-container"></div>`).append(AccountSettingsView.getAccountSettingsView());
    $('#page-footer').append(`<div id="raw-data-container"></div>`).append(AccountSettingsView.getRawDataView());
    $('#page-footer').append(`
        <div class="loader-container loader-group hide modal fade in" id="account-settings-view" role="dialog" style="display: block; padding-right: 17px;">
              <div class="modal-dialog">
                <div class="loader"></div>
              </div>
          </div>
        <div class="loader-group hide modal-backdrop fade in"></div>
    `);
    let pageName = window.location.href.split('/').pop().toLocaleLowerCase();
    let usernameResponse;
    try {
        if (!pageName.startsWith('login.html') &&
            !pageName.startsWith('login-signup.html')) {
            usernameResponse = await new DataClient().getBudget();
            $('#account-settings-view-cognito-user').text(usernameResponse.email);
            $('#account-settings-view-license-agreement').append(
                `Agreed to license on ${usernameResponse.licenseAgreement.agreementDateUtc} ` +
                `from IP ${usernameResponse.licenseAgreement.ipAddress}`);
        }
    } catch (err) {
        Util.log(err);
    }
    let authenticatedControllers = [ BudgetController, BudgetCalendarController, BalanceSheetController,
        TransfersController, DepositController, PricesController, BanksController ];
    if ((usernameResponse || {}).email === 'timg456789@yahoo.com') {
        authenticatedControllers.push(PayDaysController);
    }
    let root = Util.rootUrl();
    let navItemHtml = authenticatedControllers.map(controllerType =>
        Navigation.getNavItemView(controllerType.getUrl(), controllerType.getName())
    );
    let navView = $(`<div class="container">${navItemHtml.join('')}</div>`);
    $('.tab-nav-bar').append(navView);

    let controller;
    let controllerType = authenticatedControllers.find(x => pageName.startsWith(x.getUrl().split('/').pop()));
    if (controllerType) {
        controller = new controllerType();
    } else if (pageName.startsWith('login.html')) {
        controller = new LoginController();
    } else if (pageName.startsWith('login-signup.html')) {
        controller = new LoginSignupController();
    }
    try {
        await controller.init();
    } catch (error) {
        Util.log(error);
    }
}

$(document).ready(function () {
    init();
});