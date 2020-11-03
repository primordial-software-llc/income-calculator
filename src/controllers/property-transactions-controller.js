import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
const Moment = require('moment');
import MessageViewController from './message-view-controller';
const Util = require('../util');
export default class PropertyCustomersController {
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
            transactionView.find('.row-type').text(transaction.type);
            transactionView.find('.row-item').text(item.name);
            transactionView.find('.row-amount').text(Util.format(transaction.amount));
            transactionView.find('.row-date').text(transaction.date);
            transactionView.find('.row-memo').text(transaction.memo);
            $('#transactions-container').append(transactionView);
        }
    }
    async init(user) {
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
                $('#item').append('<option value="Bar A">Bar A</option>');
                $('#item').append('<option value="Restaurant">Restaurant</option>');
            } else {
                $('#item').append('<option value="Contractor">Contractor</option>');
            }
        });
        $('#type').change();
        $('#add-transaction').click(function () {
            $('#input-form').removeClass('hide');
            $('#add-transaction').addClass('hide');
        });
        $('#save-transaction').click(async function () {
            MessageViewController.setMessage('');
            let itemMap = self.getItemDictionary().find(
                x => x.name.toLowerCase() === $('#item').val().toLowerCase()
            )
            let journalEntry = {};
            journalEntry.date = $('#date').val();
            journalEntry.account = itemMap.account;
            journalEntry.product = itemMap.product;
            journalEntry.amount = $('#amount').val().trim();
            journalEntry.memo = $('#memo').val().trim();
            journalEntry.type = $('#type').val();
            let result;
            try {
                result = await self.dataClient.post('point-of-sale/transaction', journalEntry);
                $('#input-form').addClass('hide');
                $('#add-transaction').removeClass('hide');
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
            { name: "Contractor", account: 1906, product: 47 }
        ];
    }
}