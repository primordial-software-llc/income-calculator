import CommandButtonsView from './views/command-buttons-view';
import DataClient from './data-client';
import FooterView from './views/footer-view';
import HomeController from './controllers/home-controller';
const LoginController = require('./controllers/login-controller');
import LoginSignupController from './controllers/login-signup-controller';
import Navigation from './nav';
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
    let authenticatedControllers = Navigation.getAuthenticatedControllers(usernameResponse);
    let controllerType = authenticatedControllers.find(x => pageName.startsWith(x.getUrl().split('/').pop()));
    let controller;
    if (controllerType) {
        controller = new controllerType();
    }
    if (pageName.startsWith('login.html')) {
        controller = new LoginController();
    } else if (pageName.startsWith('login-signup.html')) {
        controller = new LoginSignupController();
    } else if (pageName.startsWith('index.html')) {
        controller = new HomeController();
    }
    try {
        if (controller) {
            await controller.init(usernameResponse);
        }
    } catch (error) {
        Util.log(error);
    }

}

$(document).ready(function () {
    init();
});