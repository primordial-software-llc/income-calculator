const Moment = require('moment');
const Util = require('../util');
export default class TransferView {
    getTransferView(transfer) {
        return $(`<div class="row account-row">
                <div class="col-xs-2 vertical-align amount-description-column">
                    ${Moment(transfer.transferDate).format('LL')}
                </div>
                
                <div class="col-xs-2 vertical-align amount-description-column text-right class="capitalize-first"">
                    ${transfer.issueDate ? Moment(transfer.issueDate).format('LL') : 'N/A'}
                </div>
                <div class="col-xs-2 vertical-align amount-description-column class="capitalize-first">${transfer.debitAccount}</div>
                <div class="col-xs-2 vertical-align amount-description-column class="capitalize-first"">
                    ${transfer.creditAccount}
                </div>
                <div class="col-xs-2 vertical-align amount-description-column text-right">${Util.format(Util.getAmount(transfer))}</div>
                <div class="col-xs-1 text-center">
                    <button type="button" class="complete-transfer btn btn-success add-remove-btn-container add-remove-btn" title="Complete transfer">
                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
                    </button>
                </div>
                <div class="col-xs-1 remove-button-container text-center">
                    <button type="button" class="cancel-transfer btn remove add-remove-btn-container add-remove-btn" title="Cancel transfer">
                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                    </button>
                </div>
            </div>`);
    }
}