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
    const contact = await this.contactRepo.create(userId, contactId);
    await this.contactRepo.create(contactId, userId);

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

    // Check if contact already exists
    const existingContact = await this.contactRepo.getContact(userId, contactUser.id);
    if (existingContact) {
      throw new Error("Contact already exists");
    }

    // Create bidirectional contact relationship
    const contact = await this.contactRepo.create(userId, contactUser.id);
    await this.contactRepo.create(contactUser.id, userId);

    return contact;
  }

  public async updateContactStatus(userId: string, contactId: string, status: string) {
    // Find the current contact relationship
    const contact = await this.contactRepo.getByID(contactId);
    if (!contact) {
        throw new Error("Contact not found");
    }

    // Verify this contact belongs to the current user
    if (contact.userId !== userId) {
        throw new Error("Unauthorized to update this contact");
    }

    // Update the current contact's status
    const updatedContact = await this.contactRepo.updateStatus(contactId, status);

    // If the status is being set to ACCEPTED, update the reverse relationship too
    if (status === 'ACCEPTED') {
        // Find the reverse contact relationship
        const reverseContact = await this.contactRepo.getContact(contact.contactId, contact.userId);
        if (reverseContact) {
            // Update the reverse contact's status
            await this.contactRepo.updateStatus(reverseContact.id, status);
        }
    }

    return updatedContact;
}

  public async removeContact(userId: string, contactId: string) {
    const contact = await this.contactRepo.getContact(userId, contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Remove bidirectional contact relationship
    await this.contactRepo.delete(contact.id);
    const reverseContact = await this.contactRepo.getContact(contactId, userId);
    if (reverseContact) {
      await this.contactRepo.delete(reverseContact.id);
    }
  }
}