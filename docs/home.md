# Home
Set a budget, stick to it and watch your wealth grow.

## About
The net income calculator allows you to define your income, set a budget and monitor all of your finances in one place.

### Budget
The budget feature allows you to define monthly, weekly and bi weekly income and expenses. You have the ability to specify the account the income will be deposited into or expenses will be withdrawn from to serve as a reminder for you.

[Picture of Budget Page]

### Calendar
The calendar gives you a monthly summary of your income and expenses broken down by income/expense account and presents them visually for you on a calendar so you know exactly which bills are due when and remind you when payments are do to you from others.

[Picture of calendar page]

### Balance Sheet
#### Tracks
- Loans
- Credit cards
- Equities: Public and private
- Bank deposits
- US Treasury bonds
- Tangible property

### Bank Integration
Automatically provides real-time credit card and bank deposit data for the Balance Sheet. Supports 9,600 financial institutions. We use Plaid to connect to your bank allowing us to access most banks large and small. Contact us or test which banks are supported yourself using the plaid demo https://plaid.com/demo/?countryCode=US&language=en&product=transactions.
### Transactions
View all your checking, debit card and credit card transactions in one place to quickly check for unexpected transactions each day to report fraud quickly

## Pricing
### Free
- Salary Income
- Budget
- Calendar with budget and income

### $5.00 USD per month - Wealth Management Features
 - Balance sheet
 - Bank integration
 - ~~Transactions~~ (Not yet true, but will be by January 1st 2020)
 
## Signup
Create an account [here](https://www.primordial-software.com/pages/login-signup.html) to gain instant access to the monthly budget and calendar features.

When you are ready to upgrade to gain full access, for the price of $5.00 USD a month with your first month free and the ability to cancel anytime, contact us at support@primordial-software.com.

## Data
You’re data will never be sold to third parties and can be downloaded at anytime in JSON format.

[Include picture pointing out where download button is]

## Privacy and Security

Your bank data will never be viewed by anyone except for yourself. Here are the steps we take to guard your bank data.

- All connections are SSL encrypted with a certificate from a well known certificate authority (Amazon Web Services) from your computer to our servers
- Authentication uses [Amazon Web Services Cognito](https://aws.amazon.com/cognito/) with multi-factor authentication
- Bank data is transiently delivered and never stored on our servers. The only data related to your bank held on our servers is an access token to connect to your bank which you can delete at anytime and permanently delete from our servers
- Our software never has direct access to your bank login username and password. The bank integration is built with Plaid to ensure your bank's username and password are only seen by our trusted third party [Plaid](https://plaid.com/company/)

### Data Storage
Your data is held in 2 places
1. The data you entered when creating an account is held in plain-text with no encryption.
2. Budget, manually entered financial data and bank access tokens are held in Amazon's Dynamo DB and encrypted at rest with Amazon's Key Management Service (KMS)