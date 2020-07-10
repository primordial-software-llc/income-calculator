const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
import MessageViewController from './message-view-controller';
const Util = require('../util');
export default class PropertyCustomersController {
    static getName() {
        return 'Customer Edit';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-customer-edit.html`;
    }
    static hideInNav() {
        return true;
    }
    getCustomerDescription(customer) {
        let fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        if (fullName) {
            fullName = ' : ' + fullName;
        }
        return `${customer.displayName}${fullName}`;
    }
    async init(user) {
        let self = this;
        new AccountSettingsController().init({}, user, false);
        let customer = await new DataClient()
            .get(`point-of-sale/customer-payment-settings-by-id?id=${Util.getParameterByName("id")}`);

        $('#customer-vendor').text(this.getCustomerDescription(customer));
        $('#payment-frequency').val(customer.paymentFrequency);
        $('#rental-amount').val(customer.rentPrice);
        $('#memo').text(customer.memo);

        $('#vendor-save').click(async function () {
            let updates = {
                id: customer.id
            };
            let newPaymentFrequency = $('#payment-frequency').val().trim();
            if (customer.paymentFrequency !== newPaymentFrequency) {
                updates.paymentFrequency = newPaymentFrequency;
            }
            let newRentalAmount = $('#rental-amount').val().trim();
            newRentalAmount = parseFloat(newRentalAmount);
            if (customer.rentPrice !== newRentalAmount) {
                if (newRentalAmount !== Util.cleanseNumericString(newRentalAmount)) {
                    MessageViewController.setMessage('Rental amount isn\'t a valid amount', 'alert-danger');
                    return;
                }
                updates.rentPrice = newRentalAmount;
            }
            let newMemo = $('#memo').val().trim();
            if (customer.memo !== newMemo) {
                if (newMemo && newMemo.length > 4000) {
                    MessageViewController.setMessage('Memo can\'t exceed 4,000 characters', 'alert-danger');
                    return;
                }
                updates.memo = newMemo;
            }

            let vendor = await new DataClient().patch(`point-of-sale/vendor`, updates);

            MessageViewController.setMessage('Vendor saved', 'alert-success');
        });
    }
}