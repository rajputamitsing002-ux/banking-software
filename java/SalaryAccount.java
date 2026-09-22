package com.bank;

/**
 * SalaryAccount demonstrating Inheritance and Polymorphism.
 * Zero-balance corporate payroll account.
 */
public class SalaryAccount extends BankAccount {
    public static final double DEFAULT_DAILY_LIMIT = 50000.0;

    private String employerName;

    public SalaryAccount(String accountNumber, Customer customer, double initialDeposit, String employerName) {
        super(accountNumber, customer, initialDeposit, DEFAULT_DAILY_LIMIT);
        this.employerName = employerName;
    }

    @Override
    public String getAccountType() {
        return "Salary Account";
    }

    @Override
    public double getMinimumBalance() {
        return 0.0; // Zero-balance account
    }

    @Override
    public double getOverdraftLimit() {
        return 0.0;
    }

    @Override
    public double getInterestRate() {
        return 3.5; // 3.5% p.a.
    }

    public String getEmployerName() {
        return employerName;
    }

    @Override
    protected boolean canWithdraw(double amount, StringBuilder reason) {
        if (balance < amount) {
            reason.append("Insufficient balance. Available: ₹").append(balance);
            return false;
        }
        return true;
    }
}
