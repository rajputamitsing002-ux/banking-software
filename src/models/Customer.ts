/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICustomer } from './types';

/**
 * Encapsulated Customer class representing a banking customer entity.
 * Demonstrates: Encapsulation (private fields, validation, accessor methods).
 */
export class Customer implements ICustomer {
  #id: string;
  #fullName: string;
  #email: string;
  #phone: string;
  #address: string;
  #governmentId: string;
  #registeredAt: Date;

  constructor(
    id: string,
    fullName: string,
    email: string,
    phone: string,
    address: string,
    governmentId: string,
    registeredAt: Date = new Date()
  ) {
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Customer full name must be at least 2 characters long.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Valid customer email address is required.');
    }
    if (!phone || phone.trim().length < 5) {
      throw new Error('Valid contact phone number is required.');
    }

    this.#id = id;
    this.#fullName = fullName.trim();
    this.#email = email.trim().toLowerCase();
    this.#phone = phone.trim();
    this.#address = address.trim();
    this.#governmentId = governmentId.trim();
    this.#registeredAt = registeredAt;
  }

  // Public Getters (Encapsulated state read-only exposure)
  public get id(): string {
    return this.#id;
  }

  public get fullName(): string {
    return this.#fullName;
  }

  public get email(): string {
    return this.#email;
  }

  public get phone(): string {
    return this.#phone;
  }

  public get address(): string {
    return this.#address;
  }

  public get governmentId(): string {
    return this.#governmentId;
  }

  public get registeredAt(): Date {
    return this.#registeredAt;
  }

  public updateContact(phone: string, email: string, address: string): void {
    if (phone && phone.trim().length >= 5) this.#phone = phone.trim();
    if (email && email.includes('@')) this.#email = email.trim().toLowerCase();
    if (address) this.#address = address.trim();
  }

  public toJSON(): ICustomer {
    return {
      id: this.#id,
      fullName: this.#fullName,
      email: this.#email,
      phone: this.#phone,
      address: this.#address,
      governmentId: this.#governmentId,
      registeredAt: this.#registeredAt,
    };
  }
}
