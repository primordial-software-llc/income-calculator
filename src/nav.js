import BudgetController from "./controllers/budget-controller";
import BudgetCalendarController from "./controllers/budget-calendar-controller";
import BalanceSheetController from "./controllers/balance-sheet-controller";
import TransfersController from "./controllers/transfers-controller";
import DepositController from "./controllers/deposit-controller";
import PricesController from "./controllers/prices-controller";
import PayDaysController from "./controllers/pay-days-controller";
import PropertyPointOfSaleController from "./controllers/property-point-of-sale-controller";
import PurchaseController from "./controllers/purchase-controller";
import BanksController from "./controllers/banks-controller";

export default class Navigation {
    static getNavItemView(url, name) {
        return `<a class="tab-nav-item" href="${url}" title="${name}">
                  <span class="ac-gn-link-text">${name}</span>
              </a>`;
    }
    static getAuthenticatedControllers(usernameResponse) {
        let authenticatedControllers = [ BudgetController, BudgetCalendarController, BalanceSheetController,
            TransfersController, DepositController, PricesController ];
        if ((usernameResponse || {}).email === 'timg456789@yahoo.com') {
            authenticatedControllers.push(PayDaysController);
            authenticatedControllers.push(PropertyPointOfSaleController);
        }
        if (!(usernameResponse || {}).billingAgreement || !(usernameResponse || {}).billingAgreement.agreedToBillingTerms) {
            authenticatedControllers.push(PurchaseController);
        } else {
            authenticatedControllers.push(BanksController);
        }
        return authenticatedControllers;
    }
}