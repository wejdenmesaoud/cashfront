import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ManagersListComponent } from './managers-list.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FuseConfirmationModule } from '@fuse/services/confirmation';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes: Route[] = [
    {
        path     : '',
        component: ManagersListComponent
    }
];

@NgModule({
    declarations: [
        ManagersListComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        CommonModule,
        MatButtonModule,
        FuseConfirmationModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatSnackBarModule
    ]
})
export class ManagersListModule
{
}
