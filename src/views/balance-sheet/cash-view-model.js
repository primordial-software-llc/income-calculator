import CurrentBalanceCalculator from '../../calculators/current-balance-calculator';
const Util = require('../../util');
const ExpenseViewModel = require('./expense-view-model');
import PropertyPlantAndEquipmentViewModel from './property-plant-and-equipment-view-model';
const BondViewModel = require('./bond-view-model');
const TransferController = require('../../controllers/balance-sheet/transfer-controller');
const EquityViewModel = require('./equity-view-model');
export default class CashViewModel {
    getViewDescription() { return 'Cash' };
    getViewType() { return 'cash' };
    getModel(target) {
        let name = $(target).find('input.name').val().trim();
        $(target).find('.required-field-description').remove();
        $(target).find('input.name').removeClass('required-field-validation');
        if (!name) {
            $(target).find('input.name').after('<div class="required-field-description">*Required</div>')
            $(target).find('input.name').addClass('required-field-validation');
            return;
        }
        return {
            amount: $(target).find('input.amount').val().trim(),
            name: name
        };
    };
    getHeaderView() {
        return $(`<div class="row table-header-row">
              <div class="col-xs-9">Name</div>
              <div class="col-xs-3">Amount</div>
          </div>`);
    }
    getReadOnlyHeaderView() {
        return $(`<div class="row table-header-row">
              <div class="col-xs-5">Name</div>
              <div class="col-xs-3">Available Balance</div>
              <div class="col-xs-3">Current Balance</div>
              <div class="col-xs-1">Transfer</div>
          </div>`);
    }
    getReadOnlyView(currentAssetAccount, disable, pending) {
        let startingCurrentBalance = currentAssetAccount.currentBalance === null || currentAssetAccount.currentBalance === undefined
            ? currentAssetAccount.amount
            : currentAssetAccount.currentBalance;
        let currentBalanceIncludingPending = CurrentBalanceCalculator.getCurrentBalance(
            currentAssetAccount.name,
            startingCurrentBalance.toString(),
            pending,
            currentAssetAccount.type,
            currentAssetAccount.id);
        let currentBalanceView = Util.format(startingCurrentBalance.toString()) === Util.format(currentBalanceIncludingPending.toString())
            ? Util.format(currentBalanceIncludingPending.toString())
            : `<a href="${`${Util.rootUrl()}/pages/accounts.html`}">${Util.format(currentBalanceIncludingPending)}</a>`;
        let icon = currentAssetAccount.isAuthoritative
            ? `<span title="This account data is current and directly from your bank account" alt="This account data is current and directly from your bank account" class="glyphicon glyphicon-cloud" aria-hidden="true" style="color: #5cb85c;"></span>`
            : '';
        let view = $(`
            <div class="dotted-underline-row row transaction-input-view">
                    <div class="col-xs-5 vertical-align amount-description-column">
                        <div class="dotted-underline">
                            ${icon}
                            ${currentAssetAccount.name}
                        </div>
                    </div>
                    <div class="col-xs-3 text-right vertical-align amount-description-column">
                        <div class="dotted-underline">
                            ${currentAssetAccount.amount === null ||
                              currentAssetAccount.amount === undefined
                                ? 'N/A'
                                : Util.format(currentAssetAccount.amount)}
                        </div>
                    </div>
                    <div class="col-xs-3 text-right vertical-align amount-description-column">
                        <div class="dotted-underline">${currentBalanceView}</div>
                    </div>
            </div>
        `);
        let transferButton = $(`<div class="col-xs-1">
                            <button ${disable ? 'disabled="disabled"' : ''} type="button" class="btn btn-success add-remove-btn" title="Liquidate or Stock">
                                <span class="glyphicon glyphicon-transfer" aria-hidden="true"></span>
                            </button>
                          </div>`);
        view.append(transferButton);
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        new TransferController().init(
            transferButton,
            viewContainer,
            currentAssetAccount.name,
            [
                new CashViewModel(),
                new EquityViewModel(),
                new ExpenseViewModel(),
                new PropertyPlantAndEquipmentViewModel(),
                new BondViewModel()
            ],
            currentAssetAccount.id
        );
        return viewContainer;
    };
    getView(readOnlyAmount) {
        return $(`<div>
               <div class="asset-item row transaction-input-view">
                   <div class="col-xs-9">
                       <input class="name form-control text-right" type="text" />
                   </div>
                   <div class="col-xs-3">
                       <div class="input-group">
                           <div class="input-group-addon ">$</div>
                           <input ${readOnlyAmount ? 'disabled="disabled"' : ''}
                               class="amount form-control text-right"
                               type="text"
                               placeholder="0.00"
                               value="${readOnlyAmount ? Util.format(readOnlyAmount) : ''}" />
                       </div>
                   </div>
               </div>
          </div>`);
    }
}