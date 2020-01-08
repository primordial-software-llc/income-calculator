const AccountSettingsController = require('./account-settings-controller');
const DataClient = require('../data-client');
const Util = require('../util');
export default class BanksController {
    static getName() {
        return 'Banks';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/banks.html`;
    }
    async init() {
        new AccountSettingsController().init({});
        let environment = window.location.hostname.toLowerCase() === 'www.primordial-software.com'
            ? 'production'
            : 'development';
        $('#link-button').on('click', function(e) {
            let selectedProducts = ['transactions'];
            let handler = Plaid.create({
                clientName: 'My App',
                env: environment,
                key: '7e6391ab6cbcc3b212440b5821bfa7',
                product: selectedProducts,
                onSuccess: async function(public_token, metadata) {
                    let dataClient = new DataClient();
                    try {
                        let result = await dataClient.post('link-access-token', { publicToken: public_token });
                        window.location.reload();
                    } catch (err) {
                        Util.log(err);
                    }
                },
                onExit: function(err, metadata) {
                    // The user exited the Link flow.
                    if (err != null) {
                        // The user encountered a Plaid API error prior to exiting.
                        console.log(err);
                        window.alert(err);
                    }
                    // metadata contains information about the institution
                    // that the user selected and the most recent API request IDs.
                    // Storing this information can be helpful for support.
                },
                onEvent: function(eventName, metadata) {
                    // Optionally capture Link flow events, streamed through
                    // this callback as your users connect an Item to Plaid.
                    // For example:
                    // eventName = "TRANSITION_VIEW"
                    // metadata  = {
                    //   link_session_id: "123-abc",
                    //   mfa_type:        "questions",
                    //   timestamp:       "2017-09-14T14:42:19.350Z",
                    //   view_name:       "MFA",
                    // }
                }
            });
            handler.open();
        });
        let dataClient = new DataClient();
        let bankLinks = await dataClient.get('bank-link');
        for (let bankLink of bankLinks) {
            let bankLinkView = $('<div class="bank-link-item-container"></div>');
            bankLinkView.append(`<span title="${bankLink['institution']['name']} - ${bankLink['item_id']}">${bankLink['institution']['name']}</span>`);
            let bankLinkUpdateButton = $(`
                <button class="btn btn-info" title="Re-Authenticate Bank Link" type="button">
                    <span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>
                </button>
            `);
            bankLinkUpdateButton.on('click', async function(e) {
                let data = { itemId: bankLink['item_id'] };
                let result;
                try {
                    result = await dataClient.post('create-public-token', data);
                } catch (err) {
                    Util.log(err);
                    return;
                }
                let handler = Plaid.create({
                    clientName: 'My App',
                    env: environment,
                    key: '7e6391ab6cbcc3b212440b5821bfa7',
                    product: ['transactions'],
                    token: result['public_token'],
                    onSuccess: async function(public_token, metadata) {
                        window.alert('updated account access token');
                    }
                });
                handler.open();
            });
            bankLinkView.append(bankLinkUpdateButton);
            let bankLinkRemoveButton = $(`
                <button class="btn btn-danger" title="Remove Bank Link" type="button">
                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>`);
            bankLinkRemoveButton.click(async function () {
                try {
                    await dataClient.delete('bank-link', { itemId: bankLink['item_id']});
                    window.alert(`Bank link deleted: ${bankLink['institution']['name']} - ${bankLink['item_id']}`);
                    window.location.reload();
                } catch (err) {
                    Util.log(err);
                }
            });
            bankLinkView.append(bankLinkRemoveButton);
            $('#existing-link-container').append(bankLinkView);
        }
    };
}