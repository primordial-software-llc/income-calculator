import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
import Navigation from '../nav';
const Util = require('../util');
const Moment = require('moment/moment');
const Currency = require('currency.js');
export default class PropertyReportsController {
    static getName() {
        return 'Reports';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-reports.html`;
    }
    static hideInNav() {
        return true;
    }
    static showInPropertyNav() {
        return true;
    }
    getRowView(income) {
        return `<div class="row dotted-underline-row report-row">
            <div class="col-xs-5 vertical-align">
                <div class="black-dotted-underline">
                    ${income.customer}
                </div>
            </div>
            <div class="col-xs-2 vertical-align">
                <div class="black-dotted-underline">
                    ${Moment(income.date).format('YYYY-MM-DD h:mm:ssa')}
                </div>
            </div>
            <div class="col-xs-1 vertical-align text-right ${!income.accountingPayment ? 'font-strike-through' : ''}">
                <div class="black-dotted-underline amount-cell">
                    ${Util.format(income.amount)}
                </div>
            </div>
            <div class="col-xs-1 vertical-align text-right">
                <div class="black-dotted-underline amount-cell ${(!income.pointOfSalePayment) ? 'text-danger font-weight-bold' : ''}">
                    ${(!!income.pointOfSalePayment).toString()}
                </div>
            </div>
            <div class="col-xs-2 vertical-align text-right">
                <div class="black-dotted-underline amount-cell ${(!income.accountingPayment) ? 'text-danger font-weight-bold' : ''}">
                    ${(!!income.accountingPayment).toString()}
                </div>
            </div>
            <div class="col-xs-1 vertical-align text-right">
                <div class="black-dotted-underline amount-cell ${(income.merchantAccountPaymentStatus || '').toLowerCase() === 'failed' ? 'text-danger font-weight-bold' : ''}">
                    ${income.merchantAccountPaymentStatus}
                </div>
            </div>
        </div>`;
    }
    async init(user) {
        let self = this;
        $('.property-navigation').append(Navigation.getPropertyNav(user, PropertyReportsController.getUrl()));
        new AccountSettingsController().init({}, user, false);
        let dataClient = new DataClient();
        $('#run-cash-basis-income-report').click(async function() {
            MessageViewController.clearMessage();
            $('#income-container').empty();
            try {
                const startDate = Moment($('#start-date').val(), 'YYYY-MM-DD');
                const endDate = Moment($('#end-date').val() + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss');
                let reportRequests = await Promise.all([
                    dataClient.get(`point-of-sale/cash-basis-income?start=${$('#start-date').val()}&end=${$('#end-date').val()}`),
                    dataClient.get(`point-of-sale/card-charges?` +
                        `start=${startDate.utc().format('YYYY-MM-DD HH:mm:ss')}`+
                        `&end=${endDate.utc().format('YYYY-MM-DD HH:mm:ss')}`),
                    dataClient.get(`point-of-sale/cash-basis-income-from-receipts?` +
                        `start=${startDate.toISOString()}` +
                        `&end=${endDate.toISOString()}`)
                ]);
                let accountingPayments = reportRequests[0];
                let accountingPaymentsNotFoundInReceipts = JSON.parse(JSON.stringify(accountingPayments));
                let cardCharges = reportRequests[1];
                let receipts = reportRequests[2];
                let cardTotal = Currency(0, Util.getCurrencyDefaults());
                for (let cardCharge of cardCharges.filter(x => (x.status || '').toLowerCase() === 'succeeded')) {
                    let amount = Currency(cardCharge.amount, Util.getCurrencyDefaults())
                        .divide(100);
                    cardTotal = cardTotal.add(amount)
                }
                let total = Currency(0, Util.getCurrencyDefaults());
                for (let receipt of receipts) {
                    if (!receipt.payments || receipt.payments.length <= 0) {
                        continue;
                    }
                    for (let payment of receipt.payments) {
                        let accountingPayment = accountingPayments.find(x => x.accountingId.toString() === payment.Id.toString());
                        if (accountingPayment) {
                            total = total.add(payment.TotalAmt.toString());
                        }
                        accountingPaymentsNotFoundInReceipts = accountingPaymentsNotFoundInReceipts.filter(x => x.accountingId.toString() !== payment.Id.toString());
                        let merchantAccountPaymentStatus = 'N/A';
                        if (receipt.receipt.makeCardPayment) {
                            let merchantPayment = cardCharges.find(x => x.id === receipt.cardCaptureResult.id);
                            if (merchantPayment && merchantPayment.captured && merchantPayment.paid && merchantPayment.status === 'succeeded') {
                                merchantAccountPaymentStatus = 'success'
                            } else {
                                merchantAccountPaymentStatus = 'failed';
                            }
                        }
                        $('#income-container').append(self.getRowView({
                            customer: payment.CustomerRef.name,
                            date: receipt.timestamp,
                            amount: payment.TotalAmt,
                            pointOfSalePayment: receipt,
                            accountingPayment: accountingPayment,
                            merchantAccountPaymentStatus: merchantAccountPaymentStatus
                        }));
                    }
                }
                for (let accountingPayment of accountingPaymentsNotFoundInReceipts) {
                    total = total.add(accountingPayment.amount);
                    $('#income-container').append(self.getRowView({
                        customer: accountingPayment.customer,
                        date: accountingPayment.date,
                        amount: accountingPayment.amount,
                        accountingPayment: accountingPayment,
                        merchantAccountPaymentStatus: 'N/A'
                    }));
                }
                let cashTotal = Currency(total, Util.getCurrencyDefaults()).subtract(cardTotal.toString());
                $('#income-container').append(`
                    <div class="row dotted-underline-row report-row">
                        <div class="col-xs-9 vertical-align">
                            <div class="black-solid-underline"><strong>Card Total</strong></div>
                        </div>
                        <div class="col-xs-3 vertical-align text-right">
                            <div class="black-solid-underline amount-cell">
                                ${Util.format(cardTotal.toString())}
                            </div>
                        </div>
                    </div>
                `);
                $('#income-container').append(`
                    <div class="row dotted-underline-row report-row">
                        <div class="col-xs-9 vertical-align">
                            <div class="black-solid-underline"><strong>Cash Total</strong></div>
                        </div>
                        <div class="col-xs-3 vertical-align text-right">
                            <div class="black-solid-underline amount-cell">
                                ${Util.format(cashTotal.toString())}
                            </div>
                        </div>
                    </div>
                `);
                $('#income-container').append(`
                    <div class="row dotted-underline-row report-row">
                        <div class="col-xs-9 vertical-align">
                            <div class="black-double-underline"><strong>Total</strong></div>
                        </div>
                        <div class="col-xs-3 vertical-align text-right">
                            <div class="black-double-underline amount-cell">
                                ${Util.format(total.toString())}
                            </div>
                        </div>
                    </div>
                `);
            } catch(error) {
                Util.log(error);
                MessageViewController.setRequestErrorMessage(error);
            }
        });
    }
}