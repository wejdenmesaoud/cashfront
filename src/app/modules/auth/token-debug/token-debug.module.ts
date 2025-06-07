import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { TokenDebugComponent } from 'app/modules/auth/token-debug/token-debug.component';
import { tokenDebugRoutes } from 'app/modules/auth/token-debug/token-debug.routing';

@NgModule({
    declarations: [
        TokenDebugComponent
    ],
    imports     : [
        RouterModule.forChild(tokenDebugRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule
    ]
})
export class TokenDebugModule
{
}
