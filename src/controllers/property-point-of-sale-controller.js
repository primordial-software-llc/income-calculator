import Currency from 'currency.js';
const Moment = require('moment/moment');
const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
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
        $('#sale-phone').prop('disabled', false).val('');
        $('#sale-amount-of-account').prop('disabled', false).val('');
        $('#sale-rental-amount').prop('disabled', false).val('');
        $('#sale-payment').prop('disabled', false).val('');
        $('#sale-memo').prop('disabled', false).val('');
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
            let input = this.value;
            let customerMatch = self.customers.find(x =>
                (x.DisplayName || '').toLocaleLowerCase() === (input || '').toLowerCase());
            if (customerMatch) {
                $('#sale-amount-of-account').val(customerMatch.Balance);
                if (customerMatch.PrimaryPhone) {
                    $('#sale-phone').val(customerMatch.PrimaryPhone.FreeFormNumber || '');
                }
            }
        });

        $('#sale-save').click(function() {
            $('#sale-timestamp').text(Moment().format('L LT'));
            $('#sale-date-text').text($('#sale-date').val());
            $('#sale-vendor-text').text($('#sale-vendor').val());
            let amountOfAccount = Currency($('#sale-amount-of-account').val(), Util.getCurrencyDefaults());
            let rentalAmount = Currency($('#sale-rental-amount').val(), Util.getCurrencyDefaults());
            let payment = Currency($('#sale-payment').val(), Util.getCurrencyDefaults());
            $('#sale-amount-of-account-text').text(Util.format(amountOfAccount.toString()));
            $('#sale-rental-amount-text').text(Util.format(rentalAmount.toString()));
            $('#sale-payment-text').text(Util.format(payment.toString()));
            let balanceDue = amountOfAccount.add(rentalAmount);
            balanceDue = balanceDue.subtract(payment);
            $('#sale-balance-due-text').text(Util.format(balanceDue.toString()));
            let memo = $('#sale-memo').val().trim();
            $('.memo-receipt-group').toggle(!!memo);
            $('#sale-memo-text').text(memo);

            $('#sale-date').prop('disabled', true);
            $('#sale-vendor').prop('disabled', true);
            $('#sale-phone').prop('disabled', true);
            $('#sale-amount-of-account').prop('disabled', true);
            $('#sale-rental-amount').prop('disabled', true);
            $('#sale-payment').prop('disabled', true);
            $('#sale-memo').prop('disabled', true);

            window.print();
        });

        $('#sale-new').click(function() {
            self.initForm();
        });
    }
}