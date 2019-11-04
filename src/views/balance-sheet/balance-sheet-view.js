const LoanViewModel = require('./loan-view-model');
const CashViewModel = require('./cash-view-model');
const CashOrStockViewModel = require('./cash-or-stock-view-model');
const PpeVm = require('./property-plant-and-equipment-view-model');
const BondViewModel = require('./bond-view-model');
const cal = require('../../calculators/calendar');
const Currency = require('currency.js');
const Util = require('../../util');
exports.getModel = function () {
    return {
        balances: new LoanViewModel().getModels()
    };
};
function setupToggle(container, detail) {
    $(container).click(function () {
        $(container).empty();
        if ($(detail).is(':visible')) {
            $(detail).hide();
            $(container).append($('<span class="glyphicon glyphicon-expand" aria-hidden="true"></span>'));
        } else {
            $(detail).show();
            $(container).append($('<span class="glyphicon glyphicon-collapse-down" aria-hidden="true"></span>'));
        }
    });
}
function getWeeklyAmount(budget, debtName) {
    let monthlyTxn = budget.monthlyRecurringExpenses.find(x => x.name === debtName);
    let weeklyTxn = budget.weeklyRecurringExpenses.find(x => x.name === debtName);
    return monthlyTxn ? (monthlyTxn.amount/100) / cal.WEEKS_IN_MONTH
        : weeklyTxn ? weeklyTxn.amount/100 : 0;
}
exports.setView = function (budget, bankData, viewModel) {
    $('#balance-input-group').empty();
    $('.cash-header-container').append(new CashViewModel().getReadOnlyHeaderView());
    $('.assets-header-container').append(new CashOrStockViewModel().getReadOnlyHeaderView());
    $('.property-plant-and-equipment-header-container').append(new PpeVm().getHeaderView());
    for (let loan of budget.balances) {
        let loanView = new LoanViewModel().getView(loan.amount, loan.name, loan.rate, getWeeklyAmount(budget, loan.name));
        $('#balance-input-group').append(loanView);
    }
    for (let creditCard of (bankData.accounts || []).filter(x => (x.type || '').toLowerCase() === 'credit')) {
        let loanView = new LoanViewModel().getView(
            creditCard.balances.current,
            `Credit Card - ${creditCard.mask}`,
            .18,
            getWeeklyAmount(budget, `Credit Card - ${creditCard.mask}`),
            true);
        $('#balance-input-group').append(loanView);
    }
    $('#loan-total-amount-value').text(`(${Util.format(viewModel.debtsTotal.toString())})`);
    let totalCash = Currency(0, Util.getCurrencyDefaults());
    let authoritativeCashTotal = Currency(0, Util.getCurrencyDefaults());
    let totalNonTangibleAssets = Currency(0, Util.getCurrencyDefaults());
    for (let asset of budget.assets) {
        totalNonTangibleAssets = totalNonTangibleAssets.add(Util.getAmount(asset));
    }
    for (let cashAccount of (bankData.accounts || []).filter(x => (x.type || '').toLowerCase() === 'depository')) {
        authoritativeCashTotal = authoritativeCashTotal.add(cashAccount.balances.available);
        $('#cash-input-group').append(new CashViewModel().getReadOnlyView(
            cashAccount.balances.available,
            `Checking - ${cashAccount.mask}`,
            cashAccount.account_id));
    }
    totalCash = totalCash.add(authoritativeCashTotal);
    totalNonTangibleAssets = totalNonTangibleAssets.add(authoritativeCashTotal);
    for (let cashAccount of (budget.assets || []).filter(x => (x.type || '').toLowerCase() === 'cash')) {
        totalCash = totalCash.add(cashAccount.amount);
        $('#cash-input-group').append(new CashViewModel().getReadOnlyView(cashAccount.amount, cashAccount.name, cashAccount.id));
    }
    let totalPropertyPlantAndEquipment = Currency(0, Util.getCurrencyDefaults());
    for (let tangibleAsset of budget.propertyPlantAndEquipment || []) {
        totalPropertyPlantAndEquipment = totalPropertyPlantAndEquipment.add(tangibleAsset.amount);
        $('#property-plant-and-equipment-input-group').append(new PpeVm().getReadOnlyView(tangibleAsset.amount, tangibleAsset.name));
    }
    let ppeTotalView = $(`<div class="subtotal">Total Property, Plant and Equipment<span class="pull-right amount">${Util.format(totalPropertyPlantAndEquipment.toString())}</span></div>`);
    $('#property-plant-and-equipment-total-amount').append(ppeTotalView);
    let totalEquities = Currency(0, Util.getCurrencyDefaults());
    let equityViewModel = new CashOrStockViewModel();
    for (let equity of (budget.assets || [])
            .filter(x => (x.type || '').toLowerCase() !== 'bond' &&
                         (x.type || '').toLowerCase() !== 'cash')) {
        totalEquities = totalEquities.add(Util.getAmount(equity));
        let view = equityViewModel.getReadOnlyView(
            equity.name,
            totalNonTangibleAssets.toString(),
            budget.pending,
            equity.shares,
            equity.sharePrice
        );
        $('#asset-input-group').append(view);
    }
    let totalBonds = Currency(0, Util.getCurrencyDefaults());
    for (let bond of (budget.assets || []).filter(x => (x.type || '').toLowerCase() === 'bond')) {
        totalBonds = totalBonds.add(Currency(bond.amount));
        $('#bond-input-group').append(new BondViewModel().getReadOnlyView(bond));
    }
    $('#cash-allocation').append($(`<div class="allocation">Percent of Non-Tangible Assets in Cash<span class="pull-right amount">
            ${new CashOrStockViewModel().getAllocation(totalNonTangibleAssets, totalCash).toString()}</span></div>`));
    $('#cash-total-amount').append(
        $(`<div class="subtotal">Total Cash<span class="pull-right amount">${Util.format(totalCash.toString())}</span></div>`)
    );
    $('#cash-and-stocks-allocation').append($(`<div class="allocation">Percent of Non-Tangible Assets in Equities<span class="pull-right amount">
            ${new CashOrStockViewModel().getAllocation(totalNonTangibleAssets, totalEquities).toString()}</span></div>`));
    $('#cash-and-stocks-total-amount').append(
        $(`<div class="subtotal">Total Equities<span class="pull-right amount">${Util.format(totalEquities.toString())}</span></div>`)
    );
    $('#bond-allocation').append($(`<div class="allocation">Percent of Non-Tangible Assets in Bonds<span class="pull-right amount">${new CashOrStockViewModel().getAllocation(totalNonTangibleAssets, totalBonds.toString()).toString()}</span></div>`));
    $('#bond-total-amount').append(
        (`<div class="subtotal">Total Bonds<span class="pull-right amount">${Util.format(totalBonds.toString())}</span></div>`)
    );
    $('#total-tangible-assets').text(Util.format(totalPropertyPlantAndEquipment));
    $('#total-non-tangible-assets').text(Util.format(totalNonTangibleAssets));
    $('#total-debt').text(`(${Util.format(viewModel.debtsTotal)})`);
    let net = Currency(0, Util.getCurrencyDefaults())
        .subtract(viewModel.debtsTotal)
        .add(totalPropertyPlantAndEquipment)
        .add(totalNonTangibleAssets);
    $('#net-total').text(Util.format(net.toString()));
    setupToggle('#tree-view-loans','#loans-container');
    setupToggle('#tree-view-cash', '#cash-container');
    setupToggle('#tree-view-property-pant-and-equipment', '#property-plant-and-equipment-container');
    setupToggle('#tree-view-cash-or-stock','#assets-container');
    setupToggle('#tree-view-bonds','#bond-container');
    setupToggle('#tree-view-totals-row','#totals-row');
};