import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Engineer } from 'app/core/models/engineer.model';
import { EngineerService } from 'app/core/services/engineer.service';
import { ManagerService } from 'app/core/services/manager.service';
import { User } from 'app/core/models/user.model';

@Component({
    selector     : 'add-engineer',
    templateUrl  : './add-engineer.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AddEngineerComponent implements OnInit
{
    engineerForm: FormGroup;
    isSubmitting: boolean = false;
    formError: string | null = null;
    managers: User[] = [];
    isLoadingManagers: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _engineerService: EngineerService,
        private _managerService: ManagerService,
        private _snackBar: MatSnackBar,
        private _router: Router
    ) {
        // Initialize the form
        this.engineerForm = this._formBuilder.group({
            fullName: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            gender: ['', [Validators.required]],
            manager: ['', [Validators.required]]
        });
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Load managers for dropdown
        this.loadManagers();
    }

    /**
     * Load managers from API
     */
    loadManagers(): void {
        this.isLoadingManagers = true;
        this._managerService.getAllManagers().subscribe(
            (managers) => {
                this.managers = managers;
                this.isLoadingManagers = false;
            },
            (error) => {
                console.error('Error loading managers:', error);
                this.isLoadingManagers = false;
                this._snackBar.open('Error loading managers. Please try again.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });
            }
        );
    }

    /**
     * Submit the form
     */
    onSubmit(): void {
        // Mark all fields as touched to trigger validation
        this.engineerForm.markAllAsTouched();

        // Return if the form is invalid
        if (this.engineerForm.invalid) {
            this.formError = 'Please fill in all required fields correctly.';
            return;
        }

        // Clear any previous errors
        this.formError = null;
        this.isSubmitting = true;

        // Prepare engineer data
        const formValue = this.engineerForm.value;
        const engineer: Engineer = {
            fullName: formValue.fullName,
            phoneNumber: formValue.phoneNumber,
            email: formValue.email,
            gender: formValue.gender,
            manager: formValue.manager
        };

        // Create engineer
        this._engineerService.createEngineer(engineer).subscribe(
            (response) => {
                this.isSubmitting = false;
                this._snackBar.open('Engineer added successfully!', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });

                // Reset the form
                this.engineerForm.reset();

                // Navigate to engineers list
                this._router.navigate(['/engineers-list']);
            },
            (error) => {
                this.isSubmitting = false;
                console.error('Error creating engineer:', error);
                this.formError = 'Error creating engineer. Please try again.';
                this._snackBar.open('Error creating engineer. Please try again.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });
            }
        );
    }

    /**
     * Check if a form control is invalid and touched
     *
     * @param controlName Form control name
     * @returns True if the control is invalid and touched
     */
    isControlInvalid(controlName: string): boolean {
        const control = this.engineerForm.get(controlName);
        return control ? control.invalid && control.touched : false;
    }

    /**
     * Get error message for a form control
     *
     * @param controlName Form control name
     * @returns Error message
     */
    getErrorMessage(controlName: string): string {
        const control = this.engineerForm.get(controlName);

        if (!control) {
            return '';
        }

        if (control.hasError('required')) {
            return 'This field is required';
        }

        if (control.hasError('email')) {
            return 'Please enter a valid email address';
        }

        return '';
    }
}
