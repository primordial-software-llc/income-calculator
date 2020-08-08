const Util = require('./util');
const Currency = require('currency.js');
const FETCH_MODE = 'cors';
const FETCH_CREDENTIALS = 'include';
export default class DataClient {
    constructor(withholdWaitingIndicator) {
        this.withholdWaitingIndicator = withholdWaitingIndicator;
        this.activeRequests = 0;
    }
    async patch(endpoint, data) {
        return await this.sendRequestInner(endpoint, {
            method: 'PATCH',
            mode: FETCH_MODE,
            credentials: FETCH_CREDENTIALS,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
    };
    async post(endpoint, data, isRetryFromRefresh) {
        return await this.sendRequestInner(endpoint, {
            method: 'POST',
            mode: FETCH_MODE,
            credentials: FETCH_CREDENTIALS,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }, isRetryFromRefresh)
    };
    async delete(endpoint, data) {
        return await this.sendRequestInner(endpoint, {
            method: 'DELETE',
            mode: FETCH_MODE,
            credentials: FETCH_CREDENTIALS,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
    };
    async get(requestType) {
        return await this.sendRequestInner(requestType, {
            method: 'GET',
            mode: FETCH_MODE,
            credentials: FETCH_CREDENTIALS,
            headers: { 'Content-Type': 'application/json' }
        })
    };
    async getBudget() {
        let data = await this.get('budget');
        let obfuscate = Util.obfuscate();
        if (obfuscate) {
            $('#save').prop('disabled', true);
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
    async sendRequestInner (requestType, requestParams, isRetryFromRefresh) {
        this.activeRequests += 1;
        let response;
        let url = `${Util.getApiUrl()}${requestType}`;
        try {
            if (!this.withholdWaitingIndicator) {
                $('.loader-group').removeClass('hide');
            }
            response = await fetch(url, requestParams);
        } catch (error) {
            this.activeRequests -= 1;
            if (this.activeRequests === 0) {
                $('.loader-group').addClass('hide');
            }
            console.log(`An error occurred when fetching ${url}. The server response can\'t be read`);
            throw 'Network error failed to fetch: ' + url;
        }
        // Make sure to setup cors for 4xx and 5xx responses in api gateway or the response can't be read.
        if (response.status.toString() === '401') {
            console.log('Failed to authenticate attempting to refresh token');
            try {
                if (isRetryFromRefresh) {
                    console.log('failed to refresh from token');
                    window.location = `${Util.rootUrl()}/pages/login.html`;
                }
                await this.post('unauthenticated/refreshToken', {}, true);
                console.log('retrying request after token refresh');
                return await this.sendRequestInner(requestType, requestParams, true);
            } catch (err) {
                console.log('error occurred when refreshing');
                console.log(err);
                window.location = `${Util.rootUrl()}/pages/login.html`;
            }
        } else if (response.status.toString()[0] !== '2') {
            this.activeRequests -= 1;
            if (this.activeRequests === 0) {
                $('.loader-group').addClass('hide');
            }
            console.log('failed throwing error');
            let errorResponse = await response.text();
            throw {
                status: response.status,
                url: response.url,
                response: errorResponse
            };
        }
        let responseJson = await response.json();
        this.activeRequests -= 1;
        if (this.activeRequests === 0) {
            $('.loader-group').addClass('hide');
        }
        return responseJson;
    };
}
