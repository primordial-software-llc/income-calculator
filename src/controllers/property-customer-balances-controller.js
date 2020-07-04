const DataClient = require('../data-client');
import AccountSettingsController from './account-settings-controller';
const Util = require('../util');
export default class PropertyCustomerBalancesController {
    static getName() {
        return 'Balances';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-customer-balances.html`;
    }
    getCustomerDescription(customer) {
        let fullName = `${customer.GivenName || ''} ${customer.FamilyName || ''}`.trim();
        if (fullName) {
            fullName = ' : ' + fullName;
        }
        return `${customer.DisplayName}${fullName}`;
    }
    async init(user) {
        let self = this;
        new AccountSettingsController().init({}, user, false);
        this.customers = await new DataClient().get('point-of-sale/customers');

        $('.customer-balance-container')
            .append(`<div class="row table-header-row">
               <div class="col-xs-9">Vendor</div>
               <div class="col-xs-3">Balance Owed</div>
           </div>`);

        for (let customer of this.customers.filter(x => x.Balance > 0)) {
            $('.customer-balance-container').append(`
                <div class="row dotted-underline-row customer-balance-row">
                    <div class="col-xs-9 vertical-align amount-description-column">
                        <div class="black-dotted-underline truncate-with-ellipsis">
                            ${this.getCustomerDescription(customer)}
                        </div>
                    </div>
                    <div class="col-xs-3 text-right vertical-align amount-description-column">
                        <div class="black-dotted-underline">
                            ${Util.format(customer.Balance)}
                        </div>
                    </div>
                </div>
            `);
        }
    }
}