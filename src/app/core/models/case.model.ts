import { Engineer } from './engineer.model';
import { Report } from './report.model';

export interface Case {
    id?: string;
    caseDescription: string;
    date: Date;
    cesRating: number;
    surveySource: string;
    engineers?: Engineer[]; // Many-to-many relationship with Engineer
    report?: Report; // Many-to-one relationship with Report
}
