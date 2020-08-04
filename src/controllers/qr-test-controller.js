import DataClient from '../data-client';
const Util = require('../util');
const QRCode = require('qrcode');

export default class PropertyPointOfSaleController {
    static getName() {
        return 'QR Test';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/qr-test.html`;
    }
    getCustomerDescription(customer) {
        let fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        if (fullName) {
            fullName = ' : ' + fullName;
        }
        return `${customer.displayName}${fullName}`;
    }
    getQrCodePromise(data) {
        return new Promise((resolve, reject) => {
            QRCode.toDataURL(data,
                { errorCorrectionLevel: 'H', mode: 'alphanumeric' },
                function (err, url) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(url);
                    }
                });
        });
    }
    async getCardView(vendor, cardType) {
        let cardData = {
            'id': vendor.id,
            'type': cardType
        }
        let url = await this.getQrCodePromise(JSON.stringify(cardData));
        return `
            <div class="card">
                <div class="vendor-description">Vendor - ${cardType}</div>
                <div class="vendor-description">${this.getCustomerDescription(vendor)}</div>
                <img src="${encodeURI(url)}" />
                <div class="text-center card-header">
                    Lakeland Mi Pueblo Flea Market
                    <br />
                    2701 Swindell Rd
                    <br />Lakeland, FL 33805
                  <br />(863) 682-4809
                </div>
            </div>`;
    }
    async init(user) {
        this.customers = await new DataClient().get('point-of-sale/customer-payment-settings');
        for (let vendor of this.customers) {
            let customer1 = await this.getCardView(vendor, 'Owner');
            let customer2 = await this.getCardView(vendor, 'Employee');
            let customer3 = await this.getCardView(vendor, 'Employee');
            $('body').append(`
                <div class="card-container row table-header-row">
                  <div class="col-xs-4">${customer1}</div>
                  <div class="col-xs-4">${customer2}</div>
                  <div class="col-xs-4">${customer3}</div>
                </div>
            `);
        }
    }
}