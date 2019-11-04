# Income Calculator

## About

### What This Application Is Not

- **Accounting or Tax software:** This software doesn't attempt to create a history of transactions and can't predict tax payments
- **Authoritative pay history or projection:** If you want to see what your pay is, look at your pay stub or employer agreement
- **Authoritative bill history:** If you want to see what your expenses are, ask your vendor for an invoice
- **Authoritative bill payment history:** If you want to know if a bill has been paid ask your vendor or bank
- **Authoritative loan amortization:** If you want to see the payoff date and total interest for a loan, look at the loan amortization break-down provided by your bank

### What This Application Is

This tool is meant to give you the current state of your income and expenses and help you plan to manage your future income and expenses.

This tool helps you know where to focus and when so you can prioritize your time between setting up a budget,
sticking to a budget, saving, investing or enjoying your deferred wealth. This tool does provide non-authoritative projections
to guide you to look at what your potential future income and expenses are; however, **any future projections are only estimates**.

## Budget

![Budget](https://timg456789.github.io/income-calculator/docs/sample-budget.png)

Budget Settings

![Settings](https://timg456789.github.io/income-calculator/docs/sample-budget-settings.png)

Budget Breakdown
![Detail](https://timg456789.github.io/income-calculator/docs/sample-budget-breakdown.png)

Responsible for projecting net income with the following transaction types:

 1. Biweekly income
 2. Weekly recurring expenses
 3. Monthly recurring expenses
 4. One-time expenses
 
A budget is used to project a detailed breakdown of:

 - name
 - amount
 - type: income or expense
 - date
 
In only **three minutes** one can enter their sources of income and expected expenses and view the transactions on a calendar. The calendar provides both weekly and monthly summaries of net income.

Weekly totals only take into account the days in the week for the month being considered. For example if a week spans across september and october, portions of the week's transactions will be in september and portions of the week's transactions will be in october. No transaction in the week will overlap and be repeated in both september and october. This methodology supports transparent monthly totals.

## Getting Started

A test bucket is provided. It provides general security if you make the budget name a long random number. For optimal security follow the steps below and save the files to your personal s3 bucket.

### 1. Setup API User
Within [AWS](https://console.aws.amazon.com/console/home), create a new IAM user. Then create a new access key for the user. Save the access key id and secret access key for later.

### 2. Setup s3 Bucket
Create a new s3 bucket. Grant the API user create and update privileges to the new bucket. **Leave this bucket for the application. Make backups of the JSON for important budgets.** The application may destroy your budget during storage and/or processing. Existing budgets may no longer load as the application evolves.

### 3. Setup Budget
[https://timg456789.github.io/income-calculator/index.html](https://timg456789.github.io/income-calculator/index.html)

1. Open the link above, then click the gear icon.
2. You shall be presented with an Account Settings dialog. In the dialog enter your new AWS credentials: bucket, secret access key id and access key id. You may leave the budget name empty. The budget name may be used to load an existing budget once one has been created. 
3. Click save and close. You should now see an Access Denied message at the bottom of the screen if the bucket name was left empty.
4. Enter your bi-weekly income.
5. Use the link above the calendar to navigate back to the saved budget.
6. Use the + icons to add expenses.
7. Add a weekly and monthly expense.
8. Then add a loan for each weekly and monthly expense with names matching the weekly and monthly expense names
9. Click save and view payment schedule.
10. Click the link above the calendar.
11. The weekly and monthly loans' payment information will now be populated in the Loans section.

## Fields

All amounts are in dollars.

### Biweekly Income

### Monthly Expenses

### Weekly Expenses

### One Time Transactions

May be positive or negative. Negative values aren't being saved, but they should be.

"on" refers to the date of the transaction and must occur at midnight UTC. The calendar is intended to function as if the browser's time zone were removed. Transaction dates must be in the following format: 2017-02-21T00:00:00.000Z

### Loans

An 18% APR loan paid weekly with a balance of $500 in the last week of December 2016 assuming 4.348125 weeks per month will have the first week's payment shown below.

    $500 at 18% interest = $90 interest per year
    $90 interest over 12 months = $7.50 interest per month
    $7.50 interest over 4 weeks (4.348125) = $1.72488141 per week
    
#### Example

Something seems off, here's why. Let's say you have a balance of 1573 @ .2013 APR. That means the next months interest is: 1573 * (.2013/12) or about $26. Right now the loan calculator shows this as a total interest for the lifetime of the loan at $125 per week at only $43. So even though I think I have it in tests, I want to lay out my next test even though I'm pretty sure I've done this before after noticing the discrepancy and large loans appear correct.

APR                 = .2013
Monthly Interest    = .2013/12 = 0.016775
Monthly Payment     = 500

(This is even optimistic since it's 4 weeks per month and the docs say paying weekly as the scenario.)

Balance     Interest    Interest Balance    Post Payment Balance
1573        $26         $1599               $1099
1099        $19         $1118               $688
688         $12         $700                $200
200         $4          $204                $0

Total Interest = $61

^^^ Is ridiculously high, because the scenario is weekly payments. You would be dumb if you could pay off a loan less frequently than monthly payments, if you are accruing income more frequently than monthly. How dumb, well maybe I could show that with some more work. So you have a few extra payments and less compound interest and I've been rounding up on the interest rates. It actually still is off enough to show more information, because the calculator says this is only $43 in interest. Is is it wrong?

I don't know, but I have another test case. Also the calculator has payoff date of 3 months so it shows that's correct, but as you can see the last payment has a far lower balance than the payment so interest isn't enough there.

Ahh, this is actually going to get rather complex. The UI has some logic that desperately needs to get pulled out I think. That week month is a problem. And nothing in this core library has anything about. Here's what I'll do is duplicate the functionality, but I'll have it for proper monthly than have a fun time merging and restoring the tests. Yuck!




Fields

$: Amount in dollars

name: May be used to associate to one expense. The expense may either be weekly or monthly.

rate: Yearly APR. For example 11% percent would be entered as .11

payment: The amount to be paid towards the loan per **week**. Determined by a matching weekly or monthly expense by name.

payoff: The estimated payoff date of the loan. The date is formatted in year/month/date

interest: The estimated total interest to be paid until the payoff date.

### Actual Expenses 
I've abandoned the actual expenses. This was intended to track spending against a budget in order to stay within a budget. I am considering its removal. Between it's complexity and difficulty to use I think it's excessive.  I'm looking into better indicators of whether a budget is being adhered to e.g. whether a savings account is at its projected amount.

## Unsupported Expense Schedules

### Greater Than One Month
Expense schedules that are over a month are best handled by breaking down the expense to a month or as a one-time expense. For example vehicle registration is done once per year, this should be listed as a one-time expense per year. Oil changes can vary and can be broken down either by week or by month. For example if an oil change is needed once every two months and costs $90, budget $45 per month. Handling expenses this way reinforces good saving habits by avoiding incurring the full cost all at once.

## Glossary

### Annual Percentage Rate (APR)
The APR represents the amount of interest accrued on a yearly period. An APR may be converted to be used in other periods by simply dividing **down to a montly period**. After a monthhly period e.g. weekly or daily interest is generally not accrued and based upon a monthly period then the number of weeks or days in that period.

### Biweekly Income
Income accrued on a 14 day interval determined by an initial start date. Biweekly income is detailed in docs/README.md under the **Income - Accruals** section.

### Day
More formally known as a `UTC day` is a constant 86,400 seconds or 86,400,000 milliseconds.

### Monthly Recurring Expense (MRE)
An expense that is incurred every calendar month on a specific day. MRE's are incurred on the 28th by default.

### Net Income
Income after expenses.

### Transaction
The action of incurring an expense or accruing income.

### Weekly Recurring Expense (WRE)
An expense that is incurred every seven days. WRE's are incurred on Friday's by default.
