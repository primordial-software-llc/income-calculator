import BondViewModel from './bond-view-model';
const cal = require('../../calculators/calendar');
import CashViewModel from './cash-view-model';
const Currency = require('currency.js');
import EquityViewModel from './equity-view-model';
import PropertyPlantAndEquipmentViewModel from './property-plant-and-equipment-view-model';
import LoanViewModel from './loan-view-model';
import InventoryViewModel from "./inventory-view-model";
const Util = require('../../util');
exports.getModel = function () {
    return { balances: new LoanViewModel().getModels() };
};
function getWeeklyAmount(budget, debtName) {
    let monthlyTxn = budget.monthlyRecurringExpenses.find(x => x.name === debtName && x.type === 'expense');
    let weeklyTxn = budget.weeklyRecurringExpenses.find(x => x.name === debtName && x.type === 'expense');
    return monthlyTxn ? Currency(monthlyTxn.amount, Util.getCurrencyDefaults()).divide(cal.WEEKS_IN_MONTH).toString()
        : weeklyTxn ? weeklyTxn.amount : 0;
}
exports.setView = function (budget, obfuscate) {
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

    let currentAssetTotal = Currency(0, Util.getCurrencyDefaults());
    let nonCurrentAssetTotal = Currency(0, Util.getCurrencyDefaults());
    for (let loan of budget.balances) {
        if (loan.isCurrent) {
            currentLiabilitiesTotal = currentLiabilitiesTotal.add(loan.amount);
        } else {
            nonCurrentLiabilitiesTotal = nonCurrentLiabilitiesTotal.add(loan.amount);
        }
        let loanView = new LoanViewModel().getView(loan, getWeeklyAmount(budget, loan.name), obfuscate);
        $('#balance-input-group').append(loanView);
    }

    let viewModels = [
        new CashViewModel(),
        new BondViewModel(),
        new InventoryViewModel(),
        new EquityViewModel(),
        new PropertyPlantAndEquipmentViewModel()];
    for (let viewModel of viewModels) {
        let assetTypeTotal = Currency(0, Util.getCurrencyDefaults());
        let assetsOfType = (budget.assets || []).filter(x => (x.type || '').toLowerCase() === viewModel.getViewType().toLowerCase());
        if (viewModel.sort) {
            viewModel.sort(assetsOfType);
        }
        if (assetsOfType.length > 0) {
            $('#all-assets-container').append(viewModel.getContainer(viewModel));
            $(`.${viewModel.getViewType().toLowerCase()}-header-container`).append(viewModel.getReadOnlyHeaderView());
        }
        for (let asset of assetsOfType) {
            assetTypeTotal = assetTypeTotal.add(Util.getAmount(asset));
        }
        for (let asset of assetsOfType) {
            $(`#${viewModel.getViewType().toLowerCase()}-input-group`).append(viewModel.getReadOnlyView(asset, assetTypeTotal, obfuscate, budget.pending));
        }
        if (viewModel.isCurrentAsset()) {
            currentAssetTotal = currentAssetTotal.add(assetTypeTotal);
        } else {
            nonCurrentAssetTotal = nonCurrentAssetTotal.add(assetTypeTotal);
        }
        $(`#${viewModel.getViewType().toLowerCase()}-total-amount`).text(Util.format(assetTypeTotal.toString()));
    }

    let assetsTotal = currentAssetTotal.add(nonCurrentAssetTotal);
    let liabilitiesTotal = currentLiabilitiesTotal.add(nonCurrentLiabilitiesTotal);
    let currentNet = currentAssetTotal.subtract(currentLiabilitiesTotal);
    let nonCurrentNet = nonCurrentAssetTotal.subtract(nonCurrentLiabilitiesTotal);

    $('#loan-total-amount-value').text(`(${Util.format(liabilitiesTotal.toString())})`);
    $('#total-current-liabilities').text(Util.format(currentLiabilitiesTotal));
    $('#total-current-net').text(Util.format(currentNet))
    $('#total-non-current-liabilities').text(Util.format(nonCurrentLiabilitiesTotal));
    $('#total-non-current-net').text(Util.format(nonCurrentNet));
    $('#total-tangible-assets').text(Util.format(nonCurrentAssetTotal));
    $('#total-non-tangible-assets').text(Util.format(currentAssetTotal.toString()));
    $('#total-debt').text(`(${Util.format(liabilitiesTotal)})`);
    let net = Currency(0, Util.getCurrencyDefaults())
        .subtract(liabilitiesTotal)
        .add(currentAssetTotal)
        .add(nonCurrentAssetTotal);

    $('#total-assets').text(Util.format(assetsTotal));
    $('#total-liabilities').text(Util.format(liabilitiesTotal));
    $('#net-total').text(Util.format(net));
};