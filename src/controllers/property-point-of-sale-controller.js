import Currency from 'currency.js';
const Moment = require('moment/moment');
const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
const PayDaysView = require('../views/pay-days-view');
const Util = require('../util');
function getView(paymentNumber, payDate) {
    return `<div class="row">
                    <div class="col-xs-1 text-right">${paymentNumber}</div>
                    <div class="col-xs-11">${payDate}</div>
                </div>`;
}
export default class PropertyPointOfSaleController {
    static getName() {
        return 'Property';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-point-of-sale.html`;
    }
    initForm() {
        $('#sale-has-paid').prop('checked', true);
        $('#sale-date').val(Moment().format('YYYY-MM-DD'));
        $('#sale-phone').val('');
    }
    async init(usernameResponse) {
        this.initForm();
        new AccountSettingsController().init(PayDaysView, usernameResponse, false);
        this.customers = await new DataClient().get('point-of-sale/customers');
        let customers = this.customers;

        for (let customer of this.customers) {
            $('#sale-vendor-list').append(`<option>${customer.DisplayName}</option>`);
        }

        $("#sale-vendor").on('input', function () {
            let input = this.value;
            let customerMatch = customers.find(x =>
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

            window.print();
        });

        //console.log(data);
    }
}