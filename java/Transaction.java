package com.bank;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Transaction class representing an immutable ledger record in the bank passbook.
 */
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

    public String getTransactionId() { return transactionId; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public LocalDate getDate() { return timestamp.toLocalDate(); }
    public Type getType() { return type; }
    public double getAmount() { return amount; }
    public double getBalanceAfter() { return balanceAfter; }
    public String getNarration() { return narration; }
    public String getReferenceNumber() { return referenceNumber; }

    public String getFormattedDate() {
        return timestamp.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }

    @Override
    public String toString() {
        return String.format("%-16s | %-12s | %-25s | ₹%-10.2f | Balance: ₹%-10.2f",
                getFormattedDate(), type, narration, amount, balanceAfter);
    }
}
