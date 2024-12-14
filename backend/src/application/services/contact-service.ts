// src\application\services\contact-service.ts
import "reflect-metadata";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/types";
import { ContactRepository } from "../../infrastructure/repositories/contact";
import { UserRepository } from "../../infrastructure/repositories/user";

@injectable()
export class ContactService {
  private contactRepo: ContactRepository;
  private userRepo: UserRepository;

  constructor(
    @inject(TYPES.contactRepo) contactRepo: ContactRepository,
    @inject(TYPES.userRepo) userRepo: UserRepository
  ) {
    this.contactRepo = contactRepo;
    this.userRepo = userRepo;
  }

  public async getAllContacts(userId: string) {
    return await this.contactRepo.getAllByUser(userId);
  }

  public async addContact(userId: string, contactId: string) {
    // Check if contact already exists
    const existingContact = await this.contactRepo.getContact(userId, contactId);
    if (existingContact) {
      throw new Error("Contact already exists");
    }

    // Create bidirectional contact relationship
    const contact = await this.contactRepo.create(contactId, userId);
    // await this.contactRepo.create(contactId, userId);

    return contact;
  }

  public async addContactByEmail(userId: string, email: string) {
    // Find user by email
    const contactUser = await this.userRepo.getByEmail(email);
    if (!contactUser) {
      throw new Error("User not found with this email");
    }

    // Prevent adding self as contact
    if (contactUser.id === userId) {
      throw new Error("Cannot add yourself as a contact");
    }

    // Check if contact already exists in either direction
    const existingContact = await this.contactRepo.getContact(userId, contactUser.id);
    const existingReverseContact = await this.contactRepo.getContact(contactUser.id, userId);

    if (existingContact || existingReverseContact) {
      throw new Error("Contact relationship already exists");
    }

    // Create initial contact request - sender to receiver
    const contact = await this.contactRepo.create( contactUser.id, userId, 'PENDING');

    // Create reverse contact relationship as PENDING
    await this.contactRepo.create(userId, contactUser.id, 'RECEIVED');

    return contact;
  }

  public async updateContactStatus(userId: string, contactId: string, status: string) {
    // Find the contact that's being updated
    const contact = await this.contactRepo.getByID(contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Verify this contact belongs to the current user
    if (contact.userId !== userId) {
      throw new Error("Unauthorized to update this contact");
    }

    if (status === 'ACCEPTED') {
      // Find or create the reverse contact relationship
      const reverseContact = await this.contactRepo.getContact(contact.contactId, contact.userId);

      if (!reverseContact) {
        // Create reverse contact if it doesn't exist
        await this.contactRepo.create(contact.contactId, contact.userId, 'ACCEPTED');
      } else {
        // Update reverse contact status
        await this.contactRepo.updateStatus(reverseContact.id, 'ACCEPTED');
      }

      // Update the original contact status
      const updatedContact = await this.contactRepo.updateStatus(contactId, 'ACCEPTED');
      return updatedContact;
    } else if (status === 'REJECTED') {
      // If rejecting, remove both contact relationships
      const reverseContact = await this.contactRepo.getContact(contact.contactId, contact.userId);
      if (reverseContact) {
        await this.contactRepo.delete(reverseContact.id);
      }
      await this.contactRepo.delete(contactId);
      return null;
    } else {
      // For other status updates, just update the current contact
      return await this.contactRepo.updateStatus(contactId, status);
    }
  }

  public async removeContact(userId: string, contactId: string) {
    const contact = await this.contactRepo.getContact(userId, contactId);
    const reverseContact = await this.contactRepo.getContact(contactId, userId);

    if (!contact && !reverseContact) {
      throw new Error("Contact relationship not found");
    }

     // Remove both directions if they exist
     if (contact) {
      await this.contactRepo.delete(contact.id);
    }
    if (reverseContact) {
      await this.contactRepo.delete(reverseContact.id);
    }
  }
}