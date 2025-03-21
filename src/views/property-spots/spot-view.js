export default class SpotView {
    static getSpotView(spot, reservedByVendor, showBalances) {
        let spotDescription = spot.name || '';
        let css = 'spot-cell-inner spot-description-text';
        if (reservedByVendor) {
            spotDescription += ` - <a class="spot-vendor-link" href="/pages/property-customer-edit.html?id=${reservedByVendor.id}">
                                   </a>`;
        }
        return `                
                <div class="spot-cell
                        ${spot.restricted ? 'spot-restricted' : reservedByVendor ? 'spot-reserved' : 'spot-open'}
                        ${showBalances && reservedByVendor && reservedByVendor.balance > 1 ? 'spot-with-balance' : ''}"
                    data-spot-id="${spot.id}">
                    <div class="${css}">
                        ${spotDescription}
                        <div class="spot-vendor-details"></div>
                    </div>
                    <input type="button" class="btn btn-default spot-edit-btn" value="Edit" />
                    <form class="p-15 form hide">
                        <div class="form-group row">
                            <label class="col-xs-3 col-form-label col-form-label-lg">Name</label>
                            <div class="col-xs-9">
                                <input type="text" class="form-control spot-edit-name" />
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-xs-3 col-form-label col-form-label-lg">Right</label>
                            <div class="col-xs-9">
                                <select class="form-control spot-right"></select>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-xs-3 col-form-label col-form-label-lg">Bottom</label>
                            <div class="col-xs-9">
                                <select class="form-control spot-bottom"></select>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-xs-3 col-form-label col-form-label-lg">Height in Feet</label>
                            <div class="col-xs-9">
                                <input type="number" class="form-control spot-edit-height" />
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-xs-3 col-form-label col-form-label-lg">Restricted</label>
                            <div class="col-xs-9">
                                <input type="checkbox" class="form-control-checkbox spot-restricted-input">
                            </div>
                        </div>
                        <div class="form-group">
                            <input type="button" class="btn btn-default spot-cancel" value="Cancel" />
                            <input type="button" class="btn btn-primary spot-save" value="Save" />
                        </div>
                    </form>
                </div>`;
    }

}
