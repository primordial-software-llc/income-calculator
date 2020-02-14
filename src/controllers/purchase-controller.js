const AccountSettingsController = require('./account-settings-controller');
const DataClient = require('../data-client');
const Moment = require('moment');
const PricesView = require('../views/prices-view');
const Util = require('../util');
export default class PricesController {
    static getName() {
        return 'Purchase Full Version';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/purchase.html`;
    }
    async init() {
        new AccountSettingsController().init(PricesView);
        $('#billing-start-date').text(Moment().format('MMMM Do YYYY'));
        $('#submit-purchase').click(async function() {
            if (!$('#agreedToBillingTerms').is(':checked')) {
                $('#message-container').html(`
                    <div class="alert alert-danger" role="alert">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <p class="mb-0">You must agree to the billing terms.</p>
                    </div>`);
                $('.billing-terms-field').addClass('required-field-description');
                $('.billing-terms-field').addClass('required-field-validation');
            } else {
                $('.billing-terms-field').removeClass('required-field-description');
                $('.billing-terms-field').removeClass('required-field-validation');
                $('#message-container').html(``);
                $('#submit-purchase').prop('disabled',true);

                await new DataClient().post('purchase',
                    {
                        agreedToBillingTerms: $('#agreedToBillingTerms').is(':checked'),
                        cardCvc: $('#cardCvc').val().trim(),
                        cardNumber: $('#cardNumber').val().trim(),
                        cardExpirationMonth: $('#cardExpirationMonth').val().trim(),
                        cardExpirationYear: $('#cardExpirationYear').val().trim()
                    });

                $('.purchase-form').hide();
                $('#message-container').html(`
                    <div class="alert alert-success" role="alert">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <p class="mb-0">
                            Purchase successful, you now have access to the <a href="/pages/banks.html">Banks</a> page.
                            Your card has been charged.
                        </p>
                    </div>`);
            }
        });
    };
}