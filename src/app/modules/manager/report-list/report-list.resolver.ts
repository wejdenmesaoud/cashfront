import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReportDataResolver implements Resolve<any> {
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const reportData = window.history.state.reportData;
        return of(reportData);
    }
}