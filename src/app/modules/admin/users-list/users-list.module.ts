import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { UsersListComponent } from './users-list.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FuseConfirmationModule } from '@fuse/services/confirmation';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { UpdateUserModule } from './update-user/update-user.module';

const exampleRoutes: Route[] = [
    {
        path     : '',
        component: UsersListComponent
    }
];

@NgModule({
    declarations: [
        UsersListComponent
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes),
        CommonModule,
        MatButtonModule,
        FuseConfirmationModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule
    ]
})
export class UsersListModule
{
}
