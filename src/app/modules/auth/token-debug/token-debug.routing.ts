import { Route } from '@angular/router';
import { TokenDebugComponent } from 'app/modules/auth/token-debug/token-debug.component';

export const tokenDebugRoutes: Route[] = [
    {
        path     : '',
        component: TokenDebugComponent
    }
];
