const DataClient = require('../data-client');
const Util = require('../util');
function AccountSettingsController() {
    'use strict';
    let dataClient;
    let view;
    async function save(agreedToLicense) {
        let data = await view.getModel();
        data.licenseAgreement = {
            agreedToLicense: agreedToLicense
        };
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
        $('#save').click(function () {
            if ($('#acceptLicense').is(':checked')) {
                $('#save').attr('disabled', 'disabled');
                save(true);
            } else {
                alert('You must agree to the license to proceed');
            }
        });
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
        $('#log-out-button').click(() => {
            document.cookie = 'idToken=;Secure;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
            document.cookie = 'refreshToken=;Secure;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
            window.location=`${Util.rootUrl()}/pages/login.html`;
        });
        $('#view-raw-data-button').click(async () => {
            let data;
            try {
                data = await dataClient.getBudget();
            } catch (err) {
                Util.log(err);
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