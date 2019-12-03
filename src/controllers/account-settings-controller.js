const DataClient = require('../data-client');
const Util = require('../util');
function AccountSettingsController() {
    'use strict';
    let dataClient;
    let view;
    async function save() {
        let data = await view.getModel();
        /*
         * This has to get done on account creation.
        data.licenseAgreement = {
            agreedToLicense: agreedToLicense
        };*/
        try {
            let response = await dataClient.patch(data);
            window.location.reload();
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function (viewIn) {
        view = viewIn;
        dataClient = new DataClient();
        $('#save').click(save);
        $('#obfuscate-data').click(() => {
            if (Util.obfuscate()) {
                document.cookie = 'obfuscate=;Secure;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
            } else {
                document.cookie = `obfuscate=true;Secure;path=/`;
            }
            window.location.reload();
        });
        $('#account-settings-button').click(() => {
            $('#account-settings-view-cognito-user').val(Util.getUsername());
            $('#account-settings-view').modal({backdrop: 'static'});
        });
        $('#log-out-button').click(async () => {
            try {
                await dataClient.post('signout', {});
                window.location=`${Util.rootUrl()}/pages/login.html`;
            } catch (error) {
                Util.log(error);
            }
        });
        $('#view-raw-data-button').click(async () => {
            let data;
            try {
                data = await dataClient.getBudget();
            } catch (error) {
                Util.log(error);
                return;
            }
            $('#raw-data-view .modal-body').empty();
            $('#raw-data-view .modal-body').append(`<pre>${JSON.stringify(data, 0, 4)}</pre>`);
            $('#raw-data-view').modal({backdrop: 'static' });
        });
        $('#budget-download').click(async function () {
            let data;
            try {
                data = await dataClient.getBudget();
            } catch (err) {
                Util.log(err);
                return;
            }
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, 0, 4)));
            downloadLink.setAttribute('download', 'data.json');
            if (document.createEvent) {
                let event = document.createEvent('MouseEvents');
                event.initEvent('click', true, true);
                downloadLink.dispatchEvent(event);
            }
            else {
                downloadLink.click();
            }
        });
    };
}

module.exports = AccountSettingsController;