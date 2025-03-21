import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
const PricesView = require('../views/prices-view');
const Util = require('../util');
export default class PricesController {
    static getName() {
        return 'Prices';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/prices.html`;
    }
    async init(usernameResponse) {
        new AccountSettingsController().init(PricesView, usernameResponse, true);
        let dataClient = new DataClient();
        let data = await dataClient.getBudget();
        if (data.assets) {
            $('#prices-input-group').empty();
            $('#prices-input-group').append(PricesView.getHeaderView());
            for (let asset of data.assets.filter(x => x.sharePrice)) {
                $('#prices-input-group').append(PricesView.getView(asset.name, asset.sharePrice));
            }
        }
    };
}