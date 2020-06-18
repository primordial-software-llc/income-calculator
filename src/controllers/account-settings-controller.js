import FooterView from '../views/footer-view';
import Navigation from '../nav';
const DataClient = require('../data-client');
const Util = require('../util');

export default class AccountSettingsController {
    constructor() {
        this.save = this.save.bind(this);
    }
    async save() {
        let data = await this.view.getModel();
        try {
            let dataClient = new DataClient();
            let response = await dataClient.patch(data);
            window.location.reload();
        } catch (err) {
            Util.log(err);
        }
    }
    init (viewIn, usernameResponse, injectFooter) {
        this.view = viewIn;
        let dataClient = new DataClient();
        $('#save').click(this.save);
        $('#obfuscate-data').click(() => {
            if (Util.obfuscate()) {
                document.cookie = 'obfuscate=;Secure;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
            } else {
                document.cookie = `obfuscate=true;Secure;path=/`;
            }
            window.location.reload();
        });
        $('#account-settings-button').click(() => {
            $('#account-settings-view').modal({backdrop: 'static'});
        });
        $('#log-out-button').click(async () => {
            try {
                await dataClient.post('signout', {});
                window.location=`${Util.rootUrl()}/pages/login.html`;
            } catch (error) {
                Util.log(error);
            }
        });
        $('#view-raw-data-button').click(async () => {
            let data;
            try {
                data = await dataClient.getBudget();
            } catch (error) {
                Util.log(error);
                return;
            }
            $('#raw-data-view .modal-body').empty();
            $('#raw-data-view .modal-body').append(`<pre>${JSON.stringify(data, 0, 4)}</pre>`);
            $('#raw-data-view').modal({backdrop: 'static' });
        });
        $('#budget-download').click(async function () {
            let data;
            try {
                data = await dataClient.getBudget();
            } catch (err) {
                Util.log(err);
                return;
            }
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, 0, 4)));
            downloadLink.setAttribute('download', 'data.json');
            if (document.createEvent) {
                let event = document.createEvent('MouseEvents');
                event.initEvent('click', true, true);
                downloadLink.dispatchEvent(event);
            }
            else {
                downloadLink.click();
            }
        });

        let authenticatedControllers = Navigation.getAuthenticatedControllers(usernameResponse)
        let navItemHtml = authenticatedControllers.map(controllerType =>
            Navigation.getNavItemView(controllerType.getUrl(), controllerType.getName())
        );
        $('.tab-nav-bar').append(navItemHtml.join(''));

        if (injectFooter) {
            $('body').append(FooterView.getView(navItemHtml.join('')));
        }
    };
}