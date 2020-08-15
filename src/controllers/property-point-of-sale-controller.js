import AddSpotView from '../views/add-spot-view';
import Currency from 'currency.js';
import CustomerDescription from '../customer-description';
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
    addSpot(additionalSpot) {
        let id = Util.guid();
        $('#spot-container').append(AddSpotView.GetAddSpotView(id, additionalSpot));
        return id;
    }
    initForm() {
        $('#sale-date').prop('disabled', false).val(Moment().format('YYYY-MM-DD'));
        $('#sale-vendor').prop('disabled', false).val('');
        $('#sale-prior-balance').prop('disabled', false).val('');
        $('#sale-rental-amount').prop('disabled', false).val('');
        $('#sale-payment').prop('disabled', false).val('');
        $('#sale-memo').prop('disabled', false).val('');
    }
    getSpotDescription(spot) {
        return `${spot.section.name} - ${spot.name}`;
    }
    getSpot(spotDescription) {
        return this.spots.find(x => this.getSpotDescription(x).toLowerCase() === spotDescription.toLowerCase());
    }
    getCustomer(customerDescription) {
        return this.customers.find(x =>
            CustomerDescription.getCustomerDescription(x).toLowerCase().replace(/\s+/g, " ") ===
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

            for (let spot of customer.spots || []) {
                $('#spot-container').prepend(
                    AddSpotView.GetAddSpotView(Util.guid(), false, true, this.getSpotDescription(spot)));
            }
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
        this.addSpot();
        new AccountSettingsController().init({}, user, false);
        let dataClient = new DataClient();
        let customerPromise = dataClient.get('point-of-sale/customer-payment-settings');
        let rentalSectionPromise = dataClient.get('point-of-sale/spots?cache-level=cache-everything');
        let promiseResults = await Promise.all([customerPromise, rentalSectionPromise]);
        this.customers = promiseResults[0];
        this.spots = promiseResults[1];
        for (let spot of this.spots) {
            $('#spot-list').append(`<option>${self.getSpotDescription(spot)}</option>`);
        }
        for (let customer of this.customers) {
            $('#sale-vendor-list').append(`<option>${CustomerDescription.getCustomerDescription(customer)}</option>`);
        }
        $('#add-new-spot').click(function() {
            let id = self.addSpot(true);
            $(`#${id} .remove-spot-btn`).click(function() {
                $(`#${id}`).remove();
            });
        });
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
                    $("#sale-vendor").val(CustomerDescription.getCustomerDescription(vendor));
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
            let validationMessages = [];
            let vendor = $("#sale-vendor").val().trim();
            let customerMatch = self.getCustomer(vendor);
            let spots = [];
            for (let spotTextInput of $('.spot-input').toArray()) {
                $(spotTextInput).removeClass('required-field-validation');
                let spotDescription = $(spotTextInput).val().trim();
                if (spotDescription.length === 0) {
                    continue;
                }
                let spot = self.getSpot(spotDescription);
                if (!spot) {
                    $(spotTextInput).addClass('required-field-validation');
                    validationMessages.push(`${spotDescription} is not a valid spot`);
                } else {
                    spots.push(spot);
                }
            }
            if (validationMessages.length > 0) {
                MessageViewController.setMessage(validationMessages, 'alert-danger');
                return;
            }
            let receipt = {
                rentalDate: $('#sale-date').val().trim(),
                customer: {
                    id: customerMatch ? customerMatch.quickBooksOnlineId : '',
                    name: vendor
                },
                amountOfAccount: $('#sale-prior-balance').val().trim(),
                rentalAmount: $('#sale-rental-amount').val().trim(),
                thisPayment: $('#sale-payment').val().trim(),
                memo: $('#sale-memo').val().trim(),
                spots: spots
            };
            let receiptResult;
            try {
                receiptResult = await new DataClient().post('point-of-sale/receipt', receipt);
            } catch (error) {
                Util.log(error)
                MessageViewController.setRequestErrorMessage(error);
                return;
            }
            $('#sale-id').text(receiptResult.id);
            let receiptNumber = receiptResult.invoice ? `I${receiptResult.invoice.Id}` : '';
            for (let payment of receiptResult.payments || []) {
                receiptNumber += `P${payment.Id}`;
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
            let allSpots = spots;
            if (customerMatch && customerMatch.spots) {
                allSpots = customerMatch.spots.concat(allSpots);
            }
            $('.spots-receipt-group').toggle(allSpots.length > 0);
            $('#sale-spots-text').text(allSpots.map(x => self.getSpotDescription(x)).join(", "));
            $('.memo-receipt-group').toggle(!!receipt.memo);
            $('#sale-memo-text').text(receipt.memo);
            $('.disable-on-save').prop('disabled', true);
            $('.spot-input').prop('disabled', true);
            $('.remove-spot-btn').prop('disabled', true);
            window.print();
        });
        $('#sale-print').click(function () {
            window.print();
        });
        $('#sale-new').click(function() {
            window.location.reload();
        });
    }
}