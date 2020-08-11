export default class AddSpotView {
    static GetAddSpotView(id, additionalSpot) {
        return `
            <div id="${id}" class="row ${additionalSpot ? 'additional-spot' : ''}">
                <div class="col-xs-${additionalSpot ? '9' : '12'}">
                    <input class="form-control spot-input" list="spot-list" />
                </div>
                ${additionalSpot ?
                `<div class="col-xs-3">
                    <input type="button" class="remove-spot-btn btn btn-warning" value="Remove Spot" />
                </div>` : ''}
            </div>`;
    }
}