import { Settings } from './settings.model';
import { Team } from './team.model';

export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    username?: string; // Added for manager creation/update
    password?: string; // Optional when retrieving user data
    role: string | string[]; // Can be a single role or array of roles
    settings?: Settings; // One-to-one relationship with Settings
    teams?: Team[]; // Many-to-many relationship with Team (User manages teams)
    phoneNumber?: string; // Added for manager creation
    gender?: string; // Added for manager creation
    team?: Team; // Single team relationship
}
