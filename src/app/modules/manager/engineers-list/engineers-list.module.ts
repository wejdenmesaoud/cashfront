import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { FuseAlertModule } from '@fuse/components/alert';

import { EngineersListComponent } from './engineers-list.component';

const exampleRoutes: Route[] = [
    {
        path     : '',
        component: EngineersListComponent
    }
];

@NgModule({
    declarations: [
        EngineersListComponent
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatSnackBarModule,
        MatDialogModule,
        FuseAlertModule
    ]
})
export class EngineersListModule
{
}
