package com.bank;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Bank class managing account registrations and banking operations.
 */
public class Bank {
    private String bankName;
    private String branchCode;
    private Map<String, BankAccount> accounts;
    private int nextAccountNumber = 1001;

    public Bank(String bankName, String branchCode) {
        this.bankName = bankName;
        this.branchCode = branchCode;
        this.accounts = new HashMap<>();
    }

    // =========================================================================
    // Operation (a): Create an account
    // =========================================================================
    public BankAccount createAccount(Customer customer, String accountType, double initialDeposit) {
        String accNo = "SBIN-" + (nextAccountNumber++);
        BankAccount account;

        switch (accountType.toUpperCase()) {
            case "CURRENT":
                account = new CurrentAccount(accNo, customer, initialDeposit);
                break;
            case "SALARY":
                account = new SalaryAccount(accNo, customer, initialDeposit, "TCS Ltd");
                break;
            case "SAVINGS":
            default:
                account = new SavingsAccount(accNo, customer, initialDeposit);
                break;
        }

        accounts.put(account.getAccountNumber(), account);
        System.out.println("✓ Account created successfully! A/C Number: " + accNo + " (" + account.getAccountType() + ")");
        return account;
    }

    // Lookup
    public BankAccount getAccount(String accountNumber) {
        return accounts.get(accountNumber);
    }

    public List<BankAccount> getAllAccounts() {
        return new ArrayList<>(accounts.values());
    }

    // Seed sample accounts for testing
    public void seedSampleAccounts() {
        Customer c1 = new Customer("CUST-101", "Amit Singh Rajput", "amit.rajput@gmail.com", "+91 9876543210", "Sector 62, Noida, UP", "BKPRS8124K");
        BankAccount a1 = createAccount(c1, "SALARY", 75000);
        a1.deposit(25000, "Salary Credit");
        a1.withdraw(8500, "ATM Cash Withdrawal");

        Customer c2 = new Customer("CUST-102", "Rahul Sharma", "rahul.sharma@outlook.com", "+91 9811234567", "Karol Bagh, New Delhi", "489210948219");
        BankAccount a2 = createAccount(c2, "SAVINGS", 35000);
        a2.deposit(10000, "Cheque Clearance");
        a2.withdraw(5000, "UPI Payment");

        Customer c3 = new Customer("CUST-103", "Priya Patel", "priya@patelenterprises.com", "+91 9920188765", "Nariman Point, Mumbai", "27AABCP1234F1Z5");
        BankAccount a3 = createAccount(c3, "CURRENT", 150000);
        a3.deposit(50000, "Client RTGS");
        a3.withdraw(20000, "Vendor Settlement");
    }

    public String getBankName() { return bankName; }
    public String getBranchCode() { return branchCode; }
}
