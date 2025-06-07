import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';

@Injectable()
export class AuthInterceptor implements HttpInterceptor
{
    /**
     * Constructor
     */
    constructor(private _authService: AuthService)
    {
    }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        // Clone the request object
        let newReq = req.clone();

        // Request
        //
        // If the access token didn't expire, add the Authorization header.
        // We won't add the Authorization header if the access token expired.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and delete the access token from the local storage while logging
        // the user out from the app.
        console.log('Interceptor - Request URL:', req.url);

        const token = this._authService.accessToken;
        console.log('Interceptor - Token available:', !!token);

        if (token) {
            const isExpired = AuthUtils.isTokenExpired(token);
            console.log('Interceptor - Token expired?', isExpired);

            if (!isExpired) {
                console.log('Interceptor - Adding Authorization header');
                newReq = req.clone({
                    headers: req.headers.set('Authorization', 'Bearer ' + token)
                });
            } else {
                console.log('Interceptor - Token expired, not adding Authorization header');
            }
        } else {
            console.log('Interceptor - No token available, not adding Authorization header');
        }

        // Response
        return next.handle(newReq).pipe(
            catchError((error) => {
                console.log('Interceptor - HTTP error:', error);

                // Catch "401 Unauthorized" responses
                if ( error instanceof HttpErrorResponse && error.status === 401 )
                {
                    console.log('Interceptor - 401 Unauthorized response, signing out');
                    // Sign out
                    this._authService.signOut();

                    // Reload the app
                    location.reload();
                }

                return throwError(error);
            })
        );
    }
}
