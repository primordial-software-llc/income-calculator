import Currency from 'currency.js';
const Moment = require('moment/moment');
const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
import MessageViewController from './message-view-controller';
const Util = require('../util');
export default class PropertyPointOfSaleController {
    static getName() {
        return 'Property';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-point-of-sale.html`;
    }
    initForm() {
        $('#sale-date').prop('disabled', false).val(Moment().format('YYYY-MM-DD'));
        $('#sale-vendor').prop('disabled', false).val('');
        $('#sale-amount-of-account').prop('disabled', false).val('');
        $('#sale-rental-amount').prop('disabled', false).val('');
        $('#sale-payment').prop('disabled', false).val('');
        $('#sale-memo').prop('disabled', false).val('');
    }
    getCustomer(displayName) {
        return this.customers.find(x =>
            (x.DisplayName || '').toLocaleLowerCase() === (displayName || '').toLowerCase());
    }
    async init(usernameResponse) {
        let self = this;
        this.initForm();
        new AccountSettingsController().init({}, usernameResponse, false);
        this.customers = await new DataClient().get('point-of-sale/customers');
        for (let customer of this.customers) {
            $('#sale-vendor-list').append(`<option>${customer.DisplayName}</option>`);
        }
        $("#sale-vendor").on('input', function () {
            let customer = self.getCustomer(this.value);
            if (customer) {
                $('#sale-amount-of-account').val(customer.Balance);
            }
        });
        $('#sale-save').click(async function() {
            MessageViewController.setMessage('');
            let vendor = $("#sale-vendor").val().trim();
            let customerMatch = self.getCustomer(vendor);
            let receipt = {
                rentalDate: $('#sale-date').val().trim(),
                customer: {
                    id: customerMatch ? customerMatch.Id : '',
                    name: vendor
                },
                amountOfAccount: $('#sale-amount-of-account').val().trim(),
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
                if (!receiptResult.receipt && !receiptResult.receipt.id) {
                    Util.log(receiptResult);
                    MessageViewController.setMessage(JSON.stringify(receiptResult), 'alert-danger');
                    return;
                }
                $('#sale-id').text(receiptResult.receipt.id);
                let timestamp = Moment(receiptResult.receipt.timestamp);
                $('#sale-timestamp').text(timestamp.format('L LT'));
                $('#sale-date-text').text(receipt.rentalDate);
                $('#sale-vendor-text').text(receipt.customer.name);
                let amountOfAccount = Currency(receipt.amountOfAccount, Util.getCurrencyDefaults());
                $('.amount-of-account-receipt-group').toggle(!!receipt.amountOfAccount);
                let rentalAmount = Currency(receipt.rentalAmount, Util.getCurrencyDefaults());
                let payment = Currency(receipt.thisPayment, Util.getCurrencyDefaults());
                $('#sale-amount-of-account-text').text(Util.format(amountOfAccount.toString()));
                $('#sale-rental-amount-text').text(Util.format(rentalAmount.toString()));
                $('#sale-payment-text').text(Util.format(payment.toString()));
                let balanceDue = amountOfAccount.add(rentalAmount);
                balanceDue = balanceDue.subtract(payment);
                $('#sale-balance-due-text').text(Util.format(balanceDue.toString()));
                $('.memo-receipt-group').toggle(!!receipt.memo);
                $('#sale-memo-text').text(receipt.memo);
                $('#sale-date').prop('disabled', true);
                $('#sale-vendor').prop('disabled', true);
                $('#sale-amount-of-account').prop('disabled', true);
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
        $('#sale-new').click(function() {
            // self.initForm(); // should refresh fields only, but I need an accurate balance returned from post receipt.
            window.location.reload();
        });
    }
}