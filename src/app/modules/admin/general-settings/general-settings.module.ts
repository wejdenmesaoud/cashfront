import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { GeneralSettingsComponent } from './general-settings.component';

const exampleRoutes: Route[] = [
    {
        path     : '',
        component: GeneralSettingsComponent
    }
];

@NgModule({
    declarations: [
        GeneralSettingsComponent
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes)
    ]
})
export class GeneralSettingsModule
{
}
