import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { ApiService } from 'app/core/api/api.service';

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _apiService: ApiService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        console.log('Setting accessToken:', token);
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        const token = localStorage.getItem('accessToken') ?? '';
        console.log('Getting accessToken:', token);
        return token;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        // Convert email field to username for API compatibility
        const apiCredentials = {
            username: credentials.email, // Using email field as username
            password: credentials.password
        };

        return this._apiService.signIn(apiCredentials).pipe(
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user || {
                    id: 'user-id',
                    name: apiCredentials.username,
                    email: apiCredentials.username,
                    avatar: 'assets/images/avatars/brian-hughes.jpg',
                    status: 'online'
                };

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // Renew token
        return this._httpClient.post('api/auth/refresh-access-token', {
            accessToken: this.accessToken
        }).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string; role: string }): Observable<any>
    {
        // Convert to API format
        const apiUser = {
            username: user.name,
            email: user.email,
            password: user.password,
            role: [user.role] // Use selected role
        };

        return this._apiService.signUp(apiUser);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        console.log('Checking authentication status');

        // Check if the user is logged in
        if ( this._authenticated )
        {
            console.log('User is already authenticated');
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            console.log('No access token available');
            return of(false);
        }

        // Check the access token expire date
        const isExpired = AuthUtils.isTokenExpired(this.accessToken);
        console.log('Token expired?', isExpired);
        if ( isExpired )
        {
            return of(false);
        }

        console.log('Token is valid, signing in using token');
        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
