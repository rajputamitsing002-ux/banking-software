package com.bank;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Abstract Base Class BankAccount demonstrating:
 * 1. Abstraction: Abstract methods implemented uniquely by specialized account types
 * 2. Encapsulation: Protected/Private attributes with public banking operations
 * 3. Polymorphism: Overridden methods in SavingsAccount, CurrentAccount, and SalaryAccount
 */
public abstract class BankAccount {
    protected String accountNumber;
    protected Customer customer;
    protected double balance;
    protected double dailyWithdrawalLimit;
    protected LocalDateTime openedDate;
    protected List<Transaction> transactions;

    public BankAccount(String accountNumber, Customer customer, double initialDeposit, double dailyLimit) {
        this.accountNumber = accountNumber;
        this.customer = customer;
        this.balance = 0.0;
        this.dailyWithdrawalLimit = dailyLimit;
        this.openedDate = LocalDateTime.now();
        this.transactions = new ArrayList<>();

        if (initialDeposit > 0) {
            deposit(initialDeposit, "Initial Account Opening Deposit");
        }
    }

    // --- Abstract Methods (Polymorphism) ---
    public abstract String getAccountType();
    public abstract double getMinimumBalance();
    public abstract double getOverdraftLimit();
    public abstract double getInterestRate();

    /**
     * Polymorphic withdrawal validation (e.g. minimum balance or overdraft check).
     */
    protected abstract boolean canWithdraw(double amount, StringBuilder reason);

    // =========================================================================
    // Operation (b): Deposit money
    // =========================================================================
    public boolean deposit(double amount, String narration) {
        if (amount <= 0) {
            System.out.println("Error: Deposit amount must be positive.");
            return false;
        }

        this.balance += amount;
        String txnId = "TXN-" + (transactions.size() + 1001);
        String refNo = "CR-" + System.currentTimeMillis() % 100000;
        Transaction txn = new Transaction(txnId, LocalDateTime.now(), Transaction.Type.DEPOSIT, amount, this.balance, narration, refNo);
        transactions.add(txn);
        System.out.println("✓ Deposit Successful! Credited ₹" + amount + " to A/C: " + accountNumber);
        return true;
    }

    // =========================================================================
    // Operation (c) & (d): Withdraw money & Honor daily withdrawal limit
    // =========================================================================
    public boolean withdraw(double amount, String narration) {
        if (amount <= 0) {
            System.out.println("Error: Withdrawal amount must be greater than zero.");
            return false;
        }

        LocalDate today = LocalDate.now();
        double withdrawnToday = getDailyWithdrawnToday(today);
        double remainingLimit = dailyWithdrawalLimit - withdrawnToday;

        // Requirement (d): Honor daily withdrawal limit
        if (amount > remainingLimit) {
            System.out.println("✗ Withdrawal Rejected: Daily limit exceeded!");
            System.out.println("  Daily Limit: ₹" + dailyWithdrawalLimit +
                               " | Withdrawn Today: ₹" + withdrawnToday +
                               " | Remaining Limit: ₹" + remainingLimit);
            return false;
        }

        // Account-type specific fund sufficiency check
        StringBuilder failReason = new StringBuilder();
        if (!canWithdraw(amount, failReason)) {
            System.out.println("✗ Withdrawal Rejected: " + failReason.toString());
            return false;
        }

        this.balance -= amount;
        String txnId = "TXN-" + (transactions.size() + 1001);
        String refNo = "DR-" + System.currentTimeMillis() % 100000;
        Transaction txn = new Transaction(txnId, LocalDateTime.now(), Transaction.Type.WITHDRAWAL, amount, this.balance, narration, refNo);
        transactions.add(txn);
        System.out.println("✓ Withdrawal Successful! Debited ₹" + amount + " from A/C: " + accountNumber);
        return true;
    }

    // =========================================================================
    // Operation (d): Daily withdrawal tracking
    // =========================================================================
    public double getDailyWithdrawnToday(LocalDate date) {
        double total = 0.0;
        for (Transaction txn : transactions) {
            if (txn.getType() == Transaction.Type.WITHDRAWAL && txn.getDate().equals(date)) {
                total += txn.getAmount();
            }
        }
        return total;
    }

    public double getRemainingDailyLimit() {
        return Math.max(0.0, dailyWithdrawalLimit - getDailyWithdrawnToday(LocalDate.now()));
    }

    // =========================================================================
    // Operation (e): Check the balance
    // =========================================================================
    public double checkBalance() {
        System.out.println("Account Number: " + accountNumber + " | Current Balance: ₹" + String.format("%.2f", balance));
        return this.balance;
    }

    // =========================================================================
    // Operation (f): Display Account information
    // =========================================================================
    public void displayAccountInfo() {
        System.out.println("=================================================");
        System.out.println("             BANK ACCOUNT INFORMATION            ");
        System.out.println("=================================================");
        System.out.println("Account Number       : " + accountNumber);
        System.out.println("Account Type         : " + getAccountType());
        System.out.println("Customer Name        : " + customer.getFullName());
        System.out.println("Customer Email       : " + customer.getEmail());
        System.out.println("Customer Phone       : " + customer.getPhone());
        System.out.println("PAN / Aadhaar ID     : " + customer.getGovernmentId());
        System.out.println("Current Balance      : ₹" + String.format("%.2f", balance));
        System.out.println("Minimum Balance Req  : ₹" + String.format("%.2f", getMinimumBalance()));
        System.out.println("Overdraft Facility   : ₹" + String.format("%.2f", getOverdraftLimit()));
        System.out.println("Daily Limit          : ₹" + String.format("%.2f", dailyWithdrawalLimit));
        System.out.println("Remaining Limit Today: ₹" + String.format("%.2f", getRemainingDailyLimit()));
        System.out.println("Total Transactions   : " + transactions.size());
        System.out.println("=================================================");
    }

    // =========================================================================
    // Operation (g): Passbook Print (from to)
    // =========================================================================
    public void printPassbook(LocalDate fromDate, LocalDate toDate) {
        System.out.println("===============================================================================");
        System.out.println("                     STATE BANK OF INDIA - PASSBOOK PRINT                      ");
        System.out.println("===============================================================================");
        System.out.println("A/C: " + accountNumber + " | Holder: " + customer.getFullName() + " | Type: " + getAccountType());
        System.out.println("Statement Period: " + fromDate + " to " + toDate);
        System.out.println("-------------------------------------------------------------------------------");
        System.out.printf("%-16s | %-12s | %-25s | %-12s | %-12s\n", "Date", "Type", "Particulars", "Amount (₹)", "Balance (₹)");
        System.out.println("-------------------------------------------------------------------------------");

        double totalCredits = 0.0;
        double totalDebits = 0.0;
        int count = 0;

        for (Transaction txn : transactions) {
            LocalDate txnDate = txn.getDate();
            if ((txnDate.isEqual(fromDate) || txnDate.isAfter(fromDate)) &&
                (txnDate.isEqual(toDate) || txnDate.isBefore(toDate))) {
                System.out.println(txn);
                if (txn.getType() == Transaction.Type.DEPOSIT) {
                    totalCredits += txn.getAmount();
                } else if (txn.getType() == Transaction.Type.WITHDRAWAL) {
                    totalDebits += txn.getAmount();
                }
                count++;
            }
        }

        if (count == 0) {
            System.out.println("No transactions found for the specified period.");
        }

        System.out.println("-------------------------------------------------------------------------------");
        System.out.printf("Total Credits: +₹%.2f | Total Debits: -₹%.2f | Current Balance: ₹%.2f\n",
                totalCredits, totalDebits, balance);
        System.out.println("===============================================================================");
    }

    // Getters
    public String getAccountNumber() { return accountNumber; }
    public Customer getCustomer() { return customer; }
    public double getBalance() { return balance; }
    public double getDailyWithdrawalLimit() { return dailyWithdrawalLimit; }
    public List<Transaction> getTransactions() { return transactions; }
}
