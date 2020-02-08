const BondViewModel = require('./bond-view-model');
const cal = require('../../calculators/calendar');
import CashViewModel from './cash-view-model';
const Currency = require('currency.js');
import EquityViewModel from './equity-view-model';
import PropertyPlantAndEquipmentViewModel from './property-plant-and-equipment-view-model';
import LoanViewModel from './loan-view-model';
const Util = require('../../util');
const Moment = require('moment');
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
                    Failed to get accounts from ${budget.failed.length} financial institutions. Check console for more details.
                </p>
            </div>`);
        console.log('Failed to get accounts from the following financial institutions: ' + JSON.stringify(budget.failed, 0, 4));
    }
    $('#balance-input-group').empty();
    $('.cash-header-container').append(new CashViewModel().getReadOnlyHeaderView());
    $('.assets-header-container').append(new EquityViewModel().getReadOnlyHeaderView());
    $('.property-plant-and-equipment-header-container').append(new PropertyPlantAndEquipmentViewModel().getReadOnlyHeaderView());
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
        let view = new CashViewModel().getReadOnlyView(cashAccount, obfuscate, budget.pending);
        $('#cash-input-group').append(view);
    }
    for (let tangibleAsset of (budget.assets || []).filter(x => (x.type || '').toLowerCase() === 'property-plant-and-equipment')) {
        totalPropertyPlantAndEquipment = totalPropertyPlantAndEquipment.add(tangibleAsset.amount);
        $('#property-plant-and-equipment-input-group').append(new PropertyPlantAndEquipmentViewModel().getReadOnlyView(
            tangibleAsset, obfuscate));
    }
    for (let equity of (budget.assets || []).filter(x => x.shares && x.sharePrice)) {
        totalEquities = totalEquities.add(Util.getAmount(equity));
    }
    for (let equity of (budget.assets || []).filter(x => x.shares && x.sharePrice)) {
        let view = new EquityViewModel().getReadOnlyView(equity, totalEquities.toString(), obfuscate);
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
    $('#property-plant-and-equipment-total-amount').text(Util.format(totalPropertyPlantAndEquipment.toString()));
    $('#cash-total-amount').text(Util.format(totalDemandDepositsAndCash.toString()));
    $('#cash-and-stocks-total-amount').text(Util.format(totalEquities.toString()));

    $('#bond-total-amount').text(Util.format(totalBonds.toString()));
    let totalNonTangibleAssets = Currency(0, Util.getCurrencyDefaults())
        .add(totalDemandDepositsAndCash)
        .add(totalEquities)
        .add(totalBonds);
    $('#bond-allocation-content').text(new EquityViewModel().getAllocation(totalNonTangibleAssets, totalBonds.toString()).toString());
    $('#cash-and-stocks-allocation').text(new EquityViewModel().getAllocation(totalNonTangibleAssets, totalEquities).toString());
    $('#cash-allocation').text(new EquityViewModel().getAllocation(totalNonTangibleAssets, totalDemandDepositsAndCash).toString());
    $('#total-tangible-assets').text(Util.format(totalPropertyPlantAndEquipment));
    $('#total-non-tangible-assets').text(Util.format(totalNonTangibleAssets.toString()));
    $('#total-debt').text(`(${Util.format(debtTotal)})`);
    let net = Currency(0, Util.getCurrencyDefaults())
        .subtract(debtTotal)
        .add(totalPropertyPlantAndEquipment)
        .add(totalNonTangibleAssets);
    $('#net-total').text(Util.format(net.toString()));
};