import CashViewModel from'./cash-view-model';
const Moment = require('moment/moment');
const Util = require('../../util');
const TransferController = require('../../controllers/balance-sheet/transfer-controller');
function BondViewModel() {
    this.getViewDescription = () => 'Bond';
    this.getViewType = () => 'bond';
    this.getModel = function (target) {
        return {
            amount: $(target).find('input.amount').val().trim(),
            issueDate: Moment($(target).find('input.issue-date').val().trim(), 'YYYY-MM-DD UTC Z'),
            daysToMaturation: $(target).find('select.type').val().trim(),
            creditAccount: 'bond'
        };
    };
    this.getHeaderView = function () {
        return $(`<div class="row table-header-row">
              <div class="col-xs-4">Face Value</div>
              <div class="col-xs-4">Issue Date</div>
              <div class="col-xs-4">Time to Maturity</div>
          </div>`);
    };
    this.getReadOnlyView = function(bond, disable) {
        bond = bond || {};
        let maturityDateText = bond.issueDate
            ? Moment(bond.issueDate).add(bond.daysToMaturation, 'days').format('YYYY-MM-DD')
            : '';
        bond.issueDate = bond.issueDate || new Date().toISOString();
        bond.amount = bond.amount || '0.00';
        let viewContainer = $('<div></div>');
        let view = $(`<div class="bond-item transaction-input-view row">
                    <div class="col-xs-2 text-right vertical-align amount-description-column">
                        ${Util.format(bond.amount)}
                    </div>
                    <div class="col-xs-4 text-center vertical-align amount-description-column">
                        ${Moment(bond.issueDate).format('YYYY-MM-DD')}
                    </div>
                    <div class="col-xs-3 text-center">
                        ${bond.daysToMaturation/7} weeks
                    </div>
                    <div class="col-xs-2 text-center vertical-align amount-description-column">${maturityDateText}</div>
        `);
        viewContainer.append(view);
        let liquidateButton = $(`<div class="col-xs-1">
                            <button ${disable ? 'disabled="disabled"' : ''} type="button" class="btn btn-success add-remove-btn" title="Liquidate bond">
                                <span class="glyphicon glyphicon-transfer" aria-hidden="true"></span>
                            </button>
                          </div>`);
        view.append(liquidateButton);
        new TransferController().init(
            liquidateButton,
            viewContainer,
            'bond',
            [
                new CashViewModel()
            ],
            bond.id,
            bond.amount);
        return viewContainer;
    };
    this.getView = function (readOnlyAmount) {
        return $(`<div class="bond-item transaction-input-view row">
                    <div class="col-xs-4">
                        <div class="input-group">
                            <div class="input-group-addon ">$</div>
                            <input class="amount form-control text-right" type="text" placeholder="0.00" />
                        </div>
                    </div>
                    <div class="col-xs-4">
                        <input class="col-xs-3 issue-date form-control" type="text" value="${Moment(new Date().toISOString()).format('YYYY-MM-DD UTC Z')}" />
                    </div>
                    <div class="col-xs-4">
                        <select class="type form-control">
                            <option value="${7*4}">4 Weeks</option>
                            <option value="${7*8}">8 Weeks</option>
                            <option value="${7*13}">13 Weeks</option>
                            <option value="${7*26}">26 Weeks</option>
                            <option value="${7*56}">52 Weeks</option>
                        </select>
                    </div>`);
    };
}

module.exports = BondViewModel;