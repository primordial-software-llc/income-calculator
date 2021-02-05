import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
const Util = require('../util');
export default class BanksController {
    static getName() {
        return 'Banks';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/banks.html`;
    }
    async init(usernameResponse) {
        let dataClient = new DataClient();
        new AccountSettingsController().init({}, usernameResponse, true);
        $('#link-button').on('click', async function() {
            let linkTokenResponse;
            try {
                linkTokenResponse = await dataClient.post('create-link-token');
            } catch (error) {
                Util.log(error)
                return;
            }
            let handler = Plaid.create({
                token: linkTokenResponse.link_token,
                onSuccess: async function(public_token, metaData) {
                    try {
                        let result = await dataClient.post('link-access-token', { "public_token": public_token });
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
                onEvent: function(eventName, metadata) { }
            });
            handler.open();
        });
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
                    result = await dataClient.post('create-link-token', data);
                } catch (err) {
                    Util.log(err);
                    return;
                }
                let handler = Plaid.create({
                    token: result.link_token,
                    onSuccess: async function(public_token, metadata) {
                    },
                    onExit: function(err, metadata) {
                        // The user exited the Link flow.
                        if (err != null && err.error_code !== 'item-no-error') {
                            // The user encountered a Plaid API error prior to exiting.
                            Util.log(err);
                        }
                    },
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