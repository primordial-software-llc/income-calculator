import Currency from 'currency.js';
const Moment = require('moment/moment');
const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
import MessageViewController from './message-view-controller';
const Instascan = require('instascan');
const Util = require('../util');

export default class PropertyPointOfSaleController {
    static getName() {
        return 'QR Test';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/qr-test.html`;
    }
    async init(user) {

        let cameras = await Instascan.Camera.getCameras();
        for (let camera of cameras) {
            $('#cameras').append(`<option>${camera.name}</option>`);
        }

        let scanner = new Instascan.Scanner({ video: document.getElementById('qr-scanner-preview') });
        scanner.addListener('scan', function (content) {
            $("#sale-vendor").val((content || '').trim());
            $("#sale-vendor").trigger('input');
            scanner.stop();
            $('#qr-scanner-preview').addClass('hide');
        });

        $('#start-scan').click(async function() {

            let cameras = await Instascan.Camera.getCameras();
            let selectedCamera = cameras.find(x => (x.name || '').toLowerCase() === $('#cameras').val().toLowerCase());

            alert('scanning with camera: ' + (selectedCamera || {}).name);

            if (selectedCamera) {
                scanner.start(selectedCamera);
            } else {
                console.error('No cameras found.');
            }

        });
    }
}