const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
const Util = require('../util');
export default class PropertyCustomersController {
    static getName() {
        return 'Vendors';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-customers.html`;
    }
    getCustomerDescription(customer) {
        let fullName = `${customer.GivenName || ''} ${customer.FamilyName || ''}`.trim();
        if (fullName) {
            fullName = ' : ' + fullName;
        }
        return `${customer.DisplayName}${fullName}`;
    }
    getView(customerPaymentSetting) {
        return `
            <div class="row dotted-underline-row customer-balance-row">
                <div class="col-xs-5 vertical-align customer-balance-column">
                    <div class="black-dotted-underline">
                        ${this.getCustomerDescription(customerPaymentSetting.customer)}
                    </div>
                </div>
                <div class="col-xs-2 text-right vertical-align customer-balance-column">
                    <div class="black-dotted-underline">
                        ${customerPaymentSetting.vendor ? customerPaymentSetting.vendor.paymentFrequency || '' : ''}
                    </div>
                </div>
                <div class="col-xs-2 text-right vertical-align customer-balance-column">
                    <div class="black-dotted-underline">
                        ${customerPaymentSetting.vendor && customerPaymentSetting.vendor.rentPrice
                            ? Util.format(customerPaymentSetting.vendor.rentPrice) : ''}
                    </div>
                </div>
                <div class="col-xs-3 text-right vertical-align customer-balance-column">
                    <div class="black-dotted-underline">
                        ${customerPaymentSetting.vendor ? customerPaymentSetting.vendor.memo || '' : ''}
                    </div>
                </div>
            </div>`;
    }
    async init(user) {
        let self = this;
        new AccountSettingsController().init({}, user, false);
        this.customerPaymentSettings = await new DataClient().get('point-of-sale/customer-payment-settings');
        for (let customer of this.customerPaymentSettings) {
            $('.customers-container').append(this.getView(customer));
        }
    }
}