import AssetViewModels from "../../view-models/asset-view-models";
const Currency = require('currency.js');
import LoanViewModel from './loan-view-model';
const Util = require('../../util');
export default class BalanceSheetView {
    getModel() {
        return { balances: new LoanViewModel().getModels() };
    };

    setView(budget, obfuscate) {
        if (budget.failed && budget.failed.length > 0) {
            $('#message-container').html(`<div class="alert alert-warning" role="alert">
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <p class="mb-0">
                        Failed to get accounts from ${budget.failed.length} financial institutions: ${budget.failed.map(x => x.institutionName)}.
                    </p>
                </div>`);
            console.log('Failed to get accounts from the following financial institutions: ' + JSON.stringify(budget.failed, 0, 4));
        }
        $('#balance-input-group').empty();

        let currentLiabilitiesTotal = Currency(0, Util.getCurrencyDefaults());
        let nonCurrentLiabilitiesTotal = Currency(0, Util.getCurrencyDefaults());

        for (let loan of budget.balances) {
            if (loan.isCurrent) {
                currentLiabilitiesTotal = currentLiabilitiesTotal.add(loan.amount);
            } else {
                nonCurrentLiabilitiesTotal = nonCurrentLiabilitiesTotal.add(loan.amount);
            }
            let monthlyTxn = budget.monthlyRecurringExpenses.find(x => (x.name || '').toLowerCase() === (loan.name || '').toLowerCase() && x.type === 'expense');
            let weeklyTxn = budget.weeklyRecurringExpenses.find(x => (x.name || '').toLowerCase() === (loan.name || '').toLowerCase() && x.type === 'expense');
            let loanView = new LoanViewModel().getView(
                loan,
                weeklyTxn,
                monthlyTxn,
                obfuscate);
            $('#balance-input-group').append(loanView);
        }

        let viewModels = AssetViewModels.getAssetViewModels();
        for (let viewModel of viewModels) {
            let assetsOfType = (budget.assets || []).filter(x => (x.type || '').toLowerCase() === viewModel.getViewType().toLowerCase());
            if (!assetsOfType.length) {
                continue;
            }
            if (viewModel.sort) {
                viewModel.sort(assetsOfType);
            }
            let container = viewModel.isCurrentAsset() ? '#current-assets-container' : '#non-current-assets-container';
            $(container).append(viewModel.getContainer(viewModel));
            $(`.${viewModel.getViewType().toLowerCase()}-header-container`).append(viewModel.getReadOnlyHeaderView());
            for (let asset of assetsOfType) {
                $(`#${viewModel.getViewType().toLowerCase()}-input-group`).append(viewModel.getReadOnlyView(asset, obfuscate, budget.pending));
            }
        }
        let currentAssetTotal =  budget.assets.filter(x => viewModels.find(vm =>(x.type || '').toLowerCase() === vm.getViewType().toLowerCase()).isCurrentAsset())
            .reduce((accumulator, currentValue) => accumulator.add(Util.getAmount(currentValue)), Currency(0, Util.getCurrencyDefaults()));
        let nonCurrentAssetTotal = budget.assets.filter(x => !viewModels.find(vm =>(x.type || '').toLowerCase() === vm.getViewType().toLowerCase()).isCurrentAsset())
            .reduce((accumulator, currentValue) => accumulator.add(Util.getAmount(currentValue)), Currency(0, Util.getCurrencyDefaults()));
        let assetsTotal = currentAssetTotal.add(nonCurrentAssetTotal);

        $('#total-tangible-assets').text(Util.format(nonCurrentAssetTotal));

        let liabilitiesTotal = currentLiabilitiesTotal.add(nonCurrentLiabilitiesTotal);
        let currentNet = currentAssetTotal.subtract(currentLiabilitiesTotal);
        let nonCurrentNet = nonCurrentAssetTotal.subtract(nonCurrentLiabilitiesTotal);

        $('#total-current-assets').text(Util.format(currentAssetTotal.toString()));
        $('#loan-total-amount-value').text(`(${Util.format(liabilitiesTotal.toString())})`);
        $('#total-current-liabilities').text(Util.format(currentLiabilitiesTotal));
        $('#total-current-net').text(Util.format(currentNet))
        $('#total-non-current-liabilities').text(Util.format(nonCurrentLiabilitiesTotal));
        $('#total-non-current-net').text(Util.format(nonCurrentNet));
        $('#total-debt').text(`(${Util.format(liabilitiesTotal)})`);
        let net = Currency(0, Util.getCurrencyDefaults())
            .subtract(liabilitiesTotal)
            .add(currentAssetTotal)
            .add(nonCurrentAssetTotal);

        $('#total-assets').text(Util.format(assetsTotal));
        $('#total-liabilities').text(Util.format(liabilitiesTotal));
        $('#net-total').text(Util.format(net));
    };
}