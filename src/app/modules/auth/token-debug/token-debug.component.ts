import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';

@Component({
    selector: 'app-token-debug',
    templateUrl: './token-debug.component.html',
    styleUrls: ['./token-debug.component.scss']
})
export class TokenDebugComponent implements OnInit {
    token: string;
    isTokenExpired: boolean;
    tokenInfo: any;
    localStorage = window.localStorage;

    constructor(private _authService: AuthService) { }

    ngOnInit(): void {
        this.refreshTokenInfo();
    }

    refreshTokenInfo(): void {
        this.token = this._authService.accessToken;
        this.isTokenExpired = AuthUtils.isTokenExpired(this.token);

        try {
            // Try to decode the token
            if (this.token) {
                const parts = this.token.split('.');
                if (parts.length === 3) {
                    const payload = parts[1];
                    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    this.tokenInfo = JSON.parse(jsonPayload);
                }
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            this.tokenInfo = { error: 'Failed to decode token' };
        }
    }

    clearToken(): void {
        localStorage.removeItem('accessToken');
        this.refreshTokenInfo();
    }

    setDummyToken(): void {
        const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        this._authService.accessToken = dummyToken;
        this.refreshTokenInfo();
    }
}
