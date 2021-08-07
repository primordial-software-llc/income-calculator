import AccountSettingsController from './account-settings-controller';
import AddSpotView from '../views/add-spot-view';
import CustomerDescription from '../customer-description';
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
import Navigation from '../nav';
import PropertyCustomersController from './property-customers-controller';
const Util = require('../util');
export default class PropertyCustomerEditController {
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
        let description = '';
        if (spot.section) {
            description += spot.section.name + ' - ';
        }
        description += spot.name;
        return description;
    }
    getSpot(spotDescription) {
        return this.spots.find(x => this.getSpotDescription(x).toLowerCase() === spotDescription.toLowerCase());
    }
    getCancelledReservations() {
        let cancelledReservations = [];
        for (let reservation of this.spotReservations) {
            let reservationExists = $(`[data-reservation-date='${reservation.rentalDate}'][data-reservation-spot-id='${reservation.spotId}']`).length > 0;
            if (!reservationExists) {
                cancelledReservations.push(reservation);
            }
        }
        return cancelledReservations;
    }
    async init(user) {
        $('.property-navigation').append(Navigation.getPropertyNav(user, PropertyCustomersController.getUrl()));
        let self = this;
        new AccountSettingsController().init({}, user, false);
        let dataClient = new DataClient();
        let customerPromise = dataClient.get(`point-of-sale/customer-payment-settings-by-id?id=${Util.getParameterByName("id")}`);
        let rentalSectionPromise = dataClient.get('point-of-sale/spots'); //?cache-level=cache-everything');
        let vendorPromise = dataClient.get(`point-of-sale/spot-reservations?vendorId=${Util.getParameterByName("id")}`);
        let promiseResults;
        try {
            promiseResults = await Promise.all([customerPromise, rentalSectionPromise, vendorPromise]);
        } catch (error) {
            Util.log(error);
            MessageViewController.setRequestErrorMessage(error);
        }
        let customer = promiseResults[0];
        this.spots = promiseResults[1].filter(x => !x.restricted);
        this.spotReservations = promiseResults[2];
        for (let spot of this.spots) {
            $('#spot-list').append(`<option>${self.getSpotDescription(spot)}</option>`);
        }
        $('#customer-vendor').text(CustomerDescription.getCustomerDescription(customer));
        $('#payment-frequency').val(customer.paymentFrequency);
        $('#rental-amount').val(customer.rentPrice);
        $('#memo').text(customer.memo);
        for (let reservation of this.spotReservations) {
            let reservationView = $(`<div data-reservation-spot-id="${reservation.spotId}" data-reservation-date="${reservation.rentalDate}" class="row reservation-row display-flex"></div>`);
            let spot = this.spots.find(x => x.id === reservation.spotId);
            let descriptionView = $('<div class="col-xs-7 display-flex-valign-center"></div>');
            descriptionView.text(`${reservation.rentalDate} - ${self.getSpotDescription(spot)}`);
            reservationView.append(descriptionView);
            let deleteBtn = $(`<div class="col-xs-5 display-flex-valign-center">
                    <input type="button" class="remove-one-time-spot-reservation-btn btn btn-warning" value="Cancel Reservation" />
                </div>`);
            reservationView.append(deleteBtn);
            deleteBtn.find('.btn').click(function () {
                reservationView.remove();
            });
            $('#one-time-reservations-container').append(reservationView);
        }
        for (let spot of customer.spots || []) {
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
            let updates = { id: customer.id, spots: spots };
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
                let dataClient = new DataClient();
                let savePromises = [dataClient.patch(`point-of-sale/vendor`, updates)];
                let cancelledReservations = self.getCancelledReservations();
                for (let cancelledReservation of cancelledReservations) {
                    savePromises.push(dataClient.delete('point-of-sale/spot-reservation', cancelledReservation));
                }
                let saveResults = await Promise.all(savePromises);
                MessageViewController.setMessage('Vendor saved', 'alert-success');
            } catch (error) {
                Util.log(error);
                MessageViewController.setRequestErrorMessage(error);
            }
        });
    }
}