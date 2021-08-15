import BudgetController from './controllers/budget-controller';
import BudgetCalendarController from './controllers/budget-calendar-controller';
import BalanceSheetController from './controllers/balance-sheet-controller';
import TransfersController from './controllers/transfers-controller';
import TransactionsController from './controllers/transactions-controller';
import DepositController from './controllers/deposit-controller';
import PricesController from './controllers/prices-controller';
import PayDaysController from './controllers/pay-days-controller';
import PurchaseController from './controllers/purchase-controller';
import BanksController from "./controllers/banks-controller";
import PropertyPointOfSaleController from './controllers/property-point-of-sale-controller';
import PropertyCustomerBalancesController from './controllers/property-customer-balances-controller';
import PropertyCustomersController from './controllers/property-customers-controller';
import PropertyCustomerEditController from './controllers/property-customer-edit-controller';
import PropertySpotsController from './controllers/property-spots-controller';
import PropertyReportsController from './controllers/property-reports-controller';
import PropertyTransactionsController from './controllers/property-transactions-controller';
import QrTestController from './controllers/qr-test-controller';
import PropertySettingsController from './controllers/property-settings-controller';
import PropertyApp from './property-app';

export default class Navigation {
    static getPropertyNav(user, currentControllerUrl) {
        let navContainer = $('<div></div>');
        let controllers = this.getAuthenticatedControllers(user)
            .filter(x => x.showInPropertyNav && x.showInPropertyNav());
        for (let controller of controllers) {
            var link = $(`<a class="property-nav-item" href="${controller.getUrl()}">${controller.getName()}</a>`);
            if (controller.getUrl() === currentControllerUrl)
            {
                link.addClass('property-selected-nav-item');
            }
            navContainer.append(link);
        }
        return navContainer;
    }
    static getNavItemView(url, name) {
        return `<a class="tab-nav-item" href="${url}" title="${name}">
                  <span class="ac-gn-link-text">${name}</span>
              </a>`;
    }
    static getAuthenticatedControllers(user) {
        let authenticatedControllers = [ BudgetController, BudgetCalendarController, BalanceSheetController,
            TransfersController, DepositController, PricesController ];
        if (((user || {}).email || '').toLowerCase() === 'timg456789@yahoo.com') {
            authenticatedControllers.push(PayDaysController);
        }
        let email = ((user || {}).email || '').toLowerCase();
        if (new PropertyApp().isPropertyAppUser(email)) {
            authenticatedControllers.push(PropertyPointOfSaleController);
            authenticatedControllers.push(PropertyCustomerBalancesController);
            authenticatedControllers.push(PropertyCustomersController);
            authenticatedControllers.push(PropertyCustomerEditController);
            authenticatedControllers.push(PropertyTransactionsController);
            authenticatedControllers.push(QrTestController);
            authenticatedControllers.push(PropertySettingsController);
            if (user.propertyLocationId.toLowerCase() === '6b14e1ca-78a7-42a6-900a-4b837f07e613') {
                authenticatedControllers.push(PropertySpotsController);
            }
        }
        if (email === 'timg456789@yahoo.com' ||
            email === 'kmanrique506@hotmail.com') {
            authenticatedControllers.push(PropertyReportsController);
        }
        if (!(user || {}).billingAgreement || !(user || {}).billingAgreement.agreedToBillingTerms) {
            authenticatedControllers.push(PurchaseController);
        } else {
            authenticatedControllers.push(BanksController);
            authenticatedControllers.push(TransactionsController)
        }
        return authenticatedControllers;
    }
}