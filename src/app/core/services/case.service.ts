import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Case } from 'app/core/models/case.model';

@Injectable({
    providedIn: 'root'
})
export class CaseService {
    private baseUrl = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    /**
     * Get all cases
     * GET /cases
     */
    getAllCases(): Observable<Case[]> {
        return this._httpClient.get<Case[]>(`${this.baseUrl}/cases`);
    }

    /**
     * Get case by ID
     * GET /cases/{id}
     */
    getCaseById(id: string): Observable<Case> {
        return this._httpClient.get<Case>(`${this.baseUrl}/cases/${id}`);
    }

    /**
     * Get cases by engineer
     * GET /cases/engineer/{engineerId}
     */
    getCasesByEngineer(engineerId: string): Observable<Case[]> {
        return this._httpClient.get<Case[]>(`${this.baseUrl}/cases/engineer/${engineerId}`);
    }

    /**
     * Get cases by team
     * GET /cases/team/{teamId}
     */
    getCasesByTeam(teamId: string): Observable<Case[]> {
        return this._httpClient.get<Case[]>(`${this.baseUrl}/cases/team/${teamId}`);
    }

    /**
     * Get cases within date range
     * GET /cases/date-range?startDate={startDate}&endDate={endDate}
     */
    getCasesByDateRange(startDate: Date, endDate: Date): Observable<Case[]> {
        const params = new HttpParams()
            .set('startDate', startDate.toISOString())
            .set('endDate', endDate.toISOString());

        return this._httpClient.get<Case[]>(`${this.baseUrl}/cases/date-range`, { params });
    }

    /**
     * Stream cases within date range (for large datasets)
     * GET /cases/stream/date-range?startDate={startDate}&endDate={endDate}
     */
    streamCasesByDateRange(startDate: Date, endDate: Date): Observable<Case[]> {
        const params = new HttpParams()
            .set('startDate', startDate.toISOString())
            .set('endDate', endDate.toISOString());

        return this._httpClient.get<Case[]>(`${this.baseUrl}/cases/stream/date-range`, { params });
    }

    /**
     * Create a new case
     * POST /cases
     */
    createCase(caseData: Case): Observable<Case> {
        return this._httpClient.post<Case>(`${this.baseUrl}/cases`, caseData);
    }

    /**
     * Update case details
     * PUT /cases/{id}
     */
    updateCase(id: string, caseData: Case): Observable<Case> {
        return this._httpClient.put<Case>(`${this.baseUrl}/cases/${id}`, caseData);
    }

    /**
     * Delete a case
     * DELETE /cases/{id}
     */
    deleteCase(id: string): Observable<any> {
        return this._httpClient.delete(`${this.baseUrl}/cases/${id}`);
    }

    /**
     * Get engineer case statistics
     * GET /cases/statistics/engineer/{engineerId}
     */
    getEngineerCaseStatistics(engineerId: string): Observable<any> {
        return this._httpClient.get<any>(`${this.baseUrl}/cases/statistics/engineer/${engineerId}`);
    }

    /**
     * Upload cases from Excel file
     * POST /excel/import-cases
     */
    uploadCasesFromExcel(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);

        return this._httpClient.post<any>(`${this.baseUrl}/excel/import-cases`, formData);
    }

    /**
     * Generate report for cases
     * POST /cases/generate-report
     */
    generateReport(cases: Case[]): Observable<any> {
        return this._httpClient.post<any>(`${this.baseUrl}/cases/generate-report`, { cases });
    }
}
