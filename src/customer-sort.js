import CustomerDescription from './customer-description';
export default class CustomerSort {
    static sort(a, b) {
        let paymentFrequencyA = (a.paymentFrequency || '').toUpperCase();
        let paymentFrequencyB = (b.paymentFrequency || '').toUpperCase();
        if (paymentFrequencyA < paymentFrequencyB) {
            return -1;
        } else if (paymentFrequencyA > paymentFrequencyB) {
            return 1;
        }

        let descriptionA = CustomerDescription.getCustomerDescription(a).toUpperCase();
        let descriptionB = CustomerDescription.getCustomerDescription(b).toUpperCase();
        if (descriptionA < descriptionB) {
            return -1;
        } else if (descriptionA > descriptionB) {
            return 1;
        }

        return 0; // Equal
    }
}