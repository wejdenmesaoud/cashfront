import { Engineer } from './engineer.model';
import { User } from './user.model';

export interface Team {
    id?: string;
    name?: string;
    engineers?: Engineer[]; // One-to-many relationship with Engineer
    manager?: User; // Many-to-one relationship with User (manager)
}
