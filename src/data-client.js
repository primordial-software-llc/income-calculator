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
    this.sendRequestInner = async function (requestType, requestParams) {
        let response;
        try {
            response = await fetch(`https://9hls6nao82.execute-api.us-east-1.amazonaws.com/production/${requestType}`, requestParams);
        } catch (error) {
            console.log(error);
            console.log('token is likely invalid causing cors to fail (cors can be fixed for errors in api gateway)');
            let userPool = new AmazonCognitoIdentity.CognitoUserPool(Util.getPoolData());
            let userData = {
                Username : 'timg456789@yahoo.com',// Util.getUsername(),
                Pool : userPool
            };
            let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
            cognitoUser.refreshSession( {
                    getToken: function () {
                        return Util.getCookie('refreshToken');
                    }
            }, function (err, result) {
                if (err) {
                    throw err;
                }
                document.cookie = `idToken=${result.getIdToken().getJwtToken()};Secure;path=/`;
                document.cookie = `refreshToken=${result.getRefreshToken().token};Secure;path=/`;
                window.location=`${Util.rootUrl()}/pages/balance-sheet.html${window.location.search}`;
            });
            // Eventually the refresh token will expire and the user will have to login again.
            // I need to see that happen before I handle that use case.
            //console.log('REDIRECTING to login page');
            //window.location=`${Util.rootUrl()}/pages/login.html${window.location.search}`;
        }
        if (response.status.toString()[0] !== "2") {
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
