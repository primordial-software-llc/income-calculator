import AccountSettingsController from './account-settings-controller';
import AddSpotView from '../views/add-spot-view';
import CustomerDescription from '../customer-description';
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
const Util = require('../util');
export default class PropertyCustomersController {
    static getName() {
        return 'Customer Edit';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-customer-edit.html`;
    }
    static hideInNav() {
        return true;
    }
    getSpotDescription(spot) {
        return `${spot.section.name} - ${spot.name}`;
    }
    getSpot(spotDescription) {
        return this.spots.find(x => this.getSpotDescription(x).toLowerCase() === spotDescription.toLowerCase());
    }
    async init(user) {
        let self = this;
        new AccountSettingsController().init({}, user, false);
        let dataClient = new DataClient();
        let customerPromise = dataClient.get(`point-of-sale/customer-payment-settings-by-id?id=${Util.getParameterByName("id")}`);
        let rentalSectionPromise = dataClient.get('point-of-sale/spots?cache-level=cache-everything');
        let promiseResults = await Promise.all([customerPromise, rentalSectionPromise]);
        let customer = promiseResults[0];
        this.spots = promiseResults[1];
        for (let spot of this.spots) {
            $('#spot-list').append(`<option>${self.getSpotDescription(spot)}</option>`);
        }
        $('#customer-vendor').text(CustomerDescription.getCustomerDescription(customer));
        $('#payment-frequency').val(customer.paymentFrequency);
        $('#rental-amount').val(customer.rentPrice);
        $('#memo').text(customer.memo);
        for (let spot of customer.spots) {
            let id = Util.guid();
            $('#spot-container').append(AddSpotView.GetAddSpotView(id, true));
            $(`#${id} .spot-input`).val(self.getSpotDescription(spot));
            $(`#${id} .remove-spot-btn`).click(function() {
                $(`#${id}`).remove();
            });
        }
        $('#add-new-spot').click(function() {
            let id = Util.guid();
            $('#spot-container').append(AddSpotView.GetAddSpotView(id, true));
            $(`#${id} .remove-spot-btn`).click(function() {
                $(`#${id}`).remove();
            });
        });
        $('#vendor-save').click(async function () {
            MessageViewController.setMessage('');
            let validationMessages = [];
            let spots = [];
            for (let spotTextInput of $('.spot-input').toArray()) {
                $(spotTextInput).removeClass('required-field-validation');
                let spotDescription = $(spotTextInput).val().trim();
                if (spotDescription.length === 0) {
                    continue;
                }
                let spot = self.getSpot(spotDescription);
                if (!spot) {
                    $(spotTextInput).addClass('required-field-validation');
                    validationMessages.push(`${spotDescription} is not a valid spot`);
                } else {
                    spots.push(spot);
                }
            }
            if (validationMessages.length > 0) {
                MessageViewController.setMessage(validationMessages, 'alert-danger');
                return;
            }
            let updates = {
                id: customer.id,
                spots: spots
            };
            let newPaymentFrequency = $('#payment-frequency').val().trim();
            if (customer.paymentFrequency !== newPaymentFrequency) {
                updates.paymentFrequency = newPaymentFrequency;
            }
            let newRentalAmount = $('#rental-amount').val().trim();
            if (customer.rentPrice !== newRentalAmount) {
                if (newRentalAmount !== Util.cleanseNumericString(newRentalAmount)) {
                    MessageViewController.setMessage('Rental amount isn\'t a valid amount', 'alert-danger');
                    return;
                }
                updates.rentPrice = parseFloat(newRentalAmount);
            }
            let newMemo = $('#memo').val().trim();
            if (customer.memo !== newMemo) {
                if (newMemo && newMemo.length > 4000) {
                    MessageViewController.setMessage('Memo can\'t exceed 4,000 characters', 'alert-danger');
                    return;
                }
                updates.memo = newMemo;
            }
            try {
                await new DataClient().patch(`point-of-sale/vendor`, updates);
                MessageViewController.setMessage('Vendor saved', 'alert-success');
            } catch (error) {
                Util.log(error);
                MessageViewController.setMessage(JSON.stringify(error, 0, 4), 'alert-danger');
            }
        });
    }
}