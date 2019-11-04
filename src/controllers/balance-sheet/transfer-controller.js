const DataClient = require('../../data-client');
const Moment = require('moment/moment');
const TransferView = require('../../views/balance-sheet/transfer-view');
const Util = require('../../util');
function TransferController() {
    this.init = function (
        transferButton,
        viewContainer,
        debitAccountName,
        allowableTransferViewModels,
        debitId) {
        transferButton.find('button').click(function () {
            transferButton.find('button').attr('disabled', true);
            let transferView = $(new TransferView().getView(debitAccountName, allowableTransferViewModels));
            viewContainer.append(transferView);
            let viewModel;
            let newView;
            viewContainer.find('.asset-type-selector').change(function () {
                let selectedAssetType = viewContainer.find('.asset-type-selector').val();
                viewModel = allowableTransferViewModels.find(x => x.getViewType().toLowerCase() === selectedAssetType.toLowerCase());
                transferView.find('.target-asset-type').empty();
                if (viewModel) {
                    newView = viewModel.getView();
                    transferView.find('.target-asset-type').append(viewModel.getHeaderView());
                    transferView.find('.target-asset-type').append(newView);
                }
            });
            let saveTransferBtn = $(`<input type="button" value="Transfer" class="btn btn-primary">`);
            transferView.append(saveTransferBtn);
            let cancelTransferBtn = $(`<input type="button" value="Cancel" class="btn btn-default cancel">`);
            transferView.append(cancelTransferBtn);
            saveTransferBtn.click(function () {
                let dataClient = new DataClient(Util.settings());
                dataClient.getData()
                    .then(data => {
                        let patch = {};
                        data.pending = data.pending || [];
                        patch.pending = data.pending;
                        let transferModel = viewModel.getModel(newView);
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
                        return dataClient.patch(Util.settings().s3ObjectKey, patch);
                    })
                    .then(putResult => {
                        window.location.reload();
                    })
                    .catch(err => {
                        Util.log(err);
                    });
            });
            cancelTransferBtn.click(function () {
                transferButton.find('button').attr("disabled", false);
                transferView.remove();
            });
        });


    }
}

module.exports = TransferController;
