const Util = require('../../util');
const ExpenseViewModel = require('./expense-view-model');
import PropertyPlantAndEquipmentViewModel from './property-plant-and-equipment-view-model';
const BondViewModel = require('./bond-view-model');
const TransferController = require('../../controllers/balance-sheet/transfer-controller');
const CashOrStockViewModel = require('./cash-or-stock-view-model');
function CashViewModel() {
    this.getViewDescription = () => 'Cash';
    this.getViewType = () => 'cash';
    this.getModel = function (target) {
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
    this.getHeaderView = () =>
        $(`<div class="row table-header-row">
              <div class="col-xs-9">Name</div>
              <div class="col-xs-3">Amount</div>
          </div>`);
    this.getReadOnlyHeaderView = () =>
        $(`<div class="row table-header-row">
              <div class="col-xs-8">Name</div>
              <div class="col-xs-3">Amount</div>
              <div class="col-xs-1">Transfer</div>
          </div>`);
    this.getReadOnlyView = function (currentAssetAccount, disable) {
        'use strict';
        let icon = currentAssetAccount.isAuthoritative
            ? `<span title="This account data is current and directly from your bank account" alt="This account data is current and directly from your bank account" class="glyphicon glyphicon-cloud" aria-hidden="true" style="color: #5cb85c;"></span>`
            : '';
        let view = $(`
            <div class="dotted-underline-row row transaction-input-view">
                    <div class="col-xs-8 vertical-align amount-description-column">
                        <div class="dotted-underline">
                            ${icon}
                            ${currentAssetAccount.name}
                        </div>
                    </div>
                    <div class="col-xs-3 text-right vertical-align amount-description-column">
                        <div class="dotted-underline">${Util.format(currentAssetAccount.amount)}</div>
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
                new CashOrStockViewModel(),
                new ExpenseViewModel(),
                new PropertyPlantAndEquipmentViewModel(),
                new BondViewModel()
            ],
            currentAssetAccount.id
        );
        return viewContainer;
    };
    this.getView = (readOnlyAmount) =>
        $(`<div>
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
module.exports = CashViewModel;
