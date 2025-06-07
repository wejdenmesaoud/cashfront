import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { username: string; password: string }): Observable<any> {
        console.log('API Service - Signing in with credentials:', { username: credentials.username, passwordProvided: !!credentials.password });
        console.log('API Service - Using URL:', `${this.baseUrl}/auth/signin`);
        return this._httpClient.post(`${this.baseUrl}/auth/signin`, credentials);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { username: string; email: string; password: string; role: string[] }): Observable<any> {
        return this._httpClient.post(`${this.baseUrl}/auth/signup`, user);
    }
}
