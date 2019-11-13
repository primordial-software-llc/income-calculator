const Util = require('./util');
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
    this.sendRequest = async function (requestType) {
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
            // Do a built-in refresh when I have my own domain and the cookie is more secure.
            // 1. Create a domain e.g. primordial-software.com
            // 2. Put api gateway behind the domain e.g. primordial-software.com/production
            // 3. Create cookie in api and set it on primordial-software.com/production as secure and http only
            // Doing this will alleviate the need to be super secure for npm modules
            // and I can remove cors, which isn't an issue for now, but would be if I want to move money at some point,
            // because the current solution zelle is terrible.
            console.log('REDIRECTING to login page');
            window.location=`${Util.rootUrl()}/pages/login.html${window.location.search}`;
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
