import DataClient from '../../data-client';
const Moment = require('moment/moment');
const TransferView = require('../../views/balance-sheet/transfer-view');
const Util = require('../../util');
function TransferController() {
    this.init = function (
        transferButton,
        viewContainer,
        debitAccountName,
        allowableTransferViewModels,
        debitId,
        readOnlyAmount) {
        transferButton.click(function () {
            transferButton.attr('disabled', true);
            let transferView = $(new TransferView().getView(debitAccountName, allowableTransferViewModels));
            viewContainer.append(transferView);
            let viewModel;
            let newView;
            viewContainer.find('.asset-type-selector').change(function () {
                let selectedAssetType = viewContainer.find('.asset-type-selector').val();
                viewModel = allowableTransferViewModels.find(x => x.getViewType().toLowerCase() === selectedAssetType.toLowerCase());
                transferView.find('.target-asset-type').empty();
                if (viewModel) {
                    newView = viewModel.getView(readOnlyAmount);
                    transferView.find('.target-asset-type').append(viewModel.getHeaderView());
                    transferView.find('.target-asset-type').append(newView);
                }
            });
            let saveTransferBtn = $(`<input type="button" value="Transfer" class="btn btn-primary">`);
            transferView.append(saveTransferBtn);
            let cancelTransferBtn = $(`<input type="button" value="Cancel" class="btn btn-default cancel">`);
            transferView.append(cancelTransferBtn);
            saveTransferBtn.click(async function () {
                let dataClient = new DataClient();
                try {
                    let data = await dataClient.getBudget();
                    let patch = {};
                    data.pending = data.pending || [];
                    patch.pending = data.pending;
                    let transferModel = viewModel.getModel(newView);
                    if (!transferModel) {
                        return;
                    }
                    transferModel.id = Util.guid();
                    if (transferModel.amount) {
                        transferModel.amount = Util.cleanseNumericString(transferModel.amount);
                    }
                    transferModel.transferDate = Moment(transferView.find('.transfer-date').val().trim(), 'YYYY-MM-DD UTC Z');
                    transferModel.debitAccount = debitAccountName;
                    transferModel.type = viewModel.getViewType();
                    if (!transferModel.creditAccount) {
                        transferModel.creditAccount = transferModel.name;
                    }
                    transferModel.debitId = debitId;
                    patch.pending.push(transferModel);

                    await dataClient.patch('budget', patch);
                    window.location.reload();
                } catch (error) {
                    Util.log(err);
                }
            });
            cancelTransferBtn.click(function () {
                transferButton.attr("disabled", false);
                transferView.remove();
            });
        });
    }
}

module.exports = TransferController;
