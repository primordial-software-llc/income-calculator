const AccountSettingsController = require('./account-settings-controller');
const Currency = require('currency.js');
const DataClient = require('../data-client');
const Util = require('../util');
function PricesController() {
    'use strict';
    let dataClient;
    let self = this;
    async function initAsync() {
        try {
            let data = await dataClient.sendRequest('budget');
            if (data.assets) {
                $('#prices-input-group').empty();
                $('#prices-input-group').append(self.getHeaderView());
                for (let asset of data.assets) {
                    $('#prices-input-group').append(self.getView(asset.name, asset.sharePrice));
                }
            }
        } catch (err) {
            Util.log(err);
        }
    }
    this.getHeaderView = function () {
        return $(`<div class="row table-header-row">
              <div class="col-xs-6">Asset</div>
              <div class="col-xs-6">Price</div>
          </div>`);
    };
    this.getView = function (name, sharePrice) {
        'use strict';
        let view = $(`<div class="prices-item row transaction-input-view">
                    <div class="col-xs-6"><input class="input-name name form-control" type="text" value="${name || ''}" /></div>
                    <div class="col-xs-6">
                        <div class="input-group">
                            <div class="input-group-addon ">$</div>
                            <input class="share-price form-control text-right" type="text" value="${sharePrice || ''}"
								placeholder="0.00" />
                        </div>
                    </div>
                  </div>
        `);
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        return viewContainer;
    };
    this.getPrices = function () {
        let prices = [];
        $('.prices-item').each(function () {
            prices.push({
                "name": $(this).find('input.input-name').val().trim(),
                "sharePrice": $(this).find('input.share-price').val().trim(),
            });
        });
        return prices;
    };
    async function save() {
        let prices = self.getPrices();
        let data = await dataClient.sendRequest('budget');
        for (let price of prices) {
            let existing = data.assets.find(x => x.name.toLowerCase() === price.name.toLowerCase());
            existing.sharePrice = price.sharePrice;
        }
        try {
            let response = await dataClient.patch({assets: data.assets});
            window.location.reload();
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function () {
        dataClient = new DataClient();
        $('#acceptLicense').prop('checked', Util.hasAgreedToLicense());
        $('#save').click(function () {
            $('#save').attr('disabled', 'disabled');
            if ($('#acceptLicense').is(':checked')) {
                save();
            }
        });
        initAsync().catch(err => { Util.log(err); });
    };
}

module.exports = PricesController;