import CashViewModel from './cash-view-model';
import AssetViewModel from "./asset-view-model";
const TransferController = require('../../controllers/balance-sheet/transfer-controller');
const Util = require('../../util');
export default class PropertyPlantAndEquipmentViewModel extends AssetViewModel {
    isCurrentAsset() { return false; }
    getViewDescription() { return 'Non-Liquid Assets' };
    getViewType() { return 'property-plant-and-equipment' };
    getReadOnlyView(model, totalOfType, disable) {
        let icon = model.isAuthoritative
            ? `<span title="This account data is current and directly from your bank account" alt="This account data is current and directly from your bank account" class="glyphicon glyphicon-cloud" aria-hidden="true" style="color: #5cb85c;"></span>`
            : '';
        let view = $(`
        <div>
            <div class="dotted-underline-row row transaction-input-view">
                <div class="col-xs-8 vertical-align amount-description-column">
                    <div class="dotted-underline truncate-with-ellipsis">
                        ${icon}
                        ${model.name}
                    </div>
                </div>
                <div class="col-xs-3 text-right vertical-align amount-description-column">
                    <div class="dotted-underline">${Util.format(model.amount)}</div>
                </div>
                <div class="col-xs-1 transfer-button">
                    <button ${disable ? 'disabled="disabled"' : ''} type="button" class="btn btn-success add-remove-btn" title="Liquidate">
                        <span class="glyphicon glyphicon-transfer" aria-hidden="true"></span>
                    </button>
                  </div>
            </div>
        </div>`);

        new TransferController().init(
            view.find('.transfer-button'),
            view,
            model.name,
            [new CashViewModel()],
            model.id);
        return view;
    }
    getView() {
        return $(`<div>
                <div class="asset-item row transaction-input-view">
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
            </div>`);
    };
}
