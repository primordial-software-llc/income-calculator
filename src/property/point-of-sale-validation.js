export default class PointOfSaleValidation {
    getValidation(receipt) {
        let validationMessages = [];
        if (receipt.customer.name.length < 1) {
            $("#sale-vendor").addClass('required-field-validation');
            validationMessages.push('Vendor is required.');
        }
        if (receipt.makeCardPayment) {
            if (receipt.thisPayment.length < 1) {
                $('#sale-payment').addClass('required-field-validation');
                validationMessages.push(`Payment is required.`);
            }
            if (receipt.cardPayment.cardNumber.length < 1) {
                $('#card-number').addClass('required-field-validation');
                validationMessages.push(`Credit card number is required.`);
            }
            if (receipt.cardPayment.expirationMonth.length < 1) {
                $('#expiration-month').addClass('required-field-validation');
                validationMessages.push(`Expiration month is required.`);
            }
            if (receipt.cardPayment.expirationYear.length < 1) {
                $('#expiration-year').addClass('required-field-validation');
                validationMessages.push(`Expiration year is required.`);
            }
            if (receipt.cardPayment.cvv.length < 1) {
                $('#card-cvv').addClass('required-field-validation');
                validationMessages.push(`CVV is required.`);
            }
        }
        return validationMessages;
    }
}
