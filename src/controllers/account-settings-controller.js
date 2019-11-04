const DataClient = require('../data-client');
const Util = require('../util');
function AccountSettingsController() {
    'use strict';
    let bucket;
    let s3ObjKey;
    let accessKeyId;
    let secretAccessKey;
    let dataClient;
    let view;
    async function save() {
        let data = await view.getModel();
        try {
            let response = await dataClient.patch(s3ObjKey, data);
            window.location.reload();
        } catch (err) {
            Util.log(err);
        }
    }
    this.init = function (settings, viewIn) {
        view = viewIn;
        bucket = settings.s3Bucket;
        s3ObjKey = settings.s3ObjectKey;
        accessKeyId = settings.pub;
        secretAccessKey = settings.priv;
        dataClient = new DataClient(settings);
        $('#save').click(function () {
            $('#save').attr('disabled', 'disabled');
            if (Util.agreedToLicense()) {
                save();
            }
        });
        $('#account-settings-button').click(() => {
            $('#account-settings-view').modal({backdrop: 'static'});
        });
        $('#log-out-button').click(() => {
            document.cookie = 'idToken=;Secure;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
        });
        $('#view-raw-data-button').click(async () => {
            let data;
            try {
                data = await dataClient.getData();
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
                data = await dataClient.getData();
            } catch (err) {
                Util.log(err);
                return;
            }
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, 0, 4)));
            downloadLink.setAttribute('download', Util.getParameterByName('data'));
            if (document.createEvent) {
                let event = document.createEvent('MouseEvents');
                event.initEvent('click', true, true);
                downloadLink.dispatchEvent(event);
            }
            else {
                downloadLink.click();
            }
        });
        $('#account-settings-save-close-button').click(async function () {
            let newFileName = $('#budgetName').val().trim();
            try {
                let result = await dataClient.patch(newFileName, view.getModel())
            } catch (err) {
                Util.log(err);
                return;
            }
            let url = Util.updateQueryStringParameter(location.href, 'data', newFileName);
            url = Util.updateQueryStringParameter(url, 'pub', $('#awsAccessKeyId').val().trim());
            url = Util.updateQueryStringParameter(url, 'priv', $('#awsSecretAccessKey').val().trim());
            url = Util.updateQueryStringParameter(url, 'agreedToLicense', Util.agreedToLicense());
            window.location.href = url;
        });
        $('#awsBucket').val(bucket);
        $('#budgetName').val(s3ObjKey);
        $('#awsAccessKeyId').val(settings.pub);
        $('#awsSecretAccessKey').val(settings.priv);
        $('#acceptLicense').prop('checked', settings.agreedToLicense);
    };
}

module.exports = AccountSettingsController;