const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
const Util = require('../util');
export default class PropertyCustomerBalancesController {
    static getName() {
        return 'Balances';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-customer-balances.html`;
    }
    getCustomerDescription(customerPaymentSetting) {
        let fullName = `${customerPaymentSetting.firstName || ''} ${customerPaymentSetting.lastName || ''}`.trim();
        if (fullName) {
            fullName = ' : ' + fullName;
        }
        return `${customerPaymentSetting.displayName}${fullName}`;
    }
    async init(user) {
        let self = this;
        new AccountSettingsController().init({}, user, false);
        this.customers = await new DataClient().get('point-of-sale/customer-payment-settings');
        for (let customer of this.customers.filter(x => x.balance > 0)) {
            $('.customer-balance-container').append(`
                <div class="row dotted-underline-row customer-balance-row">
                    <div class="col-xs-7 vertical-align customer-balance-column">
                        <div class="black-dotted-underline">
                            ${this.getCustomerDescription(customer)}
                        </div>
                    </div>
                    <div class="col-xs-2 vertical-align customer-balance-column">
                        <div class="black-dotted-underline">
                            ${customer.paymentFrequency}
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