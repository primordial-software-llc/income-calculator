import Currency from 'currency.js';
const Moment = require('moment/moment');
import DataClient from '../data-client';
import AccountSettingsController from './account-settings-controller';
import MessageViewController from './message-view-controller';
const Util = require('../util');
export default class PropertyPointOfSaleController {
    static getName() {
        return 'Receipts';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-point-of-sale.html`;
    }
    initForm() {
        $('#sale-date').prop('disabled', false).val(Moment().format('YYYY-MM-DD'));
        $('#sale-vendor').prop('disabled', false).val('');
        $('#sale-prior-balance').prop('disabled', false).val('');
        $('#sale-rental-amount').prop('disabled', false).val('');
        $('#sale-payment').prop('disabled', false).val('');
        $('#sale-memo').prop('disabled', false).val('');
    }
    getCustomerDescription(customer) {
        let description = customer.displayName;
        let fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        if (fullName && fullName.toLowerCase() !== customer.displayName.toLowerCase()) {
            description += ' : ' + fullName;
        }
        return description;
    }
    getCustomer(customerDescription) {
        return this.customers.find(x =>
            this.getCustomerDescription(x).toLowerCase().replace(/\s+/g, " ") ===
                customerDescription.toLowerCase().replace(/\s+/g, " ")); // Data list and input automatically replace multiple whitespaces with a single white space
    }
    loadCustomer(customer) {
        if (customer) {
            $('#sale-prior-balance').val(customer.balance);
            $('#sale-payment-frequency').text(customer.paymentFrequency);
            $('#vendor-notes').text(customer.memo);
            let start = Moment().subtract('90', 'days').format('YYYY-MM-DD');
            let end = Moment().add('30', 'days').format('YYYY-MM-DD');
            $('#invoices').append(`<div>Loading invoices...</div>`);
            new DataClient(true)
                .get(`point-of-sale/customer-invoices?id=${customer.id}&start=${start}&end=${end}`)
                .then((invoices) => {
                    $('#invoices').empty();
                    for (let invoice of invoices) {
                        let balance = invoice.Balance === '0' || invoice.Balance === 0 ? 'PAID' : Util.format(invoice.Balance);
                        $('#invoices').append(`<div>&bull;&nbsp;${invoice.TxnDate} - ${balance}</div>`);
                    }
                })
                .catch((error) => {
                    alert(JSON.stringify(error) + " " + error);
                    Util.log(error);
                });
        } else {
            $('#sale-prior-balance').val('');
            $('#sale-payment-frequency').text('');
            $('#vendor-notes').text('');
            $('#invoices').empty();
        }
    }
    async init(user) {
        let self = this;
        this.initForm();
        new AccountSettingsController().init({}, user, false);
        this.customers = await new DataClient().get('point-of-sale/customer-payment-settings');
        for (let customer of this.customers) {
            $('#sale-vendor-list').append(`<option>${this.getCustomerDescription(customer)}</option>`);
        }
        $("#sale-vendor").on('input', function () {
            $("#sale-vendor").removeClass('owner-alert');
            self.loadCustomer(self.getCustomer(this.value));
        });
        $('#scan-vendor').click(async function() {
            $("#sale-vendor").removeClass('owner-alert');
            if ($('#cameras').hasClass('hide')) {
                $('#cameras').removeClass('hide');
                let cameras = await Html5Qrcode.getCameras();
                for (let camera of cameras) {
                    $('#cameras').append(`<option value="${camera.id}">${camera.label}</option>`);
                }
            }
            window.location.hash = '#reader';
            let html5Qrcode = new Html5Qrcode("reader");
            html5Qrcode.start($('#cameras').val(), { fps: 10, qrbox: 250 },
                async qrCodeMessage => {
                    let parsedJson;
                    try {
                        parsedJson = JSON.parse(qrCodeMessage);
                    } catch (error) {
                        Util.log(error);
                    }
                    if (!parsedJson) {
                        return;
                    }
                    let vendor = self.customers.find(x => x.id === parsedJson.id);
                    if (!vendor) {
                        return; // could be a misread since the id isn't found so ignore.
                    }
                    $("#sale-vendor").val(self.getCustomerDescription(vendor));
                    self.loadCustomer(vendor);
                    if ((parsedJson.type || '').toLowerCase() === 'owner') {
                        $("#sale-vendor").addClass('owner-alert');
                    }
                    html5Qrcode.stop();
                },
                errorMessage => { /* console.log(errorMessage);*/ }
            ).catch(error => {
                console.log(error);
            });
        });
        $('#sale-save').click(async function() {
            MessageViewController.setMessage('');
            let vendor = $("#sale-vendor").val().trim();
            let customerMatch = self.getCustomer(vendor);
            let receipt = {
                rentalDate: $('#sale-date').val().trim(),
                transactionDate: Moment().format('YYYY-MM-DD'),
                customer: {
                    id: customerMatch ? customerMatch.quickBooksOnlineId : '',
                    name: vendor
                },
                amountOfAccount: $('#sale-prior-balance').val().trim(),
                rentalAmount: $('#sale-rental-amount').val().trim(),
                thisPayment: $('#sale-payment').val().trim(),
                memo: $('#sale-memo').val().trim()
            };
            try {
                let receiptResult = await new DataClient().post('point-of-sale/receipt', receipt);
                if (receiptResult.error) {
                    MessageViewController.setMessage(receiptResult.error, 'alert-danger');
                    return;
                }
                if (!receiptResult.id) {
                    Util.log(receiptResult);
                    MessageViewController.setMessage(JSON.stringify(receiptResult), 'alert-danger');
                    return;
                }
                $('#sale-id').text(receiptResult.id);
                let receiptNumber = '';
                if (receiptResult.invoice) {
                    receiptNumber += `I${receiptResult.invoice.Id}`;
                }
                if (receiptResult.paymentAppliedToInvoice) {
                    receiptNumber += `AP${receiptResult.paymentAppliedToInvoice.Id}`;
                }
                if (receiptResult.unappliedPayment) {
                    receiptNumber += `UP${receiptResult.unappliedPayment.Id}`;
                }
                $('#receipt-number').text(receiptNumber);
                let saleBy = (`${user.firstName} ${user.lastName}`.trim() || user.email);
                $('#sale-by').text(saleBy);
                let timestamp = Moment(receiptResult.timestamp);
                $('#sale-timestamp').text(timestamp.format('L LT'));
                $('#sale-date-text').text(receipt.rentalDate);
                $('#sale-vendor-text').text(receipt.customer.name);
                let amountOfAccount = Currency(receipt.amountOfAccount, Util.getCurrencyDefaults());
                $('.prior-balance-receipt-group').toggle(!!receipt.amountOfAccount);
                let rentalAmount = Currency(receipt.rentalAmount, Util.getCurrencyDefaults());
                let payment = Currency(receipt.thisPayment, Util.getCurrencyDefaults());
                $('#sale-prior-balance-text').text(Util.format(amountOfAccount.toString()));
                $('#sale-rental-amount-text').text(Util.format(rentalAmount.toString()));
                $('#sale-payment-text').text(Util.format(payment.toString()));
                let balanceDue = amountOfAccount.add(rentalAmount);
                balanceDue = balanceDue.subtract(payment);
                $('#sale-new-balance-text').text(Util.format(balanceDue.toString()));
                $('.memo-receipt-group').toggle(!!receipt.memo);
                $('#sale-memo-text').text(receipt.memo);
                $('#sale-date').prop('disabled', true);
                $('#sale-vendor').prop('disabled', true);
                $('#sale-prior-balance').prop('disabled', true);
                $('#sale-rental-amount').prop('disabled', true);
                $('#sale-payment').prop('disabled', true);
                $('#sale-memo').prop('disabled', true);
                $('#sale-save').prop('disabled', true);
                window.print();
            } catch (error) {
                Util.log(error);
                MessageViewController.setMessage(JSON.stringify(error), 'alert-danger');
            }
        });
        $('#sale-print').click(function () {
            window.print();
        });
        $('#sale-new').click(function() {
            // self.initForm(); // should refresh fields only, but I need an accurate balance returned from post receipt.
            window.location.reload();
        });
    }
}