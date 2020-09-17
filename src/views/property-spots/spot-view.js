import CustomerDescription from '../../customer-description';

export default class SpotView {
    static getSpotView(spot, reservedByVendor) {
        let spotDescription = spot.name;
        if (reservedByVendor) {
            spotDescription += ` - <a href="/pages/property-customer-edit.html?id=${reservedByVendor.id}">
                                       ${CustomerDescription.getCustomerDescription(reservedByVendor)}
                                   </a>`;
        }
        return `                
                <div class="spot-cell ${reservedByVendor ? 'spot-reserved' : 'spot-open'}">
                    <div class="spot-cell-inner ${!spot.section ? -1 : spot.section.name.toLowerCase().indexOf('field') > -1 ? 'field' : ''}">
                        ${spotDescription}
                    </div>
                    <input type="button" class="btn btn-default spot-edit-btn" value="Edit" />
                    <form class="p-15 form hide">
                        <div class="form-group row">
                            <label class="col-xs-3 col-form-label col-form-label-lg">Bottom</label>
                            <div class="col-xs-9">
                                <select class="form-control spot-bottom"></select>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-xs-3 col-form-label col-form-label-lg">Right</label>
                            <div class="col-xs-9">
                                <select class="form-control spot-right"></select>
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
