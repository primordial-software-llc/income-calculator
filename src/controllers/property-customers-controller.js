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
    getCustomerDescription(customerPaymentSetting) {
        let fullName = `${customerPaymentSetting.firstName || ''} ${customerPaymentSetting.lastName || ''}`.trim();
        if (fullName) {
            fullName = ' : ' + fullName;
        }
        return `${customerPaymentSetting.displayName}${fullName}`;
    }
    getView(customerPaymentSetting) {
        let paymentFrequency = customerPaymentSetting.paymentFrequency || '&nbsp;';
        let amount = customerPaymentSetting.rentPrice
            ? Util.format(customerPaymentSetting.rentPrice) : '&nbsp;';
        let memo = customerPaymentSetting.memo || '&nbsp;';
        return `
            <div class="row dotted-underline-row customer-row">
                <div class="col-xs-5 vertical-align customer-balance-column">
                    <div class="black-dotted-underline">
                        <a class="customer-link" href="./property-customer-edit.html?id=${customerPaymentSetting.id}">${this.getCustomerDescription(customerPaymentSetting)}</a>
                    </div>
                </div>
                <div class="col-xs-2 vertical-align">
                    <div class="black-dotted-underline p-left-15">${paymentFrequency}</div>
                </div>
                <div class="col-xs-2 text-right vertical-align">
                    <div class="black-dotted-underline p-left-15">${amount}</div>
                </div>
                <div class="col-xs-3 vertical-align">
                    <div class="black-dotted-underline p-left-15">${memo}</div>
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