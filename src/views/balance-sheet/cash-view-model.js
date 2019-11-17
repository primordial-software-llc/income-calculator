const Util = require('../../util');
const ExpenseViewModel = require('./expense-view-model');
const PropertyPlantAndEquipmentViewModel = require('./property-plant-and-equipment-view-model');
const BondViewModel = require('./bond-view-model');
const TransferController = require('../../controllers/balance-sheet/transfer-controller');
const CashOrStockViewModel = require('./cash-or-stock-view-model');
function CashViewModel() {
    this.getViewDescription = function() {
        return 'Cash';
    };
    this.getViewType = function() {
        return 'cash';
    };
    this.getModel = function (target) {
        return {
            amount: $(target).find('input.amount').val().trim(),
            name: $(target).find('input.name').val().trim()
        };
    };
    this.getHeaderView = function () {
        return $(`<div class="row table-header-row">
              <div class="col-xs-9">Name</div>
              <div class="col-xs-3">Amount</div>
          </div>`);
    };
    this.getReadOnlyHeaderView = function () {
        return $(`<div class="row table-header-row">
              <div class="col-xs-8">Name</div>
              <div class="col-xs-3">Amount</div>
              <div class="col-xs-1">Transfer</div>
          </div>`);
    };
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
    this.getView = function () {
        let view = $(`<div class="asset-item row transaction-input-view">
                    <div class="col-xs-9">
                        <input class="name form-control text-right" type="text" />
                    </div>
                    <div class="col-xs-3">
                        <div class="input-group">
                            <div class="input-group-addon ">$</div>
                            <input class="amount form-control text-right" type="text" placeholder="0.00"/>
                        </div>
                    </div>
                  </div>
        `);
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        return viewContainer;
    };
}
module.exports = CashViewModel;
