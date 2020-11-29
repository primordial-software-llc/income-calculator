export default class AssetViewModel {
    getModel(target) {
        return {
            amount: $(target).find('input.amount').val().trim(),
            name: $(target).find('input.name').val().trim()
        };
    };
    getHeaderView() {
        return $(`<div class="row table-header-row">
               <div class="col-xs-9">Name</div>
               <div class="col-xs-3">Value</div>
           </div>`);
    }
    getReadOnlyHeaderView() {
        return $(`<div class="row table-header-row color-imago-cream">
               <div class="col-xs-8">Name</div>
               <div class="col-xs-3">Value</div>
               <div class="col-xs-1">Liquidate</div>
           </div>`);
    }
    getContainer(assetType) {
        return `<div class="row group-row">
          <div class="col-xs-11">
              <h4>${assetType.getViewDescription()}</h4>
          </div>
      </div>
      <div id="${assetType.getViewType()}-container">
          <div class="${assetType.getViewType()}-header-container"></div>
          <div id="${assetType.getViewType()}-input-group" class="form-group"></div>
      </div>`;
    }
}