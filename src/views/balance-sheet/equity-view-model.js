import CashViewModel from './cash-view-model';
import AssetViewModel from './asset-view-model';
const Currency = require('currency.js');
const Util = require('../../util');
const TransferController = require('../../controllers/balance-sheet/transfer-controller');
export default class EquityViewModel extends AssetViewModel {
    isCurrentAsset() { return true; }
    getViewDescription() { return 'Stocks'; }
    getViewType() { return 'cash-or-stock'; }
    getTotal(name, amount) {
        return $(`<div class="subtotal">Total ${name}<span class="pull-right">${Util.format(amount)}</span></div>`);
    }
    getModel(target) {
        return {
            shares: $(target).find('input.shares').val().trim(),
            sharePrice: $(target).find('input.share-price').val().trim(),
            name: $(target).find('input.name').val().trim()
        };
    };
    getReadOnlyHeaderView() {
        return $(`<div class="row table-header-row color-imago-cream">
              <div class="col-xs-4">Name</div>
              <div class="col-xs-2">Shares</div>
              <div class="col-xs-2">Share Price</div>
              <div class="col-xs-3">Current Value</div>
              <div class="col-xs-1">Liquidate</div>
          </div>`);
    }
    getReadOnlyView(equity, disable) {
        let view = $(`<div class="asset-item row transaction-input-view dotted-underline-row">
                    <div class="col-xs-4 text-left vertical-align amount-description-column asset-name dotted-underline truncate-with-ellipsis"><div></div></div>
                    <div class="col-xs-2 text-right vertical-align amount-description-column asset-shares dotted-underline truncate-with-ellipsis"></div>
                    <div class="col-xs-2 text-right vertical-align amount-description-column asset-share-price dotted-underline truncate-with-ellipsis"></div>
                    <div class="col-xs-3 text-right vertical-align amount-description-column asset-amount dotted-underline truncate-with-ellipsis"></div>
                    <div class="col-xs-1 transfer-button-container"></div>
                  </div>
        `);
        equity.name = equity.name || '';
        view.find('.asset-name > div').text(equity.name);
        if (equity.isAuthoritative) {
            view.find('.asset-name > div').prepend(`<span title="This account data is current and directly from your bank account" alt="This account data is current and directly from your bank account" class="glyphicon glyphicon-cloud" aria-hidden="true" style="color: #5cb85c;"></span>&nbsp;`);
        }
        view.find('.asset-shares').text(equity.shares ? Util.formatShares(equity.shares) : '');
        view.find('.asset-share-price').text(equity.sharePrice ? Util.format(equity.sharePrice) : '');
        view.find('.asset-amount').text(Util.format(Util.getAmount(equity)));
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        if (!equity.isAuthoritative) {
            let transferButton = $(`<button ${disable ? 'disabled="disabled"' : ''} type="button" class="btn btn-success add-remove-btn" title="Liquidate">
                                <span class="glyphicon glyphicon-transfer" aria-hidden="true"></span>
                            </button>`);
            view.append(transferButton);
            new TransferController().init(
                transferButton,
                viewContainer,
                equity.name,
                [new CashViewModel()],
                equity.id);
        }
        return viewContainer;
    };
    getHeaderView() {
        return $(`<div class="row table-header-row">
              <div class="col-xs-4">Shares</div>
              <div class="col-xs-4">Share Price</div>
              <div class="col-xs-4">Name</div>
          </div>`);
    };
    getView(readOnlyAmount) {
        let view = $(`<div class="asset-item row transaction-input-view">
                    <div class="col-xs-4">
                        <input class="shares form-control text-right" type="text" placeholder="0.00" />
                    </div>
                    <div class="col-xs-4">
                        <div class="input-group">
                            <div class="input-group-addon ">$</div>
                            <input class="share-price form-control text-right" type="text" placeholder="0.00"/>
                        </div>
                    </div>
                    <div class="col-xs-4"><input class="input-name name form-control" type="text" /></div>
                  </div>
        `);
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        return viewContainer;
    };
}
