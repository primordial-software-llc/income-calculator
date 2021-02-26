import AccountSettingsController from './account-settings-controller';
import CustomerDescription from '../customer-description';
import CustomerSort from '../customer-sort';
import DataClient from '../data-client';
import Navigation from '../nav';
const Util = require('../util');
export default class PropertyCustomerBalancesController {
    static getName() {
        return 'Balances';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-customer-balances.html`;
    }
    static hideInNav() {
        return true;
    }
    static showInPropertyNav() {
        return true;
    }
    async init(user) {
        $('.property-navigation').append(Navigation.getPropertyNav(user, PropertyCustomerBalancesController.getUrl()));
        new AccountSettingsController().init({}, user, false);
        this.customers = await new DataClient().get('point-of-sale/customer-payment-settings');
        this.customers.sort(CustomerSort.sort);
        for (let customer of this.customers.filter(x => x.balance > 0)) {
            $('.customer-balance-container').append(`
                <div class="row dotted-underline-row customer-balance-row">
                    <div class="col-xs-7 vertical-align customer-balance-column">
                        <div class="black-dotted-underline">
                            ${CustomerDescription.getCustomerDescription(customer)}
                        </div>
                    </div>
                    <div class="col-xs-2 vertical-align customer-balance-column">
                        <div class="black-dotted-underline">
                            ${customer.paymentFrequency || ''}
                        </div>
                    </div>
                    <div class="col-xs-3 text-right vertical-align customer-balance-column">
                        <div class="black-dotted-underline">
                            ${Util.format(customer.balance)}
                        </div>
                    </div>
                </div>
            `);
        }
    }
}