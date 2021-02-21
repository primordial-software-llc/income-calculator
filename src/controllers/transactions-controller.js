import AccountSettingsController from './account-settings-controller';
const Currency = require('currency.js');
import DataClient from '../data-client';
const Util = require('../util');

export default class TransactionsController {
    static getName() {
        return 'Transactions';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/transactions.html`;
    }
    static showInPropertyNav() {
        return true;
    }
    async init(usernameResponse) {
        new AccountSettingsController().init({}, usernameResponse, true);
        $('#search-transactions').click(async function() {
            $('#transactions-container').empty();
            let dataClient = new DataClient();
            let transactions = await dataClient
               .get(`bank-transactions?startDate=${$('#start-date').val()}&endDate=${$('#end-date').val()}`);
            for (let transaction of transactions) {
                let transactionSummaryView = $('<span></span>');
                let transactionDetailView = $('<span class="small-text"></span>');
                let transactionView = $('<div></div>');
                transactionView.append(transactionSummaryView);
                transactionView.append(transactionDetailView);
                let amount = Currency(transaction.transactionDetail.amount, Util.getCurrencyDefaults())
                    .multiply(-1);
                transactionSummaryView.text(`${transaction.transactionDetail.date} ${transaction.institutionName} - ${transaction.account.subtype} - ${transaction.account.mask}: ${Util.format(amount.toString())}`);
                let location = '';
                if (transaction.transactionDetail.location && transaction.transactionDetail.location.city && transaction.transactionDetail.location.region) {
                    location = ` ${transaction.transactionDetail.location.city}, ${transaction.transactionDetail.location.region}`;
                }
                transactionDetailView.text(`    ${transaction.transactionDetail.name}${location}`);
                $('#transactions-container').append(transactionView);
            }
        });
    };
}