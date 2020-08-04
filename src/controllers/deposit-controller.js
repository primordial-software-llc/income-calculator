import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
const Util = require('../util');
async function deposit(amount) {
    let dataClient = new DataClient();
    let data = await dataClient.getBudget();
    data.assets = data.assets || [];
    let cashAsset = data.assets.find(x => (x.name || '').toLowerCase() === "cash");
    if (!cashAsset) {
        cashAsset = {
            name: 'Cash',
            id: Util.guid(),
            type: 'cash'
        };
        data.assets.push(cashAsset);
    }
    cashAsset.amount = Util.add(cashAsset.amount, amount);
    await new DataClient().patch('budget', { assets: data.assets });
    $('#transfer-amount').val('');
    $('#message-container').html(`<div class="alert alert-success" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <p class="mb-0">Deposit successful. New cash Balance: ${Util.format(Util.getAmount(cashAsset))}</p>
            </div>`);
}
export default class DepositController {
    static getName() {
        return 'Deposit';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/deposit.html`;
    }
    async init(usernameResponse) {
        new AccountSettingsController().init({}, usernameResponse, true);
        if (Util.obfuscate()) {
            $('#submit-transfer').prop('disabled', true);
        }
        $('#submit-transfer').click(function() {
            $('#submit-transfer').prop('disabled', true);
            deposit($('#transfer-amount').val().trim());
        });
    };
}
