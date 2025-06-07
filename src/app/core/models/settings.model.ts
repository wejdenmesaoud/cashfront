export interface Settings {
    id?: string;
    userId?: string; // Foreign key to User
    // Add any settings properties as needed
    theme?: string;
    notifications?: boolean;
    language?: string;
    // Other settings properties
}
