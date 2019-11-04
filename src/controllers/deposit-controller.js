const DataClient = require('../data-client');
const Util = require('../util');
function DepositController() {
    'use strict';
    let dataClient;
    let settings;
    async function deposit(amount) {
        let dataClient = new DataClient(settings);
        let data = await dataClient.getData();
        let cashAsset = data.assets.find(x => x.name.toLowerCase() === "cash");
        if (!cashAsset) {
            cashAsset = {name: 'Cash', sharePrice: '1', 'shares': '0'};
        }
        cashAsset.shares = Util.add(cashAsset.shares, amount);
        await dataClient.patch(settings.s3ObjectKey, { assets: data.assets });
        $('#submit-transfer').prop('disabled', false);
        $('#transfer-amount').val('');
        $('#message-container').html(`<div class="alert alert-success" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <p class="mb-0">Deposit successful. New cash Balance: ${cashAsset.shares}</p>
            </div>`);
    }
    async function initAsync() {
        $('#submit-transfer').click(function() {
            $('#submit-transfer').prop('disabled', true);
            deposit($('#transfer-amount').val().trim());
        });
    }
    this.init = function (settingsIn) {
        settings = settingsIn;
        dataClient = new DataClient(settings);
        initAsync()
            .catch(err => { Util.log(err); });
    };
}

module.exports = DepositController;