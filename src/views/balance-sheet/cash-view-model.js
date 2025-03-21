import AssetViewModels from '../../view-models/asset-view-models';
import BondViewModel from './bond-view-model';
import CurrentBalanceCalculator from '../../calculators/current-balance-calculator';
const ExpenseViewModel = require('./expense-view-model');
import EquityViewModel from './equity-view-model';
import PropertyPlantAndEquipmentViewModel from './property-plant-and-equipment-view-model';
import AssetViewModel from "./asset-view-model";
import InventoryViewModel from "./inventory-view-model";
const TransferController = require('../../controllers/balance-sheet/transfer-controller');
const Util = require('../../util');
export default class CashViewModel extends AssetViewModel {
    isCurrentAsset() { return true; }
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
        return $(`<div class="row table-header-row color-imago-cream">
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
            : `<a href="${`${Util.rootUrl()}/pages/transfers.html`}">${Util.format(currentBalanceIncludingPending)}</a>`;
        let icon = currentAssetAccount.isAuthoritative
            ? `<span title="This account data is current and directly from your bank account" alt="This account data is current and directly from your bank account" class="glyphicon glyphicon-cloud" aria-hidden="true" style="color: #5cb85c;"></span>`
            : '';
        let view = $(`
            <div class="dotted-underline-row row transaction-input-view">
                    <div class="col-xs-5 vertical-align amount-description-column">
                        <div class="dotted-underline truncate-with-ellipsis">
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
                        <div class="dotted-underline link-color-white-always-underline">${currentBalanceView}</div>
                    </div>
                    <div class="col-xs-1 transfer-button-container"></div>
            </div>
        `);
        let transferButton;
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        if (!currentAssetAccount.isAuthoritative) {
            transferButton = $(`<button ${disable ? 'disabled="disabled"' : ''} type="button" class="btn btn-success add-remove-btn" title="Liquidate or Stock">
                                <span class="glyphicon glyphicon-transfer" aria-hidden="true"></span>
                            </button>`);
            view.find('.transfer-button-container').append(transferButton);
            new TransferController().init(
                transferButton,
                viewContainer,
                currentAssetAccount.name,
                AssetViewModels.getAssetViewModels().concat(new ExpenseViewModel()),
                currentAssetAccount.id
            );
        }
        return viewContainer;
    };
    getView(readOnlyAmount) {
        return $(`<div>
               <div class="asset-item row transaction-input-view">
                   <div class="col-xs-9">
                       <input class="name form-control" type="text" />
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