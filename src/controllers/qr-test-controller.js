import Currency from 'currency.js';
const Moment = require('moment/moment');
const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
import MessageViewController from './message-view-controller';
const Util = require('../util');

export default class PropertyPointOfSaleController {
    static getName() {
        return 'QR Test';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/qr-test.html`;
    }
    async init(user) {
        let cameras = await Html5Qrcode.getCameras();
        for (let camera of cameras) {
            $('#cameras').append(`<option value="${camera.id}">${camera.label}</option>`);
        }
        $('#start-scan').click(async function() {
            let html5Qrcode = new Html5Qrcode("reader");
            html5Qrcode.start(
                $('#cameras').val(),
                { fps: 10, qrbox: 3000 },
                async qrCodeMessage => {
                    let myRegEx  = /[^a-z\d: ]/i;
                    let isValid = !(myRegEx.test(qrCodeMessage));
                    if (isValid) {
                        console.log('is valid');
                        console.log(qrCodeMessage);
                        html5Qrcode.stop();
                    }
                },
                errorMessage => { /* console.log(errorMessage);*/ }
            ).catch(error => {
                console.log(error);
            });
        });
    }
}