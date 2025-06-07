import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Engineer } from 'app/core/models/engineer.model';
import { Team } from 'app/core/models/team.model';

@Injectable({
    providedIn: 'root'
})
export class EngineerService {
    private baseUrl = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    /**
     * Get all engineers
     * GET /engineers
     */
    getAllEngineers(): Observable<Engineer[]> {
        return this._httpClient.get<Engineer[]>(`${this.baseUrl}/engineers`);
    }

    /**
     * Get engineer by ID
     * GET /engineers/{id}
     */
    getEngineerById(id: string): Observable<Engineer> {
        return this._httpClient.get<Engineer>(`${this.baseUrl}/engineers/${id}`);
    }

    /**
     * Get engineers by team
     * GET /engineers/team/{teamId}
     */
    getEngineersByTeam(teamId: string): Observable<Engineer[]> {
        return this._httpClient.get<Engineer[]>(`${this.baseUrl}/engineers/team/${teamId}`);
    }

    /**
     * Get engineers by manager
     * GET /engineers/manager/{username}
     */
    getEngineersByManager(username: string): Observable<Engineer[]> {
        return this._httpClient.get<Engineer[]>(`${this.baseUrl}/engineers/manager/${username}`);
    }

    /**
     * Create engineer
     * POST /engineers
     */
    createEngineer(engineer: Engineer): Observable<Engineer> {
        return this._httpClient.post<Engineer>(`${this.baseUrl}/engineers`, engineer);
    }

    /**
     * Update engineer
     * PUT /engineers/{id}
     */
    updateEngineer(id: string, engineer: Engineer): Observable<Engineer> {
        return this._httpClient.put<Engineer>(`${this.baseUrl}/engineers/${id}`, engineer);
    }

    /**
     * Delete engineer
     * DELETE /engineers/{id}
     */
    deleteEngineer(id: string): Observable<any> {
        return this._httpClient.delete(`${this.baseUrl}/engineers/${id}`);
    }

    /**
     * Assign engineer to team
     * PUT /engineers/{id}/team/{teamId}
     */
    assignEngineerToTeam(engineerId: string, teamId: string): Observable<Engineer> {
        return this._httpClient.put<Engineer>(`${this.baseUrl}/engineers/${engineerId}/team/${teamId}`, {});
    }
}
