import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
import Navigation from '../nav';
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
    async init(user) {
        $('.property-navigation').append(Navigation.getPropertyNav(user, PropertyReportsController.getUrl()));
        let self = this;
        new AccountSettingsController().init({}, user, false);
        let dataClient = new DataClient();
        $('#run-cash-basis-income-report').click(async function() {
            $('#income-container').empty();
            try {
                let incomePayments = await dataClient.get(`point-of-sale/cash-basis-income` +
                    `?start=${$('#start-date').val()}&end=${$('#end-date').val()}`);
                const startDate = Moment($('#start-date').val(), 'YYYY-MM-DD');
                const endDate = Moment($('#end-date').val() + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss');
                let cardCharges = await dataClient.get(`point-of-sale/card-charges?` +
                    `start=${startDate.utc().format('YYYY-MM-DD HH:mm:ss')}`+
                    `&end=${endDate.utc().format('YYYY-MM-DD HH:mm:ss')}`);
                let cardTotal = Currency(0, Util.getCurrencyDefaults());
                for (let cardCharge of cardCharges.filter(x => (x.status || '').toLowerCase() === 'succeeded')) {
                    let amount = Currency(cardCharge.amount, Util.getCurrencyDefaults())
                        .divide(100);
                    cardTotal = cardTotal.add(amount)
                }
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
                            <div class="col-xs-4 vertical-align">
                                <div class="black-dotted-underline">
                                    ${Moment(income.date).format('YYYY-MM-DD h:mm:ssa')}
                                </div>
                            </div>
                            <div class="col-xs-3 vertical-align text-right">
                                <div class="black-dotted-underline amount-cell">
                                    ${Util.format(income.amount)}
                                </div>
                            </div>
                        </div>
                    `);
                }
                let cashTotal = Currency(total, Util.getCurrencyDefaults()).subtract(cardTotal);
                $('#income-container').append(`
                    <div class="row dotted-underline-row report-row">
                        <div class="col-xs-9 vertical-align">
                            <div class="black-solid-underline"><strong>Card Total</strong></div>
                        </div>
                        <div class="col-xs-3 vertical-align text-right">
                            <div class="black-solid-underline amount-cell">
                                ${Util.format(cardTotal.toString())}
                            </div>
                        </div>
                    </div>
                `);
                $('#income-container').append(`
                    <div class="row dotted-underline-row report-row">
                        <div class="col-xs-9 vertical-align">
                            <div class="black-solid-underline"><strong>Cash Total</strong></div>
                        </div>
                        <div class="col-xs-3 vertical-align text-right">
                            <div class="black-solid-underline amount-cell">
                                ${Util.format(cashTotal.toString())}
                            </div>
                        </div>
                    </div>
                `);
                $('#income-container').append(`
                    <div class="row dotted-underline-row report-row">
                        <div class="col-xs-9 vertical-align">
                            <div class="black-double-underline"><strong>Total</strong></div>
                        </div>
                        <div class="col-xs-3 vertical-align text-right">
                            <div class="black-double-underline amount-cell">
                                ${Util.format(total.toString())}
                            </div>
                        </div>
                    </div>
                `);
            } catch(error) {
                Util.log(error);
                MessageViewController.setRequestErrorMessage(error);
            }
        });
    }
}