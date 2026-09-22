package com.bank;

/**
 * SavingsAccount demonstrating Inheritance and Polymorphism.
 * Enforces a Minimum Balance requirement (₹1,000) and provides 4% annual interest.
 */
public class SavingsAccount extends BankAccount {
    public static final double MINIMUM_BALANCE = 1000.0;
    public static final double ANNUAL_INTEREST_RATE = 4.0;
    public static final double DEFAULT_DAILY_LIMIT = 50000.0;

    public SavingsAccount(String accountNumber, Customer customer, double initialDeposit) {
        super(accountNumber, customer, initialDeposit, DEFAULT_DAILY_LIMIT);
        if (initialDeposit < MINIMUM_BALANCE) {
            System.out.println("Warning: Savings account initial deposit is below the minimum balance of ₹" + MINIMUM_BALANCE);
        }
    }

    public SavingsAccount(String accountNumber, Customer customer, double initialDeposit, double dailyLimit) {
        super(accountNumber, customer, initialDeposit, dailyLimit);
    }

    @Override
    public String getAccountType() {
        return "Savings Account";
    }

    @Override
    public double getMinimumBalance() {
        return MINIMUM_BALANCE;
    }

    @Override
    public double getOverdraftLimit() {
        return 0.0; // Savings accounts do not permit overdraft
    }

    @Override
    public double getInterestRate() {
        return ANNUAL_INTEREST_RATE;
    }

    /**
     * Polymorphic implementation: Ensures balance does not drop below Minimum Balance (₹1,000).
     */
    @Override
    protected boolean canWithdraw(double amount, StringBuilder reason) {
        if ((balance - amount) < MINIMUM_BALANCE) {
            reason.append("Insufficient funds. Maintaining minimum balance of ₹")
                  .append(MINIMUM_BALANCE)
                  .append(" is required. Current balance: ₹")
                  .append(balance);
            return false;
        }
        return true;
    }

    /**
     * Applies monthly/quarterly interest based on annual interest rate.
     */
    public void applyInterest() {
        double interest = (balance * (ANNUAL_INTEREST_RATE / 100.0)) / 12.0;
        if (interest > 0) {
            deposit(interest, "Monthly Interest Credit @ " + ANNUAL_INTEREST_RATE + "% p.a.");
        }
    }
}
