package com.bank;

/**
 * CurrentAccount demonstrating Inheritance and Polymorphism.
 * Designed for businesses and merchants, supporting Overdraft facilities up to ₹1,00,000.
 */
public class CurrentAccount extends BankAccount {
    public static final double DEFAULT_OVERDRAFT_LIMIT = 100000.0; // ₹1,00,000 overdraft
    public static final double DEFAULT_DAILY_LIMIT = 200000.0;     // ₹2,00,000 daily limit

    private double overdraftLimit;

    public CurrentAccount(String accountNumber, Customer customer, double initialDeposit) {
        super(accountNumber, customer, initialDeposit, DEFAULT_DAILY_LIMIT);
        this.overdraftLimit = DEFAULT_OVERDRAFT_LIMIT;
    }

    public CurrentAccount(String accountNumber, Customer customer, double initialDeposit, double dailyLimit, double overdraftLimit) {
        super(accountNumber, customer, initialDeposit, dailyLimit);
        this.overdraftLimit = overdraftLimit;
    }

    @Override
    public String getAccountType() {
        return "Current Account";
    }

    @Override
    public double getMinimumBalance() {
        return 0.0; // Zero minimum balance
    }

    @Override
    public double getOverdraftLimit() {
        return overdraftLimit;
    }

    @Override
    public double getInterestRate() {
        return 0.0; // Commercial current accounts do not earn interest
    }

    /**
     * Polymorphic implementation: Allows balance to go negative down to -overdraftLimit.
     */
    @Override
    protected boolean canWithdraw(double amount, StringBuilder reason) {
        if ((balance - amount) < -overdraftLimit) {
            reason.append("Withdrawal exceeds allowed overdraft limit of ₹")
                  .append(overdraftLimit)
                  .append(". Total available funds: ₹")
                  .append(balance + overdraftLimit);
            return false;
        }
        return true;
    }
}
