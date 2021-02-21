import PropertyPointOfSaleController from "./controllers/property-point-of-sale-controller";
import PropertyCustomerBalancesController from "./controllers/property-customer-balances-controller";
import PropertyCustomersController from "./controllers/property-customers-controller";
import PropertyCustomerEditController from "./controllers/property-customer-edit-controller";
import PropertySpotsController from "./controllers/property-spots-controller";
import PropertyTransactionsController from "./controllers/property-transactions-controller";
import PropertyReportsController from "./controllers/property-reports-controller";

export default class PropertyNav {
    static getNavControllers(user) {
        let authenticatedControllers = [];
        let email = ((user || {}).email || '').toLowerCase();
        if (email === 'timg456789@yahoo.com' ||
            email === 'kmanrique506@hotmail.com' ||
            email === 'taniagkocher@gmail.com' ||
            email === 'cvillavicencio921@gmail.com') {
            authenticatedControllers.push(PropertyPointOfSaleController);
            authenticatedControllers.push(PropertyCustomerBalancesController);
            authenticatedControllers.push(PropertyCustomersController);
            authenticatedControllers.push(PropertyCustomerEditController);
            authenticatedControllers.push(PropertySpotsController);
            authenticatedControllers.push(PropertyTransactionsController);
        }
        if (email === 'timg456789@yahoo.com' ||
            email === 'kmanrique506@hotmail.com') {
            authenticatedControllers.push(PropertyReportsController);
        }
        return authenticatedControllers;
    }
}