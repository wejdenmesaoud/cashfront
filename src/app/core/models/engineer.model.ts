import { Case } from './case.model';
import { Team } from './team.model';

export interface Engineer {
    id?: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    gender: string;
    manager: string; // Could be a reference to a User with manager role
    cases?: Case[]; // Many-to-many relationship with Case
    team?: Team; // Many-to-one relationship with Team
}
