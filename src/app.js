import BalanceSheetController from './controllers/balance-sheet-controller';
import BanksController from './controllers/banks-controller';
import BudgetCalendarController from './controllers/budget-calendar-controller';
import BudgetController from './controllers/budget-controller';
import CommandButtonsView from './views/command-buttons-view';
const DataClient = require('./data-client');
import DepositController from './controllers/deposit-controller';
import FooterView from './views/footer-view';
import HomeController from './controllers/home-controller';
const LoginController = require('./controllers/login-controller');
import LoginSignupController from './controllers/login-signup-controller';
import Navigation from './nav';
import PayDaysController from './controllers/pay-days-controller';
import PurchaseController from './controllers/purchase-controller';
import PricesController from './controllers/prices-controller';
import TransfersController from './controllers/transfers-controller';
const Util = require('./util');

async function init() {
    $('body').append(FooterView.getLoadingIndicatorView());
    let obfuscate = Util.obfuscate();
    $('#command-buttons-container').append(CommandButtonsView.getCommandButtonsView(obfuscate));
    let pageName = window.location.href.split('/').pop().toLocaleLowerCase();
    let usernameResponse;
    try {
        if (pageName &&
            !pageName.startsWith('login.html') &&
            !pageName.startsWith('login-signup.html')) {
            usernameResponse = await new DataClient().getBudget();
        }
    } catch (err) {
        Util.log(err);
    }
    let authenticatedControllers = [ BudgetController, BudgetCalendarController, BalanceSheetController,
        TransfersController, DepositController, PricesController ];
    if ((usernameResponse || {}).email === 'timg456789@yahoo.com') {
        authenticatedControllers.push(PayDaysController);
    }
    if (!(usernameResponse || {}).hasPurchased) {
        authenticatedControllers.push(PurchaseController);
    } else {
        authenticatedControllers.push(BanksController);
    }
    let navItemHtml = authenticatedControllers.map(controllerType =>
        Navigation.getNavItemView(controllerType.getUrl(), controllerType.getName())
    );
    $('.tab-nav-bar').append(navItemHtml.join(''));
    let controller;
    let controllerType = authenticatedControllers.find(x => pageName.startsWith(x.getUrl().split('/').pop()));
    if (controllerType) {
        controller = new controllerType();
        $('body').append(FooterView.getView(navItemHtml.join('')));
        if (usernameResponse) {
            $('#account-settings-view-cognito-user').text(usernameResponse.email);
            $('#account-settings-view-license-agreement').append(
                `Agreed to license on ${usernameResponse.licenseAgreement.agreementDateUtc} ` +
                `from IP ${usernameResponse.licenseAgreement.ipAddress}`);
        }
    } else if (pageName.startsWith('login.html')) {
        controller = new LoginController();
    } else if (pageName.startsWith('login-signup.html')) {
        controller = new LoginSignupController();
    } else if (pageName.startsWith('index.html')) {
        controller = new HomeController();
    }
    try {
        if (controller) {
            await controller.init();
        }
    } catch (error) {
        Util.log(error);
    }

}

$(document).ready(function () {
    init();
});