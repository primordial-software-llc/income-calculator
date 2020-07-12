import Currency from 'currency.js';
const Moment = require('moment/moment');
const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
import MessageViewController from './message-view-controller';
const Util = require('../util');
export default class PropertyPointOfSaleController {
    static getName() {
        return 'Receipts';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-point-of-sale.html`;
    }
    initForm() {
        $('#sale-date').prop('disabled', false).val(Moment().format('YYYY-MM-DD'));
        $('#sale-vendor').prop('disabled', false).val('');
        $('#sale-prior-balance').prop('disabled', false).val('');
        $('#sale-rental-amount').prop('disabled', false).val('');
        $('#sale-payment').prop('disabled', false).val('');
        $('#sale-memo').prop('disabled', false).val('');
    }
    getCustomerDescription(customer) {
        let fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        if (fullName) {
            fullName = ' : ' + fullName;
        }
        return `${customer.displayName}${fullName}`;
    }
    getCustomer(customerDescription) {
        return this.customers.find(x =>
            this.getCustomerDescription(x).toLowerCase().replace(/\s+/g, " ") ===
                customerDescription.toLowerCase().replace(/\s+/g, " ")); // Data list and input automatically replace multiple whitespaces with a single white space
    }
    async init(user) {
        let self = this;
        this.initForm();
        new AccountSettingsController().init({}, user, false);
        this.customers = await new DataClient().get('point-of-sale/customer-payment-settings');
        for (let customer of this.customers) {
            $('#sale-vendor-list').append(`<option>${this.getCustomerDescription(customer)}</option>`);
        }
        $("#sale-vendor").on('input', function () {
            let customer = self.getCustomer(this.value);
            if (customer) {
                $('#sale-prior-balance').val(customer.balance);
                $('#sale-payment-frequency').text(customer.paymentFrequency);
            } else {
                $('#sale-prior-balance').val('');
                $('#sale-payment-frequency').text('');
            }
        });
        $('#sale-save').click(async function() {
            MessageViewController.setMessage('');
            let vendor = $("#sale-vendor").val().trim();
            let customerMatch = self.getCustomer(vendor);
            let receipt = {
                rentalDate: $('#sale-date').val().trim(),
                customer: {
                    id: customerMatch ? customerMatch.quickBooksOnlineId : '',
                    name: vendor
                },
                amountOfAccount: $('#sale-prior-balance').val().trim(),
                rentalAmount: $('#sale-rental-amount').val().trim(),
                thisPayment: $('#sale-payment').val().trim(),
                memo: $('#sale-memo').val().trim()
            };
            try {
                let receiptResult = await new DataClient().post('point-of-sale/receipt', receipt);
                if (receiptResult.error) {
                    MessageViewController.setMessage(receiptResult.error, 'alert-danger');
                    return;
                }
                if (!receiptResult.id) {
                    Util.log(receiptResult);
                    MessageViewController.setMessage(JSON.stringify(receiptResult), 'alert-danger');
                    return;
                }
                $('#sale-id').text(receiptResult.id);
                let receiptNumber = '';
                if (receiptResult.invoice) {
                    receiptNumber += `I${receiptResult.invoice.Id}`;
                }
                if (receiptResult.paymentAppliedToInvoice) {
                    receiptNumber += `AP${receiptResult.paymentAppliedToInvoice.Id}`;
                }
                if (receiptResult.unappliedPayment) {
                    receiptNumber += `UP${receiptResult.unappliedPayment.Id}`;
                }
                $('#receipt-number').text(receiptNumber);
                let saleBy = (`${user.firstName} ${user.lastName}`.trim() || user.email);
                $('#sale-by').text(saleBy);
                let timestamp = Moment(receiptResult.timestamp);
                $('#sale-timestamp').text(timestamp.format('L LT'));
                $('#sale-date-text').text(receipt.rentalDate);
                $('#sale-vendor-text').text(receipt.customer.name);
                let amountOfAccount = Currency(receipt.amountOfAccount, Util.getCurrencyDefaults());
                $('.prior-balance-receipt-group').toggle(!!receipt.amountOfAccount);
                let rentalAmount = Currency(receipt.rentalAmount, Util.getCurrencyDefaults());
                let payment = Currency(receipt.thisPayment, Util.getCurrencyDefaults());
                $('#sale-prior-balance-text').text(Util.format(amountOfAccount.toString()));
                $('#sale-rental-amount-text').text(Util.format(rentalAmount.toString()));
                $('#sale-payment-text').text(Util.format(payment.toString()));
                let balanceDue = amountOfAccount.add(rentalAmount);
                balanceDue = balanceDue.subtract(payment);
                $('#sale-new-balance-text').text(Util.format(balanceDue.toString()));
                $('.memo-receipt-group').toggle(!!receipt.memo);
                $('#sale-memo-text').text(receipt.memo);
                $('#sale-date').prop('disabled', true);
                $('#sale-vendor').prop('disabled', true);
                $('#sale-prior-balance').prop('disabled', true);
                $('#sale-rental-amount').prop('disabled', true);
                $('#sale-payment').prop('disabled', true);
                $('#sale-memo').prop('disabled', true);
                $('#sale-save').prop('disabled', true);
                window.print();
            } catch (error) {
                Util.log(error);
                MessageViewController.setMessage(JSON.stringify(error), 'alert-danger');
            }
        });
        $('#sale-print').click(function () {
            window.print();
        });
        $('#sale-new').click(function() {
            // self.initForm(); // should refresh fields only, but I need an accurate balance returned from post receipt.
            window.location.reload();
        });
    }
}