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
    getRow(firstSpot, spots) {
        let row = [];
        if (!firstSpot) {
            return row;
        }
        let currentSpot = firstSpot;
        do {
            row.push(currentSpot);
            currentSpot = spots.find(x => x.id === currentSpot.right);
        } while(currentSpot);
        return row;
    }
    getSectionView(section) {
        let sectionId = `spot-container-${section.id}`;
        let sectionView = $(`<div id="${sectionId}">${section.name}</div>`);
        let sectionSpots = this.spots.filter(x => (x.section == null ? '' : x.section.id) === section.id);

        let leftSpot = sectionSpots.find(x =>
            x.name === '79' ||
            x.name === '37' ||
            x.name === '119');
        if (!leftSpot) {
            return sectionView;
        }
        do {
            let rowOfSpots = this.getRow(leftSpot, sectionSpots);

            let rowOfSpotsContainer = $(`<div class="spot-row-container"></div>`);
            for (let spot of rowOfSpots) {
                rowOfSpotsContainer.append(this.getSpotView(spot));
            }
            sectionView.append(rowOfSpotsContainer);

            leftSpot = sectionSpots.find(x => x.id === leftSpot.bottom);
        } while (leftSpot);
        return sectionView;
    }
    getSpotView(spot) {
        let spotDescription = spot.name;
        let reservedByVendor = this.getVendorWhoReservedSpot(spot.id);
        if (reservedByVendor) {
            spotDescription += ` - ${CustomerDescription.getCustomerDescription(reservedByVendor)}`;
        }
        // spot-edit-btn
        return `                
                <div class="spot-cell">
                    <div class="${reservedByVendor ? 'spot-reserved' : 'spot-open'}">
                        <div>
                            ${spotDescription}
                            <input type="button" class="btn btn-primary spot-edit-btn" value="Edit" />
                        </div>
                    </div>
                    <div>
                    <form id="input-form" class="p-15 form">
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
                    </form>

                        
                        
                        
                    </div>
                </div>`;
    }
    async init(user) {
        let self = this;
        let date = Moment();
        let diff = (7 - date.day() + 7) % 7;
        date.add(diff, 'day');
        $('#rental-date').prop('disabled', false).val(date.format('YYYY-MM-DD'));
        new AccountSettingsController().init({}, user, false);
        let dataClient = new DataClient();
        try {
            let promiseResults = await Promise.all([
                dataClient.get('point-of-sale/customer-payment-settings'),
                dataClient.get('point-of-sale/spots'),//?cache-level=cache-everything'),
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
                $('#section-list').append(`
                    <option data-section-id="${spotSection.section.id}">
                        ${spotSection.section.name}
                    </option>`);
            }
        }
        $('#section-list').change(function () {
            let sectionId = $("option:selected", this).data('section-id');
            let section = sections.find(x => x.id === sectionId);
            $('#spot-sections-container').empty();
            $('#spot-sections-container').append(self.getSectionView(section));
        });
        $('#section-list').trigger('change');
    }
}