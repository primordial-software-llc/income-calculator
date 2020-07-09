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
        let paymentFrequency = customerPaymentSetting.vendor && customerPaymentSetting.vendor.paymentFrequency
            ? customerPaymentSetting.vendor.paymentFrequency : '';
        let amount = customerPaymentSetting.vendor && customerPaymentSetting.vendor.rentPrice
            ? Util.format(customerPaymentSetting.vendor.rentPrice) : '';
        let memo = customerPaymentSetting.vendor && customerPaymentSetting.vendor.memo
            ? customerPaymentSetting.vendor.memo : ''
        return `
            <div class="row dotted-underline-row customer-balance-row">
                <div class="col-xs-5 vertical-align customer-balance-column">
                    <div class="black-dotted-underline">
                        ${this.getCustomerDescription(customerPaymentSetting.customer)}
                    </div>
                </div>
                <div class="col-xs-2 vertical-align customer-balance-column">
                    <div class="black-dotted-underline p-left-15">
                        <select class="form-control">
                            <option value=""></option>
                            <option ${ paymentFrequency === 'monthly' ? 'selected="selected"' : ''} value="monthly">Monthly</option>
                            <option ${ paymentFrequency === 'weekly' ? 'selected="selected"' : ''} value="weekly">Weekly</option>
                        </select>
                    </div>
                </div>
                <div class="col-xs-2 text-right vertical-align customer-balance-column">
                    <div class="black-dotted-underline p-left-15">
                        <input class="form-control" value="${amount}" placeholder="0.00" type="number" />
                    </div>
                </div>
                <div class="col-xs-3 vertical-align customer-balance-column">
                    <div class="black-dotted-underline p-left-15">
                        <textarea class="form-control">${memo}</textarea>
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