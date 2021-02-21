import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
import Nav from '../nav';
const Util = require('../util');
const Moment = require('moment/moment');
const Currency = require('currency.js');
export default class PropertyReportsController {
    static getName() {
        return 'Reports';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-reports.html`;
    }
    static hideInNav() {
        return true;
    }
    static showInPropertyNav() {
        return true;
    }
    initNav(user) {
        let controllers = Nav.getAuthenticatedControllers(user)
            .filter(x => x.showInPropertyNav && x.showInPropertyNav());
        console.log(controllers);
        for (let controller of controllers) {
            $('.property-navigation').append(`
                <a class="property-nav-item" href="${controller.getUrl()}">${controller.getName()}</a>
            `);
        }
    }
    async init(user) {
        this.initNav(user);
        let self = this;
        new AccountSettingsController().init({}, user, false);
        let dataClient = new DataClient();
        $('#run-cash-basis-income-report').click(async function() {
            $('#income-container').empty();
            try {
                let incomePayments = await dataClient.get(`point-of-sale/cash-basis-income` +
                    `?start=${$('#start-date').val()}&end=${$('#end-date').val()}`);
                let total = Currency(0, Util.getCurrencyDefaults());
                for (let income of incomePayments) {
                    total = total.add(income.amount);
                    $('#income-container').append(`
                        <div class="row dotted-underline-row report-row">
                            <div class="col-xs-5 vertical-align">
                                <div class="black-dotted-underline">
                                    ${income.customer}
                                </div>
                            </div>
                            <div class="col-xs-3 vertical-align text-right">
                                <div class="black-dotted-underline amount-cell">
                                    ${Util.format(income.amount)}
                                </div>
                            </div>
                            <div class="col-xs-4 vertical-align">
                                <div class="black-dotted-underline">
                                    ${Moment(income.date).format('YYYY-MM-DD h:mm:ssa')}
                                </div>
                            </div>
                        </div>
                    `);
                }
                $('#income-container').append(`<div class="row"><strong>Total ${Util.format(total.toString())}</strong></div>`);
            } catch(error) {
                MessageViewController.setRequestErrorMessage(error);
            }
        });
    }
}