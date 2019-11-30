const Util = require('./util');
const Currency = require('currency.js');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
function DataClient() {
    const FETCH_MODE = 'cors';
    const FETCH_CREDENTIALS = 'include';
    this.patch = async function (data) {
        let requestParams = {
            method: 'PATCH',
            mode: FETCH_MODE,
            credentials: FETCH_CREDENTIALS,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        return await this.sendRequestInner('budget', requestParams)
    };
    this.post = async function (endpoint, data) {
        let requestParams = {
            method: 'POST',
            mode: FETCH_MODE,
            credentials: FETCH_CREDENTIALS,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        return await this.sendRequestInner(endpoint, requestParams)
    };
    this.delete = async function (endpoint, data) {
        let requestParams = {
            method: 'DELETE',
            mode: FETCH_MODE,
            credentials: FETCH_CREDENTIALS,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        return await this.sendRequestInner(endpoint, requestParams)
    };
    this.get = async function (requestType) {
        let requestParams = {
            method: 'GET',
            mode: FETCH_MODE,
            credentials: FETCH_CREDENTIALS,
            headers: { 'Content-Type': 'application/json' }
        };
        return await this.sendRequestInner(requestType, requestParams)
    };
    this.getBudget = async function () {
        let data = await this.get('budget');
        let obfuscate = Util.obfuscate();
        if (obfuscate) {
            $('#save').prop('disabled', true);
            if (data.biWeeklyIncome && data.biWeeklyIncome.amount) {
                data.biWeeklyIncome.amount = Currency(data.biWeeklyIncome.amount, Util.getCurrencyDefaults())
                    .multiply(Util.obfuscationAmount()).toString();
            }
            for (let weekly of data.weeklyRecurringExpenses) {
                weekly.amount = Currency(weekly.amount, Util.getCurrencyDefaults()).multiply(Util.obfuscationAmount()).toString();
            }
            for (let monthly of data.monthlyRecurringExpenses) {
                monthly.amount = Currency(monthly.amount, Util.getCurrencyDefaults()).multiply(Util.obfuscationAmount()).toString();
            }
            if (data['401k-contribution-for-year']) {
                data['401k-contribution-for-year'] = Currency(data['401k-contribution-for-year'],
                    Util.getCurrencyDefaults()).multiply(Util.obfuscationAmount()).toString();
            }
            if (data['401k-contribution-per-pay-check']) {
                data['401k-contribution-per-pay-check'] = Currency(data['401k-contribution-per-pay-check'],
                    Util.getCurrencyDefaults()).multiply(Util.obfuscationAmount()).toString();
            }
        }
        return data;
    };
    function promiseToRefresh() {
        return new Promise((resolve, reject) => {
            let userPool = new AmazonCognitoIdentity.CognitoUserPool(Util.getPoolData());
            let userData = {
                Username : Util.getUsername(),
                Pool : userPool
            };
            let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
            cognitoUser.refreshSession({
                getToken: function () {
                    return Util.getCookie('refreshToken'); // NOT GOING TO WORK FOR NOW. Can't acces this cookie from JS
                }
            }, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
    this.sendRequestInner = async function (requestType, requestParams, isRetryFromRefresh) {
        let response;
        try {
            $('.loader-group').removeClass('hide');
            response = await fetch(`${Util.getApiUrl()}${requestType}`, requestParams);
        } catch (error) {
            $('.loader-group').addClass('hide');
            console.log('An error occurred when fetching. The server response can\'t be read');
            console.log(error);
            return;
        }
        // Make sure to setup cors for 4xx and 5xx responses in api gateway or the response can't be read.
        if (response.status.toString() === '401') {
            console.log('Failed to authenticate attempting to refresh token');
            if (!Util.getCookie('idToken') || !Util.getCookie('refreshToken')) {
                window.location = `${Util.rootUrl()}/pages/login.html`;
            }
            try {
                if (isRetryFromRefresh) {
                    console.log('failed to refresh from token');
                    window.location = `${Util.rootUrl()}/pages/login.html`;
                }
                let refreshResult = await promiseToRefresh();
                console.log('refresh result');
                console.log(refreshResult);
                await this.post('unauthenticated/setToken', {
                    idToken: refreshResult.getIdToken().getJwtToken(),
                    refreshToken: refreshResult.getRefreshToken().token
                });
                console.log('retrying request after token refresh');
                return await this.sendRequestInner(requestType, requestParams, true);
            } catch (err) {
                console.log('error occurred when refreshing');
                console.log(err);
                window.location = `${Util.rootUrl()}/pages/login.html`;
            }
        } else if (response.status.toString()[0] !== '2') {
            $('.loader-group').addClass('hide');
            console.log('failed throwing error');
            throw {
                status: response.status,
                url: response.url,
                response: await response.text()
            };
        }
        let responseJson = await response.json();
        $('.loader-group').addClass('hide');
        return responseJson;
    };
}

module.exports = DataClient;
