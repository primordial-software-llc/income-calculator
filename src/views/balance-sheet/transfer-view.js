const Moment = require('moment/moment');
function TransferView() {
    this.getView = function (name, allowableTransferViewModels) {
        let options = '';
        for (let viewModel of allowableTransferViewModels) {
            options += `<option value="${viewModel.getViewType()}">${viewModel.getViewDescription()}</option>`;
        }
        let defaultTransactionDate = Moment().add(1, 'days').format('YYYY-MM-DD UTC Z');
        return `<form class="transferring">
                <div class="form-group row">
                  <label class="col-xs-3 col-form-label col-form-label-lg">Source</label>
                  <div class="col-xs-9">
                      <input disabled="disabled" class="transfer-source form-control text-right" type="text" value="${name}">
                  </div>
                </div>
                <div class="form-group row">
                  <label class="col-xs-3 col-form-label col-form-label-lg">Transfer Date</label>
                  <div class="col-xs-9">
                      <input class="transfer-date form-control text-right" type="text" value="${defaultTransactionDate}">
                  </div>
                </div>
                <div class="form-group row">
                  <label class="col-xs-3 col-form-label col-form-label-lg">Target</label>
                  <div class="col-xs-9">
                      <select class="asset-type-selector form-control">
                          <option>Select an Asset Type</option>
                          ${options}
                      </select>
                  </div>
                </div>
                <div class="target-asset-type"></div>
            </form>`;
    }
}

module.exports = TransferView;
