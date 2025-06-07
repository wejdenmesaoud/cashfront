import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { User } from 'app/core/models/user.model';
import { Team } from 'app/core/models/team.model';

@Injectable({
    providedIn: 'root'
})
export class ManagerService {
    private baseUrl = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    /**
     * Get all managers
     * GET /users/managers
     */
    getAllManagers(): Observable<User[]> {
        return this._httpClient.get<User[]>(`${this.baseUrl}/users/managers`);
    }

    /**
     * Get manager by ID
     * GET /users/managers/{id}
     */
    getManagerById(id: string): Observable<User> {
        return this._httpClient.get<User>(`${this.baseUrl}/users/managers/${id}`);
    }

    /**
     * Create user and then add manager role
     * POST /auth/signup and then PUT /users/{id}/role/manager
     */
    createManager(manager: User): Observable<any> {
        // First create a regular user
        // Generate a username based on first and last name if not provided
        const username = manager.username ||
                        manager.firstName.toLowerCase() +
                        (manager.lastName ? '.' + manager.lastName.toLowerCase() : '');

        const signupData = {
            username: username,
            email: manager.email,
            password: manager.password,
            firstName: manager.firstName,
            lastName: manager.lastName
        };

        // Store the username in the manager object for later use
        manager.username = username;

        // We'll handle the role assignment in the component after user creation
        return this._httpClient.post<any>(`${this.baseUrl}/auth/signup`, signupData);
    }

    /**
     * Update manager
     * PUT /users/{id}
     */
    updateManager(id: string, manager: User): Observable<User> {
        // Include the username from the original user creation
        const updateData = {
            username: manager.username, // Keep the original username
            email: manager.email,
            password: manager.password, // Optional
            firstName: manager.firstName,
            lastName: manager.lastName
        };
        return this._httpClient.put<User>(`${this.baseUrl}/users/${id}`, updateData);
    }

    /**
     * Update manager's team assignment
     * PUT /teams/{teamId}/user/{username}
     */
    updateManagerTeam(teamId: string, username: string): Observable<Team> {
        return this._httpClient.put<Team>(`${this.baseUrl}/teams/${teamId}/user/${username}`, {});
    }

    /**
     * Add manager role
     * PUT /users/{username}/role/manager
     */
    addManagerRole(username: string): Observable<any> {
        return this._httpClient.put(`${this.baseUrl}/users/username/${username}/role/manager`, {});
    }


    /**
     * Remove manager role
     * DELETE /users/username/{username}/role/manager
     */
    removeManagerRole(username: string): Observable<any> {
        return this._httpClient.delete(`${this.baseUrl}/users/username/${username}/role/manager`);
    }

    /**
     * Delete manager account
     * DELETE /users/{id}
     */
    deleteManager(id: string): Observable<any> {
        return this._httpClient.delete(`${this.baseUrl}/users/${id}`);
    }
}
