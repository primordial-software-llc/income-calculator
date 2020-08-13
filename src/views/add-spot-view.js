export default class AddSpotView {
    static GetAddSpotView(id, additionalSpot, readOnly, spotDescription) {
        return `
            <div id="${id}" class="row spot-row">
                <div class="col-xs-${additionalSpot ? '9' : '12'}">
                    <input
                        type="text" value="${spotDescription || ''}"
                        class="spot-text form-control ${readOnly ? '' : 'spot-input' }"
                        list="spot-list"
                        ${readOnly ? `disabled="disabled"` : ''} />
                </div>
                ${additionalSpot ?
                `<div class="col-xs-3">
                    <input type="button" class="remove-spot-btn btn btn-warning" value="Remove Spot" />
                </div>` : ''}
            </div>`;
    }
}