const Util = require('../../util');
function PropertyPlantAndEquipmentViewModel() {
    this.getViewDescription = function() {
        return 'Property plant and equipment';
    };
    this.getViewType = function() {
        return 'property-plant-and-equipment';
    };
    this.getModel = function (target) {
        return {
            amount: $(target).find('input.amount').val().trim(),
            name: $(target).find('input.name').val().trim()
        };
    };
    this.getHeaderView = function () {
        return $(`<div class="row table-header-row">
              <div class="col-xs-9">Name</div>
              <div class="col-xs-3">Value</div>
          </div>`);
    };
    this.getReadOnlyView = function (amount, name) {
        let view = $(`
            <div class="dotted-underline-row row transaction-input-view">
                    <div class="col-xs-9 vertical-align amount-description-column">
                        <div class="dotted-underline">${name}</div></div>
                    <div class="col-xs-3 text-right vertical-align amount-description-column">
                        <div class="dotted-underline">${Util.format(amount)}</div>
                    </div>
            </div>
        `);
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        return viewContainer;
    };
    this.getView = function () {
        let view = $(`<div class="asset-item row transaction-input-view">
                    <div class="col-xs-9">
                        <input class="name form-control text-right" type="text" />
                    </div>
                    <div class="col-xs-3">
                        <div class="input-group">
                            <div class="input-group-addon ">$</div>
                            <input class="amount form-control text-right" type="text" placeholder="0.00"/>
                        </div>
                    </div>
                  </div>
        `);
        let viewContainer = $('<div></div>');
        viewContainer.append(view);
        return viewContainer;
    };
}
module.exports = PropertyPlantAndEquipmentViewModel;
