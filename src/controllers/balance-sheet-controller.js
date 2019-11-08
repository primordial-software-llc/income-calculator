const AccountSettingsController = require('./account-settings-controller');
const balanceSheetView = require('../views/balance-sheet/balance-sheet-view');
const CashOrStockViewModel = require('../views/balance-sheet/cash-or-stock-view-model');
const DataClient = require('../data-client');
const LoanViewModel = require('../views/balance-sheet/loan-view-model');
const Util = require('../util');
const Currency = require('currency.js');
function HomeController() {
    'use strict';
    let s3ObjKey;
    let dataClient;
    async function refresh() {
        try {
            let data = sendRequest('budget');
            let bankData = sendRequest('accountBalance');
            data = await data;
            bankData = await bankData;
            balanceSheetView.setView(data, bankData, getViewModel(data, bankData));
        } catch (err) {
            Util.log(err);
        }
    }
    function getViewModel(budget, bankData) {
        let balanceSheetViewModel = {};
        balanceSheetViewModel.debtsTotal = Currency(0, Util.getCurrencyDefaults());
        for (let loan of budget.balances) {
            balanceSheetViewModel.debtsTotal = balanceSheetViewModel.debtsTotal.add(loan.amount);
        }
        for (let creditCard of (bankData.accounts || []).filter(x => (x.type || '').toLowerCase() === 'credit')) {
            balanceSheetViewModel.debtsTotal = balanceSheetViewModel.debtsTotal.add(creditCard.balances.current);
        }
        return balanceSheetViewModel;
    }
    async function sendRequest(requestType) {
        let requestParams = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Authorization': Util.getCookie('idToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requestType: requestType
            })
        };
        let responseData;
        try {
            let response = await fetch('https://9hls6nao82.execute-api.us-east-1.amazonaws.com/production', requestParams);
            responseData = await response.json(); // parses JSON response into native JavaScript objects
        } catch (error) {
            console.log(error);
            console.log('token is likely invalid causing cors to fail (cors can be fixed for errors in api gateway)');
            window.location=`${Util.rootUrl()}/pages/login.html${window.location.search}`;
        }
        return responseData;
    }
    this.init = function (settings) {
        s3ObjKey = settings.s3ObjectKey;
        dataClient = new DataClient(settings);
        new AccountSettingsController().init(settings, balanceSheetView);
        $('#add-new-balance').click(function () {
            $('#balance-input-group').append(new LoanViewModel().getView(100, 'new balance', '.035'));
        });
        if (s3ObjKey) {
            refresh();
        }
    };
}

module.exports = HomeController;