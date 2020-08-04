import DataClient from '../data-client';
exports.getModel = async function () {
    let prices = [];
    $('.prices-item').each(function () {
        prices.push({
            "name": $(this).find('input.input-name').val().trim(),
            "sharePrice": $(this).find('input.share-price').val().trim(),
        });
    });
    let dataClient = new DataClient();
    let data = await dataClient.getBudget();
    let updateModel = {
        assets: data.assets
    };
    for (let price of prices) {
        let existing = updateModel.assets.find(x =>
            (x.name || '').length > 0 &&
            x.name.toLowerCase() === price.name.toLowerCase()
        );
        if (existing) {
            existing.sharePrice = price.sharePrice;
        }
    }
    return updateModel;
};
exports.getHeaderView = () =>
    $(`<div class="row table-header-row">
              <div class="col-xs-6">Asset</div>
              <div class="col-xs-6">Price</div>
          </div>`);
exports.getView = (name, sharePrice) =>
    $(`<div>
            <div class="prices-item row transaction-input-view">
                <div class="col-xs-6"><input disabled="disabled" class="input-name name form-control" type="text" value="${name || ''}" /></div>
                <div class="col-xs-6">
                    <div class="input-group">
                        <div class="input-group-addon ">$</div>
                        <input class="share-price form-control text-right" type="text" value="${sharePrice || ''}"
                            placeholder="0.00" />
                    </div>
                </div>
              </div>
          </div>`);