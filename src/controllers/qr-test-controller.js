import CustomerDescription from '../customer-description';
import DataClient from '../data-client';
const Util = require('../util');
const QRCode = require('qrcode');

export default class QrTestController {
    static getName() {
        return 'QR Test';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/qr-test.html`;
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
                <div class="vendor-description">${CustomerDescription.getCustomerDescription(vendor)}</div>
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
    getCustomer(customerDescription) {
        return this.customers.find(x =>
            CustomerDescription.getCustomerDescription(x).toLowerCase().replace(/\s+/g, " ") ===
            customerDescription.toLowerCase().replace(/\s+/g, " ")); // Data list and input automatically replace multiple whitespaces with a single white space
    }
    async init(user) {
        let self = this;
        this.customers = await new DataClient().get('point-of-sale/customer-payment-settings');
        for (let customer of this.customers) {
            $('#sale-vendor-list').append(`<option>${CustomerDescription.getCustomerDescription(customer)}</option>`);
        }
        $("#vendor").on('input', async function () {
            let customer = self.getCustomer(this.value);
            if (!customer) {
                return;
            }
            let ownerView = await self.getCardView(customer, 'Owner');
            let employeeView = await self.getCardView(customer, 'Employee');
            $('.card-container').remove();
            $('body').append(`
                <div class="card-container row text-center">
                  <div class="col-xs-4">${ownerView}</div>
                  <div class="col-xs-4">${employeeView}</div>
                  <div class="col-xs-4">${employeeView}</div>
                </div>
                <div class="card-container row text-center">
                  <div class="col-xs-4">${employeeView}</div>
                  <div class="col-xs-4">${employeeView}</div>
                  <div class="col-xs-4">${employeeView}</div>
                </div>
                <div class="card-container row text-center">
                  <div class="col-xs-4">${employeeView}</div>
                  <div class="col-xs-4">${employeeView}</div>
                  <div class="col-xs-4">${employeeView}</div>
                </div>
            `);
        });
    }
}