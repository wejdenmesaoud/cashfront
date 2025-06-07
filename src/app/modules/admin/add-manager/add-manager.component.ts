import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FuseAlertType } from '@fuse/components/alert';

import { ManagerService } from 'app/core/services/manager.service';
import { User } from 'app/core/models/user.model';
import { Team } from 'app/core/models/team.model';

@Component({
    selector     : 'add-manager',
    templateUrl  : './add-manager.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AddManagerComponent implements OnInit
{
    managerForm: FormGroup;
    isSubmitting: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _managerService: ManagerService,
        private _snackBar: MatSnackBar,
        private _router: Router
    )
    {}

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.managerForm = this._formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            gender: ['', Validators.required],
            team: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    /**
     * Submit the form
     */
    submitForm(): void {
        // Return if the form is invalid
        if (this.managerForm.invalid) {
            return;
        }

        // Disable the form
        this.managerForm.disable();
        this.isSubmitting = true;
        this.showAlert = false;

        // Proceed with creating manager directly
        this.createManager();
    }

    /**
     * Create manager
     */
    private createManager(): void {
        // Prepare manager data
        const formValue = this.managerForm.value;
        // Get team name based on selected team ID
        let teamName = '';
        switch(formValue.team) {
            case 'development':
                teamName = 'Development';
                break;
            case 'marketing':
                teamName = 'Marketing';
                break;
            case 'sales':
                teamName = 'Sales';
                break;
            case 'support':
                teamName = 'Support';
                break;
            case 'hr':
                teamName = 'Human Resources';
                break;
            default:
                teamName = formValue.team;
        }

        // Generate a username based on first and last name
        const username = formValue.firstName.toLowerCase() +
                        (formValue.lastName ? '.' + formValue.lastName.toLowerCase() : '');

        const manager: User = {
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email,
            password: formValue.password,
            username: username, // Include the username
            role: 'manager',
            // Additional fields
            phoneNumber: formValue.phone,
            gender: formValue.gender,
            team: {
                id: formValue.team,
                name: teamName
            } as Team
        };

        // Create user first
        this._managerService.createManager(manager).subscribe(
            (response) => {
                // We need to use the username to add the manager role
                // The username is already in the manager object
                const username = manager.username;

                // Add manager role to the user
                this._managerService.addManagerRole(username).subscribe(
                    () => {
                        // Show success message
                        this._snackBar.open('Manager created successfully', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom'
                        });

                        // If team is selected, assign manager to team
                        if (manager.team && manager.team.id && username) {
                            this._managerService.updateManagerTeam(manager.team.id, username).subscribe(
                                () => {
                                    // Navigate to managers list
                                    this._router.navigate(['/managers-list']);
                                },
                                (error) => {
                                    console.error('Error assigning team to manager:', error);
                                    // Still navigate to managers list even if team assignment fails
                                    this._router.navigate(['/managers-list']);
                                }
                            );
                        } else {
                            // Navigate to managers list
                            this._router.navigate(['/managers-list']);
                        }
                    },
                    (error) => {
                        console.error('Error adding manager role:', error);
                        // Re-enable the form
                        this.managerForm.enable();
                        this.isSubmitting = false;

                        // Show error message
                        this.alert = {
                            type: 'error',
                            message: 'Error adding manager role: ' + (error.error?.message || error.message || 'Unknown error')
                        };
                        this.showAlert = true;
                    }
                );
            },
            (error) => {
                // Re-enable the form
                this.managerForm.enable();
                this.isSubmitting = false;

                // Show error message
                this.alert = {
                    type: 'error',
                    message: 'Error creating user: ' + (error.error?.message || error.message || 'Unknown error')
                };
                this.showAlert = true;
            }
        );
    }


}
