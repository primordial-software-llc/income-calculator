const AccountSettingsController = require('./account-settings-controller');
const DataClient = require('../data-client');
import MessageViewController from './message-view-controller';
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
                MessageViewController.setMessage('You must agree to the billing terms.', 'alert-danger', '');
                $('.billing-terms-field').addClass('required-field-description');
                $('.billing-terms-field').addClass('required-field-validation');
            } else {
                $('.billing-terms-field').removeClass('required-field-description');
                $('.billing-terms-field').removeClass('required-field-validation');
                MessageViewController.setMessage('');
                $('#submit-purchase').prop('disabled', true);

                try {
                    await new DataClient().post('purchase',
                        {
                            agreedToBillingTerms: $('#agreedToBillingTerms').is(':checked'),
                            cardCvc: $('#cardCvc').val().trim(),
                            cardNumber: $('#cardNumber').val().trim(),
                            cardExpirationMonth: $('#cardExpirationMonth').val().trim(),
                            cardExpirationYear: $('#cardExpirationYear').val().trim()
                        });
                } catch (error) {
                    let parsedError = false;
                    console.log(error);
                    if (error.response) {
                        try {
                            let response = JSON.parse(error.response);
                            MessageViewController.setMessage(response.status, 'alert-danger');
                            parsedError = true;
                        } catch (parsingError) {
                            parsedError = false;
                        }
                    }
                    if (!parsedError) {
                        MessageViewController.setMessage(JSON.stringify(error), 'alert-danger');
                    }
                    $('#submit-purchase').prop('disabled', false);
                    return;
                }
                $('.purchase-form').hide();
                MessageViewController.setMessage(
                    'Purchase successful, you now have access to the <a href="/pages/banks.html">Banks</a> page. Your card has been charged.',
                    'alert-success',
                    true
                );
            }
        });
    };
}