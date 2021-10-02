import AccountSettingsController from './account-settings-controller';
const Currency = require('currency.js');
import DataClient from '../data-client';
const Moment = require('moment/moment');
const Util = require('../util');

function getAccountName(institutionName, account) { // Financial institution name format is defined in balance sheet view model.
    return [institutionName, account.subtype, account.mask || account.name]
        .filter(x => x)
        .join(' - ');
}

export default class TransactionsController {
    static getName() {
        return 'Transactions';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/transactions.html`;
    }
    convertTransactionToBudgetItem(transaction) {
        return {
            "date": Moment.utc(transaction.transactionDetail.date, 'YYYY-MM-DD').toISOString(),
            "name": transaction.transactionDetail.name,
            "paymentSource": getAccountName(transaction.institutionName, transaction.account),
            "amount": Currency(transaction.transactionDetail.amount, Util.getCurrencyDefaults())
                .multiply(-1)
                .toString(),
            "type": transaction.account.subtype === 'checking' && transaction.transactionDetail.amount > 0
                ? "expense"
                : "income",
            "frequency": "monthly"
        };
    }
    async appendTransactionsToBudget(originalBudget, transactions) {
        let patchData = {};
        patchData.budgetItems = originalBudget.budgetItems || [];
        for (let transaction of transactions) {
            patchData.budgetItems.push(this.convertTransactionToBudgetItem(transaction));
        }
        try {
            let dataClient = new DataClient();
            let response = await dataClient.patch('budget', patchData);
            window.location.href = '/pages/budget.html';
        } catch (err) {
            Util.log(err);
        }
    }
    async init(usernameResponse) {
        let self = this;
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
            if (transactions.length) {
                $('#convert-to-budget').prop('disabled', false)
            }
            $('#append-to-budget')
                .unbind('click')
                .click(function () {
                    self.appendTransactionsToBudget(usernameResponse, transactions);
                });
        });
        $('#convert-to-budget').prop('disabled', true)
    };
}