const LoanViewModel = require('./loan-view-model');
const CashViewModel = require('./cash-view-model');
const CashOrStockViewModel = require('./cash-or-stock-view-model');
const PpeVm = require('./property-plant-and-equipment-view-model');
const BondViewModel = require('./bond-view-model');
const cal = require('../../calculators/calendar');
const Currency = require('currency.js');
const Util = require('../../util');
const Moment = require('moment');
exports.getModel = function () {
    return { balances: new LoanViewModel().getModels() };
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
    let monthlyTxn = budget.monthlyRecurringExpenses.find(x => x.name === debtName && x.type === 'expense');
    let weeklyTxn = budget.weeklyRecurringExpenses.find(x => x.name === debtName && x.type === 'expense');
    return monthlyTxn ? Currency(monthlyTxn.amount, Util.getCurrencyDefaults()).divide(cal.WEEKS_IN_MONTH).toString()
        : weeklyTxn ? weeklyTxn.amount : 0;
}
exports.setView = function (budget, obfuscate) {
    $('#balance-input-group').empty();
    $('.cash-header-container').append(new CashViewModel().getReadOnlyHeaderView());
    $('.assets-header-container').append(new CashOrStockViewModel().getReadOnlyHeaderView());
    $('.property-plant-and-equipment-header-container').append(new PpeVm().getHeaderView());
    let debtTotal = Currency(0, Util.getCurrencyDefaults());
    let totalDemandDepositsAndCash = Currency(0, Util.getCurrencyDefaults());
    let totalEquities = Currency(0, Util.getCurrencyDefaults());
    let totalBonds = Currency(0, Util.getCurrencyDefaults());
    let totalPropertyPlantAndEquipment = Currency(0, Util.getCurrencyDefaults());
    for (let loan of budget.balances) {
        debtTotal = debtTotal.add(loan.amount);
        let loanView = new LoanViewModel().getView(loan, getWeeklyAmount(budget, loan.name), obfuscate);
        $('#balance-input-group').append(loanView);
    }
    for (let cashAccount of (budget.assets || []).filter(x => (x.type || '').toLowerCase() === 'cash')) {
        totalDemandDepositsAndCash = totalDemandDepositsAndCash.add(cashAccount.amount);
        let view = new CashViewModel().getReadOnlyView(cashAccount, obfuscate);
        $('#cash-input-group').append(view);
    }
    for (let tangibleAsset of (budget.assets || []).filter(x => (x.type || '').toLowerCase() === 'property-plant-and-equipment')) {
        totalPropertyPlantAndEquipment = totalPropertyPlantAndEquipment.add(tangibleAsset.amount);
        $('#property-plant-and-equipment-input-group').append(new PpeVm().getReadOnlyView(tangibleAsset.amount, tangibleAsset.name));
    }
    let equityViewModel = new CashOrStockViewModel();
    for (let equity of (budget.assets || []).filter(x => x.shares && x.sharePrice)) {
        totalEquities = totalEquities.add(Util.getAmount(equity));
    }
    for (let equity of (budget.assets || []).filter(x => x.shares && x.sharePrice)) {
        let view = equityViewModel.getReadOnlyView(equity, totalEquities.toString(), budget.pending, obfuscate);
        $('#asset-input-group').append(view);
    }
    let sortedBonds = (budget.assets || []).filter(x => (x.type || '').toLowerCase() === 'bond');
    sortedBonds.sort(function(a, b) {
        if (a.issueDate && b.issueDate) {
            let maturityDateA = Moment(a.issueDate).add(a.daysToMaturation, 'days').valueOf();
            let maturityDateB = Moment(b.issueDate).add(b.daysToMaturation, 'days').valueOf();
            return maturityDateA - maturityDateB;
        } else {
            return 0;
        }
    });
    for (let bond of sortedBonds) {
        totalBonds = totalBonds.add(Currency(bond.amount));
        $('#bond-input-group').append(new BondViewModel().getReadOnlyView(bond, obfuscate));
    }
    $('#loan-total-amount-value').text(`(${Util.format(debtTotal.toString())})`);
    let ppeTotalView = $(`<div class="subtotal">Total Property, Plant and Equipment<span class="pull-right amount">${Util.format(totalPropertyPlantAndEquipment.toString())}</span></div>`);
    $('#property-plant-and-equipment-total-amount').append(ppeTotalView);
    $('#cash-total-amount').append(
        $(`<div class="subtotal">Total Cash<span class="pull-right amount">${Util.format(totalDemandDepositsAndCash.toString())}</span></div>`)
    );
    $('#cash-and-stocks-total-amount').append(
        $(`<div class="subtotal">Total Equities<span class="pull-right amount">${Util.format(totalEquities.toString())}</span></div>`)
    );
    $('#bond-total-amount').append(
        (`<div class="subtotal">Total Bonds<span class="pull-right amount">${Util.format(totalBonds.toString())}</span></div>`)
    );
    let totalNonTangibleAssets = Currency(0, Util.getCurrencyDefaults())
        .add(totalDemandDepositsAndCash)
        .add(totalEquities)
        .add(totalBonds);
    $('#bond-allocation').append($(`<div class="allocation">Percent of Non-Tangible Assets in Bonds<span class="pull-right amount">${new CashOrStockViewModel().getAllocation(totalNonTangibleAssets, totalBonds.toString()).toString()}</span></div>`));
    $('#cash-and-stocks-allocation').append($(`<div class="allocation">Percent of Non-Tangible Assets in Equities<span class="pull-right amount">
            ${new CashOrStockViewModel().getAllocation(totalNonTangibleAssets, totalEquities).toString()}</span></div>`));
    $('#cash-allocation').append($(`<div class="allocation">Percent of Non-Tangible Assets in Cash<span class="pull-right amount">
            ${new CashOrStockViewModel().getAllocation(totalNonTangibleAssets, totalDemandDepositsAndCash).toString()}</span></div>`));
    $('#total-tangible-assets').text(Util.format(totalPropertyPlantAndEquipment));
    $('#total-non-tangible-assets').text(Util.format(totalNonTangibleAssets.toString()));
    $('#total-debt').text(`(${Util.format(debtTotal)})`);
    let net = Currency(0, Util.getCurrencyDefaults())
        .subtract(debtTotal)
        .add(totalPropertyPlantAndEquipment)
        .add(totalNonTangibleAssets);
    $('#net-total').text(Util.format(net.toString()));
    setupToggle('#tree-view-loans','#loans-container');
    setupToggle('#tree-view-cash', '#cash-container');
    setupToggle('#tree-view-property-pant-and-equipment', '#property-plant-and-equipment-container');
    setupToggle('#tree-view-cash-or-stock','#assets-container');
    setupToggle('#tree-view-bonds','#bond-container');
    setupToggle('#tree-view-totals-row','#totals-row');
    if (budget.licenseAgreement && budget.licenseAgreement.agreedToLicense) {
        $('#acceptLicense').prop('checked', true);
        $('#acceptLicense').prop('disabled', true);
        $('.licenseAgreementDetails').append(`agreed to license on ${budget.licenseAgreement.agreementDateUtc} from IP ${budget.licenseAgreement.ipAddress}`);
    }
};