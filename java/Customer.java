package com.bank;

/**
 * Customer class demonstrating OOP Encapsulation.
 * Represents a bank account holder with personal and KYC information.
 */
public class Customer {
    private String customerId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String governmentId; // PAN or Aadhaar Number

    public Customer(String customerId, String fullName, String email, String phone, String address, String governmentId) {
        this.customerId = customerId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.governmentId = governmentId;
    }

    // Getters and Setters (Encapsulation)
    public String getCustomerId() { return customerId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGovernmentId() { return governmentId; }
    public void setGovernmentId(String governmentId) { this.governmentId = governmentId; }

    @Override
    public String toString() {
        return "Customer: " + fullName + " | ID: " + customerId + " | Phone: " + phone + " | PAN/Aadhaar: " + governmentId;
    }
}
