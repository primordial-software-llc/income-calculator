import AccountSettingsController from './account-settings-controller';
import CustomerDescription from '../customer-description';
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
import Moment from 'moment/moment';
import Util from '../util';

export default class PropertySpotsController {
    static getName() {
        return 'Spots';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-spots.html`;
    }
    static hideInNav() {
        return true;
    }
    getVendorWhoReservedSpot(spotId) {
        return this.getIndefiniteSpotReservationVendor(spotId) ||
            this.getOneTimeSpotReservationVendor(spotId);
    }
    getIndefiniteSpotReservationVendor(spotId) {
        return this.customers
            .find(vendor =>
                vendor.spots &&
                vendor.spots.find(spot => spot.id === spotId));
    }
    getOneTimeSpotReservationVendor(spotId) {
        let oneTimeSpotReservation = this.spotReservations.find(x => x.spotId === spotId);
        if (oneTimeSpotReservation) {
            let vendor = this.customers.find(x => x.quickBooksOnlineId === oneTimeSpotReservation.quickBooksOnlineId);
            return vendor;
        }
    }
    async init(user) {
        let date = Moment();
        let diff = (7 - date.day() + 7) % 7;
        date.add(diff, 'day');
        $('#rental-date').prop('disabled', false).val(date.format('YYYY-MM-DD'));
        new AccountSettingsController().init({}, user, false);
        let dataClient = new DataClient();
        try {
            let promiseResults = await Promise.all([
                dataClient.get('point-of-sale/customer-payment-settings'),
                dataClient.get('point-of-sale/spots?cache-level=cache-everything'),
                dataClient.get(`point-of-sale/spot-reservations?rentalDate=${encodeURIComponent($('#rental-date').val())}`)
            ]);
            this.customers = promiseResults[0];
            this.spots = promiseResults[1];
            this.spotReservations = promiseResults[2];
        } catch (error) {
            Util.log(error)
            MessageViewController.setRequestErrorMessage(error);
            return;
        }

        let sectionIds = Array.from(new Set(this.spots.map(x => x.section == null ? '' : x.section.id)));
        let sections = [];
        for (let sectionId of sectionIds) {
            let spotSection = this.spots.find(x => (x.section == null ? '' : x.section.id) === sectionId);
            if (spotSection) {
                sections.push(spotSection.section);
            }
        }

        for (let section of sections) {
            let sectionId = `spot-container-${section.id}`;
            $('#spot-sections-container').append(`<div id="${sectionId}">${section.name}</div>`);
            let sectionSpots = this.spots.filter(x => (x.section == null ? '' : x.section.id) === section.id);
            for (let spot of sectionSpots) {
                let spotDescription = spot.name;
                let reservedByVendor = this.getVendorWhoReservedSpot(spot.id);
                if (reservedByVendor) {
                    spotDescription += ` - ${CustomerDescription.getCustomerDescription(reservedByVendor)}`;
                }
                $(`#${sectionId}`).append(`
                    <div class="${reservedByVendor ? 'spot-open' : 'spot-reserved'}">
                        ${spotDescription}
                    </div>`);
            }
        }

    }

}