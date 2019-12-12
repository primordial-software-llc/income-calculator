const AvailableBalanceCalculator = require('../../calculators/available-balance-calculator');
const Currency = require('currency.js');
const Util = require('../../util');
const TransferController = require('../../controllers/balance-sheet/transfer-controller');
function CashOrStockViewModel() {
    this.getViewDescription = () => 'Stock';
    this.getViewType = () => 'cash-or-stock';
    this.getTotal = (name, amount) => $(`<div class="subtotal">Total ${name}<span class="pull-right">${Util.format(amount)}</span></div>`);
    this.getModel = function (target) {
        return {
            shares: $(target).find('input.shares').val().trim(),
            sharePrice: $(target).find('input.share-price').val().trim(),
            name: $(target).find('input.name').val().trim()
        };
    };
    this.getAllocation = function (total, subtotal) {
        let allocation = Currency(subtotal, {precision: 4}).divide(total).multiply(100).toString();
        return Currency(allocation, {precision: 2}).toString() + "%";
    };
    this.getReadOnlyHeaderView = () =>
        $(`<div class="row table-header-row">
              <div class="col-xs-1">Shares</div>
              <div class="col-xs-1">Share Price</div>
              <div class="col-xs-3">Current Value</div>
              <div class="col-xs-2">Available Balance</div>
              <div class="col-xs-2">Name</div>
              <div class="col-xs-2">Allocation</div>
              <div class="col-xs-1">Liquidate</div>
          </div>`);
    this.getReadOnlyView = function (equity, total, pending, disable) {
        'use strict';
        let amount = Util.getAmount({"sharePrice": equity.sharePrice, "shares": equity.shares});
        equity.name = equity.name || '';
        let allocation = this.getAllocation(total, amount);
        let availableBalanceCalculator = new AvailableBalanceCalculator();
        let availableBalance = availableBalanceCalculator.getAvailableBalance(
            equity.name, amount.toString(), pending, equity.type, equity.id);
        let availableBalanceView = availableBalance === amount.toString()
            ? Util.format(amount.toString())
            : `<a href="${`${Util.rootUrl()}/pages/accounts.html`}">${Util.format(availableBalance)}</a>`;
        let view = $(`<div class="asset-item row transaction-input-view">
                    <div class="col-xs-1 text-right vertical-align amount-description-column">${Util.formatShares(equity.shares)}</div>
                    <div class="col-xs-1 text-right vertical-align amount-description-column">${Util.format(equity.sharePrice)}</div>
                    <div class="col-xs-3 text-right vertical-align amount-description-column">${Util.format(amount)}</div>
                    <div class="col-xs-2 text-right vertical-align amount-description-column">${availableBalanceView}</div>
                    <div class="col-xs-2 text-center vertical-align amount-description-column asset-name" >
                        <a target="_blank" href="https://finance.yahoo.com/quote/${equity.name}" title="View Chart">${equity.name}</a>
                    </div>
                    <div class="col-xs-2 text-right vertical-align amount-description-column">${allocation.toString()}</div>
                  </div>
        `);
        let transferButton = $(`<div class="col-xs-1">
                            <button ${disable ? 'disabled="disabled"' : ''} type="button" class="btn btn-success add-remove-btn" title="Liquidate">
                                <span class="glyphicon glyphicon-transfer" aria-hidden="true"></span>
                            </button>
                          </div>`);
        view.append(transferButton);
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        const CashViewModel = require('./cash-view-model');
        new TransferController().init(
            transferButton,
            viewContainer,
            equity.name,
            [new CashViewModel()],
            equity.id);
        return viewContainer;
    };
    this.getHeaderView = function () {
        return $(`<div class="row table-header-row">
              <div class="col-xs-4">Shares</div>
              <div class="col-xs-4">Share Price</div>
              <div class="col-xs-4">Name</div>
          </div>`);
    };
    this.getView = function (name, total, pending, shares, sharePrice) {
        'use strict';
        let view = $(`<div class="asset-item row transaction-input-view">
                    <div class="col-xs-4">
                        <input class="shares form-control text-right" type="text" value="${shares || ''}" placeholder="0.00" />
                    </div>
                    <div class="col-xs-4">
                        <div class="input-group">
                            <div class="input-group-addon ">$</div>
                            <input class="share-price form-control text-right" type="text" value="${sharePrice || ''}"
							placeholder="0.00"/>
                        </div>
                    </div>
                    <div class="col-xs-4"><input class="input-name name form-control" type="text" value="${name || ''}" /></div>
                  </div>
        `);
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        return viewContainer;
    };
}

module.exports = CashOrStockViewModel;
