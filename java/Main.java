package com.bank;

import java.time.LocalDate;
import java.util.Scanner;

/**
 * Main application console runner for testing all 7 OOP Banking Operations:
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
        System.out.println("     WELCOME TO STATE BANK OF INDIA (OOP PORTAL)  ");
        System.out.println("=================================================");

        while (running) {
            System.out.println("\n--- BANKING OPERATIONS MENU ---");
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
                    String type = "SAVINGS";
                    if (typeChoice.equals("2")) type = "CURRENT";
                    else if (typeChoice.equals("3")) type = "SALARY";

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
                        System.out.print("Enter Narration / Remarks: ");
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
                        System.out.print("Enter Narration / Remarks: ");
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
                    System.out.println("\n--- REGISTERED ACCOUNTS ---");
                    for (BankAccount acc : bank.getAllAccounts()) {
                        System.out.printf("A/C: %-14s | %-16s | %-24s | Balance: ₹%.2f\n",
                                acc.getAccountNumber(), acc.getAccountType(), acc.getCustomer().getFullName(), acc.getBalance());
                    }
                    break;
                }
                case "8": {
                    System.out.println("Thank you for using State Bank of India Banking Portal. Goodbye!");
                    running = false;
                    break;
                }
                default: {
                    System.out.println("Invalid option. Please choose between 1 and 8.");
                }
            }
        }
        scanner.close();
    }
}
