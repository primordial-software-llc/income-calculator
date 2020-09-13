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
        let ct = 1;
        do {
            row.push(currentSpot);
            currentSpot = spots.find(x => x.id === currentSpot.right);
            ct += 1;
            if (ct > 1000) {
                break; // Sanity check for loops, because I have no validation.
            }
        } while(currentSpot);
        return row;
    }
    getTopLeftSpotIds() {
        return [
            'ad0b0efe-52fe-43f6-b2ac-a2c2b3537440', // 79
            '50ff2d87-2a87-4934-a20b-cd4c668c85c9', // 119
            'dc30099b-e56d-4b16-b691-77c01fcb54d3', // 38
            '916250b8-505c-4fae-87a8-e119cdc46826', // 159
            'a015cb31-e6b3-449f-8be9-fd0a872cc32f', // 199
            '51e6c980-81e4-4f7a-804d-a414875a82a4', // 239
            '16916bcb-cb22-436e-9b77-86697a397a25', // Field A 8
            '5407aaae-46cd-4f69-af83-b9665b644cef', // Field B 8
            '92c4e679-ba81-4753-a5e7-a65b4909c50b', // Field C 8
            '8dc98089-a238-4f98-ace8-b8c8f20b8016', // Field D 8
            '8a1d2523-fe4c-401e-881a-d21f20cd8de7', // Field E 8
            'f898bf04-800f-4711-9b01-cac1a21144f7', // Field F 8
            'b10ccdcc-b4cb-4e36-b30d-393cc7569143', // Field G 8
            'ba8433fe-a4de-4d4e-b5f0-7fba36f1aed4', // Field H 6
            'dc14c447-3c85-49c1-9461-ad297cae527c', // Field I 11
            'ddfc99bd-cb85-498a-bdc5-e12009863c84', // Field J 11
            'bedc11c1-babb-4756-8a8f-b1842d40af71', // Field K
            'c73598a4-fd0a-42a7-a787-20d327e23b64'  // Field L 12
        ];
    }
    getSectionView(section) {
        let sectionId = `spot-container-${section.id}`;
        let sectionView = $(`<div id="${sectionId}">${section.name}</div>`);
        let sectionSpots = this.spots.filter(x => (x.section == null ? '' : x.section.id) === section.id);
        let leftSpot = sectionSpots.find(x => this.getTopLeftSpotIds().find(y => x.id === y));
        if (!leftSpot) {
            return sectionView;
        }
        let ct = 1;
        do {
            let rowOfSpots = this.getRow(leftSpot, sectionSpots);

            let rowOfSpotsContainer = $(`<div class="spot-row-container"></div>`);
            for (let spot of rowOfSpots) {
                let spotView = $(this.getSpotView(spot));
                this.initSpotView(spotView, spot, section, sectionSpots);
                rowOfSpotsContainer.append(spotView);
            }
            sectionView.append(rowOfSpotsContainer);
            leftSpot = sectionSpots.find(x => x.id === leftSpot.bottom);
            ct += 1;
            if (ct > 1000) {
                break; // Sanity check for loops.
            }
        } while (leftSpot);
        return sectionView;
    }
    initSpotView(spotView, spot, section, sectionSpots) {
        let self = this;
        spotView.find('.spot-edit-btn').click(function() {
            spotView.find('.form').removeClass('hide');
        });
        let availableBottomSpots = sectionSpots.filter(x =>
            !sectionSpots.find(y => x.id === y.bottom) &&
            !sectionSpots.find(y => x.id === y.right) &&
            !this.getTopLeftSpotIds().find(y => x.id === y)
        );
        let availableRightSpots = availableBottomSpots.slice();
        let bottomIndex = 0;
        let rightIndex = 0;
        if (spot.bottom) {
            availableBottomSpots.push(sectionSpots.find(x => x.id === spot.bottom));
            bottomIndex = availableBottomSpots.findIndex(x => x.id == spot.bottom) + 1;
        }
        if (spot.right) {
            availableRightSpots.push(sectionSpots.find(x => x.id === spot.right));
            rightIndex = availableRightSpots.findIndex(x => x.id == spot.right) + 1;
        }
        spotView.find('.spot-cancel').click(function() {
            spotView.find('.spot-bottom').prop('selectedIndex', bottomIndex);
            spotView.find('.spot-right').prop('selectedIndex', rightIndex);
            spotView.find('.form').addClass('hide');
        });
        spotView.find('.spot-save').click(async function() {
            let dataClient = new DataClient();
            let patch = {
                id: spot.id,
                bottom: spotView.find('.spot-bottom').val(),
                right: spotView.find('.spot-right').val()
            };
            let updatedSpot = await dataClient.patch('point-of-sale/spot', patch);
            let spotIndex = self.spots.findIndex(x => x.id === updatedSpot.id);
            self.spots[spotIndex] = updatedSpot;
            spotView.find('.form').addClass('hide');
            $('#section-list').trigger('change');
        });
        spotView.find('.spot-bottom').append(`<option value="">Select a Spot</option>`);
        spotView.find('.spot-right').append(`<option value="">Select a Spot</option>`);

        for (let spot of availableBottomSpots) {
            spotView.find('.spot-bottom').append(`<option value="${spot.id}">${section.name} - ${spot.name}</option>`);
        }
        for (let spot of availableRightSpots) {
            spotView.find('.spot-right').append(`<option value="${spot.id}">${section.name} - ${spot.name}</option>`);
        }
        spotView.find('.spot-bottom').prop('selectedIndex', bottomIndex);
        spotView.find('.spot-right').prop('selectedIndex', rightIndex);
    }
    getSpotView(spot) {
        let spotDescription = spot.name;
        let reservedByVendor = this.getVendorWhoReservedSpot(spot.id);
        if (reservedByVendor) {
            spotDescription += ` - <a href="/pages/property-customer-edit.html?id=${reservedByVendor.id}">
                                       ${CustomerDescription.getCustomerDescription(reservedByVendor)}
                                   </a>`;
        }
        return `                
                <div class="spot-cell ${reservedByVendor ? 'spot-reserved' : 'spot-open'}">
                    <div class="spot-cell-inner">
                        <div class="row">
                            <div class="col-xs-10">${spotDescription}</div>
                            <div class="col-xs-2">
                                <input type="button" class="btn btn-default spot-edit-btn" value="Edit" />
                            </div>
                        </div>
                    </div>
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
                dataClient.get('point-of-sale/spots'),
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