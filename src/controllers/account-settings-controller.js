const DataClient = require('../data-client');
const Util = require('../util');
function AccountSettingsController() {
    'use strict';
    let dataClient;
    let view;
    async function save() {
        let data = await view.getModel();
        try {
            let response = await dataClient.patch('S3OBJKEY WILL PROBABLY GO AWAY, YOU GET ONE BUDGET - UNLESS IF YOU PAY WHICH NOBODY IS YET', data);
            window.location.reload();
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function (viewIn) {
        view = viewIn;
        dataClient = new DataClient();
        $('#save').click(function () {
            $('#save').attr('disabled', 'disabled');
            if ($('#acceptLicense').is(':checked')) {
                save();
            }
        });
        $('#account-settings-button').click(() => {
            $('#account-settings-view').modal({backdrop: 'static'});
        });
        $('#log-out-button').click(() => {
            document.cookie = 'idToken=;Secure;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
            window.location=`${Util.rootUrl()}/pages/login.html${window.location.search}`;
        });
        $('#view-raw-data-button').click(async () => {
            let data;
            try {
                data = await dataClient.sendRequest('budget');
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
                data = await dataClient.sendRequest('budget');
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
        $('#acceptLicense').prop('checked', Util.hasAgreedToLicense());
    };
}

module.exports = AccountSettingsController;