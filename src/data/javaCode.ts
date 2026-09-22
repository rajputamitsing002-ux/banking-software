/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JavaFile {
  name: string;
  description: string;
  code: string;
}

export const JAVA_FILES: JavaFile[] = [
  {
    name: 'Main.java',
    description: 'Console Application Entry Point demonstrating all 7 Banking Operations',
    code: `package com.bank;

import java.time.LocalDate;
import java.util.Scanner;

/**
 * Main console runner exercising all 7 OOP Banking Operations:
 * a. Create an account
 * b. Deposit money
 * c. Withdraw money
 * d. Honor daily withdrawal limit
 * e. Check the balance
 * f. Display Account information
 * g. Passbook Print (from to)
 */
public class Main {
    public static void main(String[] args) {
        Bank bank = new Bank("State Bank of India", "SBIN0001048");
        bank.seedSampleAccounts();

        Scanner scanner = new Scanner(System.in);
        boolean running = true;

        System.out.println("=================================================");
        System.out.println("     STATE BANK OF INDIA - OOP BANKING PORTAL    ");
        System.out.println("=================================================");

        while (running) {
            System.out.println("\\n--- BANKING OPERATIONS MENU ---");
            System.out.println("1. Create New Account (Operation a)");
            System.out.println("2. Deposit Money (Operation b)");
            System.out.println("3. Withdraw Money & Check Daily Limit (Operations c & d)");
            System.out.println("4. Check Account Balance (Operation e)");
            System.out.println("5. Display Account Information (Operation f)");
            System.out.println("6. Print Passbook [From Date to To Date] (Operation g)");
            System.out.println("7. List All Accounts");
            System.out.println("8. Exit");
            System.out.print("Select an option (1-8): ");

            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1": {
                    // a. Create an account
                    System.out.print("Enter Customer Name: ");
                    String name = scanner.nextLine().trim();
                    System.out.print("Enter Email: ");
                    String email = scanner.nextLine().trim();
                    System.out.print("Enter Phone (+91): ");
                    String phone = scanner.nextLine().trim();
                    System.out.print("Enter Address: ");
                    String address = scanner.nextLine().trim();
                    System.out.print("Enter PAN / Aadhaar ID: ");
                    String id = scanner.nextLine().trim();
                    System.out.print("Select Type (1. Savings, 2. Current, 3. Salary): ");
                    String typeChoice = scanner.nextLine().trim();
                    String type = typeChoice.equals("2") ? "CURRENT" : typeChoice.equals("3") ? "SALARY" : "SAVINGS";

                    System.out.print("Enter Initial Deposit (₹): ");
                    double initialDeposit = Double.parseDouble(scanner.nextLine().trim());

                    Customer customer = new Customer("CUST-" + (System.currentTimeMillis() % 1000), name, email, phone, address, id);
                    bank.createAccount(customer, type, initialDeposit);
                    break;
                }
                case "2": {
                    // b. Deposit money
                    System.out.print("Enter Account Number (e.g. SBIN-1001): ");
                    String accNo = scanner.nextLine().trim();
                    BankAccount account = bank.getAccount(accNo);
                    if (account != null) {
                        System.out.print("Enter Deposit Amount (₹): ");
                        double amount = Double.parseDouble(scanner.nextLine().trim());
                        System.out.print("Enter Narration: ");
                        String remarks = scanner.nextLine().trim();
                        account.deposit(amount, remarks.isEmpty() ? "Cash Deposit" : remarks);
                    } else {
                        System.out.println("Error: Account not found!");
                    }
                    break;
                }
                case "3": {
                    // c & d. Withdraw money with daily limit check
                    System.out.print("Enter Account Number (e.g. SBIN-1001): ");
                    String accNo = scanner.nextLine().trim();
                    BankAccount account = bank.getAccount(accNo);
                    if (account != null) {
                        System.out.print("Enter Withdrawal Amount (₹): ");
                        double amount = Double.parseDouble(scanner.nextLine().trim());
                        System.out.print("Enter Narration: ");
                        String remarks = scanner.nextLine().trim();
                        account.withdraw(amount, remarks.isEmpty() ? "ATM Cash Withdrawal" : remarks);
                    } else {
                        System.out.println("Error: Account not found!");
                    }
                    break;
                }
                case "4": {
                    // e. Check the balance
                    System.out.print("Enter Account Number: ");
                    String accNo = scanner.nextLine().trim();
                    BankAccount account = bank.getAccount(accNo);
                    if (account != null) {
                        account.checkBalance();
                    } else {
                        System.out.println("Error: Account not found!");
                    }
                    break;
                }
                case "5": {
                    // f. Display Account information
                    System.out.print("Enter Account Number: ");
                    String accNo = scanner.nextLine().trim();
                    BankAccount account = bank.getAccount(accNo);
                    if (account != null) {
                        account.displayAccountInfo();
                    } else {
                        System.out.println("Error: Account not found!");
                    }
                    break;
                }
                case "6": {
                    // g. Passbook Print (from to)
                    System.out.print("Enter Account Number: ");
                    String accNo = scanner.nextLine().trim();
                    BankAccount account = bank.getAccount(accNo);
                    if (account != null) {
                        System.out.print("Enter From Date (YYYY-MM-DD) or press Enter for 30 days ago: ");
                        String fromStr = scanner.nextLine().trim();
                        LocalDate from = fromStr.isEmpty() ? LocalDate.now().minusDays(30) : LocalDate.parse(fromStr);

                        System.out.print("Enter To Date (YYYY-MM-DD) or press Enter for today: ");
                        String toStr = scanner.nextLine().trim();
                        LocalDate to = toStr.isEmpty() ? LocalDate.now() : LocalDate.parse(toStr);

                        account.printPassbook(from, to);
                    } else {
                        System.out.println("Error: Account not found!");
                    }
                    break;
                }
                case "7": {
                    System.out.println("\\n--- REGISTERED ACCOUNTS ---");
                    for (BankAccount acc : bank.getAllAccounts()) {
                        System.out.printf("A/C: %-14s | %-16s | %-24s | Balance: ₹%.2f\\n",
                                acc.getAccountNumber(), acc.getAccountType(), acc.getCustomer().getFullName(), acc.getBalance());
                    }
                    break;
                }
                case "8": {
                    System.out.println("Thank you for using State Bank of India Banking Portal. Goodbye!");
                    running = false;
                    break;
                }
                default:
                    System.out.println("Invalid option. Please choose between 1 and 8.");
            }
        }
        scanner.close();
    }
}`
  },
  {
    name: 'BankAccount.java',
    description: 'Abstract Base Class implementing OOP Abstraction, Encapsulation, and Polymorphism',
    code: `package com.bank;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // Abstract methods (Polymorphism)
    public abstract String getAccountType();
    public abstract double getMinimumBalance();
    public abstract double getOverdraftLimit();
    public abstract double getInterestRate();
    protected abstract boolean canWithdraw(double amount, StringBuilder reason);

    // Operation (b): Deposit money
    public boolean deposit(double amount, String narration) {
        if (amount <= 0) return false;
        this.balance += amount;
        String txnId = "TXN-" + (transactions.size() + 1001);
        String refNo = "CR-" + System.currentTimeMillis() % 100000;
        transactions.add(new Transaction(txnId, LocalDateTime.now(), Transaction.Type.DEPOSIT, amount, this.balance, narration, refNo));
        return true;
    }

    // Operation (c) & (d): Withdraw money honoring daily limit
    public boolean withdraw(double amount, String narration) {
        if (amount <= 0) return false;

        double withdrawnToday = getDailyWithdrawnToday(LocalDate.now());
        double remainingLimit = dailyWithdrawalLimit - withdrawnToday;

        if (amount > remainingLimit) {
            System.out.println("✗ Withdrawal Rejected: Daily limit exceeded! Remaining: ₹" + remainingLimit);
            return false;
        }

        StringBuilder reason = new StringBuilder();
        if (!canWithdraw(amount, reason)) {
            System.out.println("✗ Withdrawal Rejected: " + reason);
            return false;
        }

        this.balance -= amount;
        String txnId = "TXN-" + (transactions.size() + 1001);
        String refNo = "DR-" + System.currentTimeMillis() % 100000;
        transactions.add(new Transaction(txnId, LocalDateTime.now(), Transaction.Type.WITHDRAWAL, amount, this.balance, narration, refNo));
        return true;
    }

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

    // Operation (e): Check the balance
    public double checkBalance() {
        System.out.println("A/C: " + accountNumber + " | Balance: ₹" + String.format("%.2f", balance));
        return this.balance;
    }

    // Operation (f): Display Account information
    public void displayAccountInfo() {
        System.out.println("=================================================");
        System.out.println("             BANK ACCOUNT INFORMATION            ");
        System.out.println("=================================================");
        System.out.println("Account Number       : " + accountNumber);
        System.out.println("Account Type         : " + getAccountType());
        System.out.println("Customer Name        : " + customer.getFullName());
        System.out.println("Current Balance      : ₹" + String.format("%.2f", balance));
        System.out.println("Minimum Balance Req  : ₹" + String.format("%.2f", getMinimumBalance()));
        System.out.println("Overdraft Facility   : ₹" + String.format("%.2f", getOverdraftLimit()));
        System.out.println("Daily Limit          : ₹" + String.format("%.2f", dailyWithdrawalLimit));
        System.out.println("Remaining Limit Today: ₹" + String.format("%.2f", getRemainingDailyLimit()));
        System.out.println("Total Transactions   : " + transactions.size());
        System.out.println("=================================================");
    }

    // Operation (g): Passbook Print (from to)
    public void printPassbook(LocalDate fromDate, LocalDate toDate) {
        System.out.println("===============================================================================");
        System.out.println("                     STATE BANK OF INDIA - PASSBOOK PRINT                      ");
        System.out.println("===============================================================================");
        System.out.println("A/C: " + accountNumber + " | Holder: " + customer.getFullName() + " | Type: " + getAccountType());
        System.out.println("Period: " + fromDate + " to " + toDate);
        System.out.println("-------------------------------------------------------------------------------");
        System.out.printf("%-16s | %-12s | %-25s | %-12s | %-12s\\n", "Date", "Type", "Particulars", "Amount (₹)", "Balance (₹)");
        System.out.println("-------------------------------------------------------------------------------");

        double credits = 0.0, debits = 0.0;
        for (Transaction txn : transactions) {
            LocalDate d = txn.getDate();
            if ((d.isEqual(fromDate) || d.isAfter(fromDate)) && (d.isEqual(toDate) || d.isBefore(toDate))) {
                System.out.println(txn);
                if (txn.getType() == Transaction.Type.DEPOSIT) credits += txn.getAmount();
                else if (txn.getType() == Transaction.Type.WITHDRAWAL) debits += txn.getAmount();
            }
        }
        System.out.println("-------------------------------------------------------------------------------");
        System.out.printf("Total Credits: +₹%.2f | Total Debits: -₹%.2f | Balance: ₹%.2f\\n", credits, debits, balance);
        System.out.println("===============================================================================");
    }

    public String getAccountNumber() { return accountNumber; }
    public Customer getCustomer() { return customer; }
    public double getBalance() { return balance; }
    public double getDailyWithdrawalLimit() { return dailyWithdrawalLimit; }
}`
  },
  {
    name: 'SavingsAccount.java',
    description: 'Inherits BankAccount and enforces Minimum Balance of ₹1,000 and 4% interest rate',
    code: `package com.bank;

public class SavingsAccount extends BankAccount {
    public static final double MINIMUM_BALANCE = 1000.0;
    public static final double ANNUAL_INTEREST_RATE = 4.0;
    public static final double DEFAULT_DAILY_LIMIT = 50000.0;

    public SavingsAccount(String accountNumber, Customer customer, double initialDeposit) {
        super(accountNumber, customer, initialDeposit, DEFAULT_DAILY_LIMIT);
    }

    @Override
    public String getAccountType() { return "Savings Account"; }

    @Override
    public double getMinimumBalance() { return MINIMUM_BALANCE; }

    @Override
    public double getOverdraftLimit() { return 0.0; }

    @Override
    public double getInterestRate() { return ANNUAL_INTEREST_RATE; }

    @Override
    protected boolean canWithdraw(double amount, StringBuilder reason) {
        if ((balance - amount) < MINIMUM_BALANCE) {
            reason.append("Maintaining minimum balance of ₹").append(MINIMUM_BALANCE).append(" is required.");
            return false;
        }
        return true;
    }
}`
  },
  {
    name: 'CurrentAccount.java',
    description: 'Inherits BankAccount and provides Overdraft facility up to ₹1,00,000 for merchants',
    code: `package com.bank;

public class CurrentAccount extends BankAccount {
    public static final double DEFAULT_OVERDRAFT_LIMIT = 100000.0;
    public static final double DEFAULT_DAILY_LIMIT = 200000.0;

    private double overdraftLimit;

    public CurrentAccount(String accountNumber, Customer customer, double initialDeposit) {
        super(accountNumber, customer, initialDeposit, DEFAULT_DAILY_LIMIT);
        this.overdraftLimit = DEFAULT_OVERDRAFT_LIMIT;
    }

    @Override
    public String getAccountType() { return "Current Account"; }

    @Override
    public double getMinimumBalance() { return 0.0; }

    @Override
    public double getOverdraftLimit() { return overdraftLimit; }

    @Override
    public double getInterestRate() { return 0.0; }

    @Override
    protected boolean canWithdraw(double amount, StringBuilder reason) {
        if ((balance - amount) < -overdraftLimit) {
            reason.append("Withdrawal exceeds overdraft limit of ₹").append(overdraftLimit);
            return false;
        }
        return true;
    }
}`
  },
  {
    name: 'SalaryAccount.java',
    description: 'Inherits BankAccount, provides Zero-Balance facility for corporate payroll',
    code: `package com.bank;

public class SalaryAccount extends BankAccount {
    public static final double DEFAULT_DAILY_LIMIT = 50000.0;
    private String employerName;

    public SalaryAccount(String accountNumber, Customer customer, double initialDeposit, String employerName) {
        super(accountNumber, customer, initialDeposit, DEFAULT_DAILY_LIMIT);
        this.employerName = employerName;
    }

    @Override
    public String getAccountType() { return "Salary Account"; }

    @Override
    public double getMinimumBalance() { return 0.0; }

    @Override
    public double getOverdraftLimit() { return 0.0; }

    @Override
    public double getInterestRate() { return 3.5; }

    @Override
    protected boolean canWithdraw(double amount, StringBuilder reason) {
        if (balance < amount) {
            reason.append("Insufficient balance. Available: ₹").append(balance);
            return false;
        }
        return true;
    }
}`
  },
  {
    name: 'Bank.java',
    description: 'Bank Manager class handling account creation, indexing, and lookups',
    code: `package com.bank;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Bank {
    private String bankName;
    private String branchCode;
    private Map<String, BankAccount> accounts = new HashMap<>();
    private int nextAccountNumber = 1001;

    public Bank(String bankName, String branchCode) {
        this.bankName = bankName;
        this.branchCode = branchCode;
    }

    // Operation (a): Create an account
    public BankAccount createAccount(Customer customer, String accountType, double initialDeposit) {
        String accNo = "SBIN-" + (nextAccountNumber++);
        BankAccount account;

        switch (accountType.toUpperCase()) {
            case "CURRENT":
                account = new CurrentAccount(accNo, customer, initialDeposit);
                break;
            case "SALARY":
                account = new SalaryAccount(accNo, customer, initialDeposit, "Corporate Payroll");
                break;
            case "SAVINGS":
            default:
                account = new SavingsAccount(accNo, customer, initialDeposit);
                break;
        }

        accounts.put(account.getAccountNumber(), account);
        return account;
    }

    public BankAccount getAccount(String accountNumber) { return accounts.get(accountNumber); }
    public List<BankAccount> getAllAccounts() { return new ArrayList<>(accounts.values()); }

    public void seedSampleAccounts() {
        Customer c1 = new Customer("CUST-101", "Amit Singh Rajput", "amit.rajput@gmail.com", "+91 9876543210", "Sector 62, Noida", "BKPRS8124K");
        BankAccount a1 = createAccount(c1, "SALARY", 75000);
        a1.deposit(25000, "Monthly Salary");
        a1.withdraw(8500, "ATM Cash");

        Customer c2 = new Customer("CUST-102", "Rahul Sharma", "rahul.sharma@outlook.com", "+91 9811234567", "Karol Bagh, New Delhi", "489210948219");
        BankAccount a2 = createAccount(c2, "SAVINGS", 35000);
        a2.deposit(10000, "Cheque Clearance");
        a2.withdraw(5000, "UPI Payment");
    }
}`
  },
  {
    name: 'Customer.java',
    description: 'Encapsulated Customer profile and KYC details',
    code: `package com.bank;

public class Customer {
    private String customerId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String governmentId;

    public Customer(String customerId, String fullName, String email, String phone, String address, String governmentId) {
        this.customerId = customerId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.governmentId = governmentId;
    }

    public String getCustomerId() { return customerId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getGovernmentId() { return governmentId; }
}`
  },
  {
    name: 'Transaction.java',
    description: 'Immutable Transaction record for the Passbook Ledger',
    code: `package com.bank;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Transaction {
    public enum Type { DEPOSIT, WITHDRAWAL, INTEREST }

    private String transactionId;
    private LocalDateTime timestamp;
    private Type type;
    private double amount;
    private double balanceAfter;
    private String narration;
    private String referenceNumber;

    public Transaction(String transactionId, LocalDateTime timestamp, Type type, double amount, double balanceAfter, String narration, String referenceNumber) {
        this.transactionId = transactionId;
        this.timestamp = timestamp;
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.narration = narration;
        this.referenceNumber = referenceNumber;
    }

    public LocalDate getDate() { return timestamp.toLocalDate(); }
    public Type getType() { return type; }
    public double getAmount() { return amount; }
    public double getBalanceAfter() { return balanceAfter; }
    public String getNarration() { return narration; }

    @Override
    public String toString() {
        return String.format("%-16s | %-12s | %-25s | ₹%-10.2f | ₹%-10.2f",
                timestamp.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), type, narration, amount, balanceAfter);
    }
}`
  }
];
