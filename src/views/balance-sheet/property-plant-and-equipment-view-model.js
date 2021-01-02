import CashViewModel from './cash-view-model';
import AssetViewModel from "./asset-view-model";
const TransferController = require('../../controllers/balance-sheet/transfer-controller');
const Util = require('../../util');
export default class PropertyPlantAndEquipmentViewModel extends AssetViewModel {
    constructor(viewDescription, viewType) {
        super();
        this.viewDescription = viewDescription;
        this.viewType = viewType;
    }
    isCurrentAsset() { return false; }
    getViewDescription() { return this.viewDescription };
    getViewType() { return this.viewType };
    getReadOnlyView(model, disable) {
        let view = $(`
        <div>
            <div class="dotted-underline-row row transaction-input-view">
                <div class="col-xs-8 vertical-align amount-description-column">
                    <div class="dotted-underline truncate-with-ellipsis model-name"></div>
                </div>
                <div class="col-xs-3 text-right vertical-align amount-description-column">
                    <div class="dotted-underline model-amount"></div>
                </div>
                <div class="col-xs-1 transfer-button"></div>
            </div>
        </div>`);
        view.find('.model-name').text(model.name);
        if (model.isAuthoritative) {
            view.find('.model-name').prepend(`<span title="This account data is current and directly from your bank account" alt="This account data is current and directly from your bank account" class="glyphicon glyphicon-cloud" aria-hidden="true" style="color: #5cb85c;"></span>&nbsp;`);
        }
        view.find('.model-amount').text(Util.format(model.amount));
        let transferButton;
        if (!model.isAuthoritative) {
            transferButton = $(`<button ${disable ? 'disabled="disabled"' : ''} type="button" class="btn btn-success add-remove-btn" title="Liquidate">
                <span class="glyphicon glyphicon-transfer" aria-hidden="true"></span>
            </button>`);
            view.find('.transfer-button').append(transferButton);
            new TransferController().init(
                transferButton,
                view,
                model.name,
                [new CashViewModel()],
                model.id);
        }
        return view;
    }
    getView() {
        return $(`<div>
                <div class="asset-item row transaction-input-view">
                    <div class="col-xs-9">
                        <input class="name form-control" type="text" />
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
