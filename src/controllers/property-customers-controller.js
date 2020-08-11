import AccountSettingsController from './account-settings-controller';
import AddSpotView from '../views/add-spot-view';
import CustomerDescription from '../customer-description';
import CustomerSort from '../customer-sort';
import DataClient from '../data-client';
const Moment = require('moment');
import MessageViewController from './message-view-controller';
const Util = require('../util');
export default class PropertyCustomersController {
    static getName() {
        return 'Vendors';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-customers.html`;
    }
    static hideInNav() {
        return true;
    }
    getView(customerPaymentSetting) {
        let paymentFrequency = customerPaymentSetting.paymentFrequency || '&nbsp;';
        let amount = customerPaymentSetting.rentPrice
            ? Util.format(customerPaymentSetting.rentPrice) : '&nbsp;';
        let memo = customerPaymentSetting.memo || '&nbsp;';
        return `
            <div class="row dotted-underline-row customer-row">
                <div class="col-xs-5 vertical-align customer-balance-column">
                    <div class="black-dotted-underline">
                        <a class="customer-link" href="./property-customer-edit.html?id=${customerPaymentSetting.id}">${CustomerDescription.getCustomerDescription(customerPaymentSetting)}</a>
                    </div>
                </div>
                <div class="col-xs-2 vertical-align">
                    <div class="black-dotted-underline p-left-15">${paymentFrequency}</div>
                </div>
                <div class="col-xs-2 text-right vertical-align">
                    <div class="black-dotted-underline p-left-15">${amount}</div>
                </div>
                <div class="col-xs-3 vertical-align">
                    <div class="black-dotted-underline p-left-15">${memo}</div>
                </div>
            </div>`;
    }
    async createInvoices(frequency, date) {
        MessageViewController.setMessage('');
        let dataClient = new DataClient();
        let invoiceParams = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            dayOfMonth: date.getDate()
        };
        let dateRange = await dataClient.get(`point-of-sale/recurring-invoice-date-range` +
            `?year=${invoiceParams.year}&month=${invoiceParams.month}&dayOfMonth=${invoiceParams.dayOfMonth}&frequency=${frequency}`);
        let start = Moment.utc(dateRange.start);
        let end = Moment.utc(dateRange.end);
        let message = `Are you sure you would like to create ${frequency} invoices for ${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`;
        if (!confirm(message)) {
            return;
        }
        try {
            let invoices = await dataClient.post(`point-of-sale/create-${frequency}-invoices`, invoiceParams);
            let messages = [`Created ${invoices.length} ${frequency} invoice${invoices.length === 1 ? '' : 's'} for ${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`];
            for (let invoice of invoices) {
                messages.push(`${invoice.CustomerRef.name} - ${Util.format(invoice.TotalAmt)}`);
            }
            MessageViewController.setMessage(messages, 'alert-success');
        } catch (error) {
            Util.log(error);
            MessageViewController.setMessage('An error occurred when creating invoices. Invoices may still be getting created. Wait 10 minutes before attempting to create invoices again. ' + JSON.stringify(error), 'alert-danger');
        }
    }
    async init(user) {
        let self = this;
        new AccountSettingsController().init({}, user, false);
        this.customerPaymentSettings = await new DataClient().get('point-of-sale/customer-payment-settings');
        this.customerPaymentSettings.sort(CustomerSort.sort);
        for (let customer of this.customerPaymentSettings) {
            $('.customers-container').append(this.getView(customer));
        }
        $('#create-weekly-invoices').click(async function() {
            await self.createInvoices('weekly', new Date());
        })
        $('#create-monthly-invoices').click(async function() {
            let today = new Date();
            let date = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            await self.createInvoices('monthly', date);
        });
    }
}