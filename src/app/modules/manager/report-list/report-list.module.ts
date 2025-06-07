import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReportListComponent } from './report-list.component';
import { ReportDataResolver } from './report-list.resolver';

const routes: Route[] = [
    {
        path: '',
        component: ReportListComponent,
        resolve: {
            reportData: ReportDataResolver
        }
    }
];

@NgModule({
    declarations: [
        ReportListComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule
    ]
})
export class ReportListModule
{
}
