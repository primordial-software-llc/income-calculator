const AccountSettingsController = require('./account-settings-controller');
const DataClient = require('../data-client');
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
        let dataClient = new DataClient();
        let data = await dataClient.getBudget();
        if (data.assets) {
            $('#prices-input-group').empty();
            $('#prices-input-group').append(PricesView.getHeaderView());
            for (let asset of data.assets.filter(x => x.sharePrice)) {
                $('#prices-input-group').append(PricesView.getView(asset.name, asset.sharePrice));
            }
        }

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
                        <p class="mb-0">Purchase successful. Your card has been charged and will continue to be charged each month until you cancel.</p>
                    </div>`);
            }
        });
    };
}