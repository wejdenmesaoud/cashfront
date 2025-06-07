import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Settings } from 'app/core/models/settings.model';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private baseUrl = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    /**
     * Get all settings
     */
    getAllSettings(): Observable<Settings[]> {
        return this._httpClient.get<Settings[]>(`${this.baseUrl}/settings`);
    }

    /**
     * Get setting by ID
     */
    getSettingById(id: string): Observable<Settings> {
        return this._httpClient.get<Settings>(`${this.baseUrl}/settings/${id}`);
    }

    /**
     * Create setting
     */
    createSetting(setting: Settings): Observable<Settings> {
        return this._httpClient.post<Settings>(`${this.baseUrl}/settings`, setting);
    }

    /**
     * Update setting
     */
    updateSetting(id: string, setting: Settings): Observable<Settings> {
        return this._httpClient.put<Settings>(`${this.baseUrl}/settings/${id}`, setting);
    }

    /**
     * Delete setting
     */
    deleteSetting(id: string): Observable<any> {
        return this._httpClient.delete(`${this.baseUrl}/settings/${id}`);
    }

    /**
     * Check if settings exist
     * Based on the backend code, we need to get all settings and check if the list is empty
     */
    checkSettingsExist(): Observable<boolean> {
        return new Observable<boolean>(observer => {
            this.getAllSettings().subscribe(
                (settings: Settings[]) => {
                    // If settings array is not empty, settings exist
                    observer.next(settings && settings.length > 0);
                    observer.complete();
                },
                (error) => {
                    // In case of error, assume settings don't exist
                    console.error('Error checking settings:', error);
                    observer.next(false);
                    observer.complete();
                }
            );
        });
    }
}
