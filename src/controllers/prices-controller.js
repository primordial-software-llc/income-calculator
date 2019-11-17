const AccountSettingsController = require('./account-settings-controller');
const DataClient = require('../data-client');
const PricesView = require('../views/prices-view');
const Util = require('../util');
function PricesController() {
    'use strict';
    let dataClient;
    async function initAsync() {
        try {
            let data = await dataClient.getBudget();
            if (data.assets) {
                $('#prices-input-group').empty();
                $('#prices-input-group').append(PricesView.getHeaderView());
                for (let asset of data.assets.filter(x => x.sharePrice)) {
                    $('#prices-input-group').append(PricesView.getView(asset.name, asset.sharePrice));
                }
            }
            if (data.licenseAgreement && data.licenseAgreement.agreedToLicense) {
                $('#acceptLicense').prop('checked', true);
                $('#acceptLicense').prop('disabled', true);
                $('.licenseAgreementDetails').append(`agreed to license on ${data.licenseAgreement.agreementDateUtc} from IP ${data.licenseAgreement.ipAddress}`);
            }
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function () {
        dataClient = new DataClient();
        new AccountSettingsController().init(PricesView);
        initAsync().catch(err => { Util.log(err); });
    };
}

module.exports = PricesController;