const Util = require('./util');
const Currency = require('currency.js');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
function DataClient() {
    this.patch = async function (data) {
        let requestParams = {
            method: 'PATCH',
            mode: 'cors',
            headers: {
                'Authorization': Util.getCookie('idToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        return await this.sendRequestInner('budget', requestParams)
    };
    this.post = async function (endpoint, data) {
        let requestParams = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Authorization': Util.getCookie('idToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        return await this.sendRequestInner(endpoint, requestParams)
    };
    this.delete = async function (endpoint, data) {
        let requestParams = {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Authorization': Util.getCookie('idToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        return await this.sendRequestInner(endpoint, requestParams)
    };
    this.getBudget = async function () {
        let data = await this.get('budget');
        let obfuscate = Util.obfuscate();
        if (obfuscate) {
            $('#save').prop('disabled', true);
            let obfuscationAmount = Util.obfuscationAmount();
            if (data.biWeeklyIncome && data.biWeeklyIncome.amount) {
                data.biWeeklyIncome.amount = Currency(data.biWeeklyIncome.amount, Util.getCurrencyDefaults())
                    .multiply(obfuscationAmount).toString();
            }
            for (let weekly of data.weeklyRecurringExpenses) {
                weekly.amount = Currency(weekly.amount, Util.getCurrencyDefaults()).multiply(obfuscationAmount).toString();
            }
            for (let monthly of data.monthlyRecurringExpenses) {
                monthly.amount = Currency(monthly.amount, Util.getCurrencyDefaults()).multiply(obfuscationAmount).toString();
            }
            if (data['401k-contribution-for-year']) {
                data['401k-contribution-for-year'] = Currency(data['401k-contribution-for-year'],
                    Util.getCurrencyDefaults()).multiply(obfuscationAmount).toString();
            }
            if (data['401k-contribution-per-pay-check']) {
                data['401k-contribution-per-pay-check'] = Currency(data['401k-contribution-per-pay-check'],
                    Util.getCurrencyDefaults()).multiply(obfuscationAmount).toString();
            }
        }
        return data;
    };
    this.get = async function (requestType) {
        let requestParams = {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization': Util.getCookie('idToken'),
                'Content-Type': 'application/json'
            }
        };
        return await this.sendRequestInner(requestType, requestParams)
    };
    function promiseToRefresh() {
        return new Promise((resolve, reject) => {
            let userPool = new AmazonCognitoIdentity.CognitoUserPool(Util.getPoolData());
            let userData = {
                Username : Util.getUsername(),
                Pool : userPool
            };
            console.log('attempting REFRESH 2');
            let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
            console.log('attempting REFRESH 3');
            cognitoUser.refreshSession({
                getToken: function () {
                    return Util.getCookie('refreshToken');
                }
            }, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
    this.sendRequestInner = async function (requestType, requestParams) {
        let response;
        try {
            response = await fetch(`https://9hls6nao82.execute-api.us-east-1.amazonaws.com/production/${requestType}`, requestParams);
        } catch (error) {
            console.log('An error occurred when fetching. The server response can\'t be read');
            console.log(error);
        }
        // Make sure to setup cors for 4xx and 5xx responses in api gateway or the response can't be read.
        if (response.status.toString() === '401') {
            console.log('Failed to authenticate attempting to refresh token');
            if (!Util.getCookie('idToken') || !Util.getCookie('refreshToken')) {
                window.location = `${Util.rootUrl()}/pages/login.html`;
            }
            try {
                let refreshResult = await promiseToRefresh();
                document.cookie = `idToken=${refreshResult.getIdToken().getJwtToken()};Secure;path=/`;
                document.cookie = `refreshToken=${refreshResult.getRefreshToken().token};Secure;path=/`;
                window.location.reload();
            } catch (err) {
                console.log('error occurred when refreshing');
                console.log(err);
                window.location = `${Util.rootUrl()}/pages/login.html`;
            }
        } else if (response.status.toString()[0] !== '2') {
            throw {
                status: response.status,
                url: response.url,
                response: await response.text()
            };
        }
        return await response.json();
    };
}

module.exports = DataClient;
