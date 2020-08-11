export default class CustomerDescription {
    static getCustomerDescription(customer) {
        let description = customer.displayName;
        let fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        if (fullName && fullName.toLowerCase() !== customer.displayName.toLowerCase()) {
            description += ' : ' + fullName;
        }
        return description;
    }
}