export const TYPES = {
    // Repositories
    userRepo: Symbol.for("UserRepository"),
    sessionRepo: Symbol.for("SessionRepository"),
    conversationRepo: Symbol.for("ConversationRepository"),
    messageRepo: Symbol.for("MessageRepository"),
    participantRepo: Symbol.for("ParticipantRepository"),
    contactRepo: Symbol.for("ContactRepository"),
    messageReadRepo: Symbol.for("MessageReadRepository"),

    // Services
    userService: Symbol.for("UserService"),
    authService: Symbol.for("AuthService"),
    conversationService: Symbol.for("ConversationService"),
    messageService: Symbol.for("MessageService"),
    contactService: Symbol.for("ContactService"),

    // Infrastructure
    logger: Symbol.for("Logger"),
    prisma: Symbol.for("PrismaClient"),
};