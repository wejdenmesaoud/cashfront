import { Case } from './case.model';

export interface Report {
    id?: string;
    chat: string;
    cases: Case[]; // One-to-many relationship with Case
    total: number;
    engineerName: string;
}
