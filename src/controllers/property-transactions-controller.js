import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
const Moment = require('moment');
import MessageViewController from './message-view-controller';
import Navigation from '../nav';
const Util = require('../util');
export default class PropertyTransactionsController {
    static getName() {
        return 'Transactions';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-transactions.html`;
    }
    static hideInNav() {
        return true;
    }
    async loadTransactions() {
        let unsentTransactions;
        try {
            unsentTransactions = await this.dataClient.get('point-of-sale/unsent-transactions');
        } catch (error) {
            Util.log(error);
            MessageViewController.setRequestErrorMessage(error);
            return;
        }
        $('#transactions-container').empty();
        let itemDictionary = this.getItemDictionary();
        for (let transaction of unsentTransactions) {
            let transactionView = $(`
            <div class="row">
                <div class="col-xs-2 row-type">Type</div>
                <div class="col-xs-2 row-item">Item</div>
                <div class="col-xs-2 row-amount text-right">Amount</div>
                <div class="col-xs-2 row-date">Date</div>
                <div class="col-xs-4 row-memo">Memo</div>
            </div>`);
            let item = itemDictionary.find(x => x.account === transaction.account);
            if (!item) {
                item = itemDictionary.find(x => x.product === transaction.product);
            }
            transactionView.find('.row-type').text(transaction.type);
            transactionView.find('.row-item').text(item.name);
            transactionView.find('.row-amount').text(Util.format(transaction.amount));
            transactionView.find('.row-date').text(transaction.date);
            transactionView.find('.row-memo').text(transaction.memo);
            $('#transactions-container').append(transactionView);
        }
    }
    async init(user) {
        $('.property-navigation').append(Navigation.getPropertyNav(user, PropertyTransactionsController.getUrl()));
        let self = this;
        this.dataClient = new DataClient();
        new AccountSettingsController().init({}, user, false);
        await this.loadTransactions();
        $('#type').change(function() {
            $("#item option").remove();
            if ($("#type").val().toLocaleLowerCase() === 'income') {
                $('#item').append('<option value="Parking A">Parking A</option>');
                $('#item').append('<option value="Parking B">Parking B</option>');
                $('#item').append('<option value="Bar A">Bar A</option>');
                $('#item').append('<option value="Bar B">Bar B</option>');
                $('#item').append('<option value="Restaurant">Restaurant</option>');
            } else {
                $('#item').append('<option value="Contractor">Contractor</option>');
                $('#item').append('<option value="Cost of Goods Sold">Cost of Goods Sold</option>');
            }
        });
        $('#type').change();
        $('#add-transaction').click(function () {
            MessageViewController.setMessage('');
            $('#page-container').removeClass('view-mode');
            $('#page-container').addClass('add-mode');
        });
        $('#send-to-accounting').click(async function() {
            MessageViewController.setMessage('');
            if (window.confirm('Are you sure you would like to send all transactions to the accounting system?')) {
                let result;
                try {
                    result = await self.dataClient.post('point-of-sale/send-to-accounting', {});
                } catch (error) {
                    Util.log(error);
                    MessageViewController.setRequestErrorMessage(error);
                    return;
                }
                MessageViewController.setMessage('Transactions sent to accounting system.', 'alert-success');
                await self.loadTransactions();
            }
        });
        $('#save-transaction').click(async function () {
            MessageViewController.setMessage('');
            let itemMap = self.getItemDictionary().find(
                x => x.name.toLowerCase() === $('#item').val().toLowerCase()
            )
            let journalEntry = {
                date: $('#date').val(),
                account: itemMap.account,
                product: itemMap.product,
                amount: $('#amount').val().trim(),
                memo: $('#memo').val().trim(),
                type: $('#type').val()
            };
            let result;
            try {
                result = await self.dataClient.post('point-of-sale/transaction', journalEntry);
                $('#page-container').removeClass('add-mode');
                $('#page-container').addClass('view-mode');
                await self.loadTransactions();
            } catch (error) {
                Util.log(error)
                MessageViewController.setRequestErrorMessage(error);
                return;
            }
            MessageViewController.setMessage('Transaction saved', 'alert-success');
        });
    }
    getItemDictionary() {
        return [
            { name: "Parking A", account: 1859, product: 151 },
            { name: "Parking B", account: 1861, product: 151 },
            { name: "Bar A", account: 1862, product: 241 },
            { name: "Bar B", account: 1863, product: 240 },
            { name: "Restaurant", account: 1864, product: 238 },
            { name: "Contractor", account: 1906, product: 47 },
            { name: "Cost of Goods Sold", product: 69 }
        ];
    }
}