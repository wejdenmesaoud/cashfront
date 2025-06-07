import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Engineer } from 'app/core/models/engineer.model';
import { EngineerService } from 'app/core/services/engineer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector     : 'engineers-list',
    templateUrl  : './engineers-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class EngineersListComponent implements OnInit
{
    engineers: Engineer[] = [];
    filteredEngineers: Engineer[] = [];
    isLoading: boolean = false;
    searchQuery: string = '';
    selectedEngineer: Engineer | null = null;
    isDeleting: boolean = false;
    
    // For edit form
    editForm: FormGroup;
    isEditing: boolean = false;
    formError: string | null = null;

    /**
     * Constructor
     */
    constructor(
        private _engineerService: EngineerService,
        private _snackBar: MatSnackBar,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _dialog: MatDialog
    ) {
        // Initialize the form
        this.editForm = this._formBuilder.group({
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
        this.loadEngineers();
    }

    /**
     * Load engineers from API
     */
    loadEngineers(): void {
        this.isLoading = true;
        this._engineerService.getAllEngineers().subscribe(
            (engineers) => {
                this.engineers = engineers || [];
                this.filteredEngineers = [...this.engineers];
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading engineers:', error);
                this.isLoading = false;
                this._snackBar.open('Error loading engineers. Please try again.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });
            }
        );
    }

    /**
     * Filter engineers based on search query
     */
    filterEngineers(): void {
        if (!this.searchQuery?.trim()) {
            this.filteredEngineers = [...this.engineers];
            return;
        }

        const query = this.searchQuery.toLowerCase().trim();
        this.filteredEngineers = this.engineers.filter(engineer => 
            (engineer.fullName?.toLowerCase().includes(query) ||
            engineer.email?.toLowerCase().includes(query) ||
            engineer.phoneNumber?.includes(query) ||
            engineer.gender?.toLowerCase().includes(query) ||
            engineer.manager?.toLowerCase().includes(query)) ?? false
        );
    }

    /**
     * Open edit form for an engineer
     */
    openEditForm(engineer: Engineer): void {
        this.selectedEngineer = engineer;
        this.editForm.patchValue({
            fullName: engineer.fullName,
            phoneNumber: engineer.phoneNumber,
            email: engineer.email,
            gender: engineer.gender,
            manager: engineer.manager
        });
        this.isEditing = true;
    }

    /**
     * Close edit form
     */
    closeEditForm(): void {
        this.selectedEngineer = null;
        this.editForm.reset();
        this.isEditing = false;
        this.formError = null;
    }

    /**
     * Submit edit form
     */
    submitEditForm(): void {
        // Mark all fields as touched to trigger validation
        this.editForm.markAllAsTouched();

        // Return if the form is invalid
        if (this.editForm.invalid) {
            this.formError = 'Please fill in all required fields correctly.';
            return;
        }

        // Clear any previous errors
        this.formError = null;

        // Prepare engineer data
        const formValue = this.editForm.value;
        const updatedEngineer: Engineer = {
            ...this.selectedEngineer,
            fullName: formValue.fullName,
            phoneNumber: formValue.phoneNumber,
            email: formValue.email,
            gender: formValue.gender,
            manager: formValue.manager
        };

        // Update engineer
        if (this.selectedEngineer && this.selectedEngineer.id) {
            this._engineerService.updateEngineer(this.selectedEngineer.id, updatedEngineer).subscribe(
                (response) => {
                    this._snackBar.open('Engineer updated successfully!', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom'
                    });
                    
                    // Close the form
                    this.closeEditForm();
                    
                    // Reload engineers
                    this.loadEngineers();
                },
                (error) => {
                    console.error('Error updating engineer:', error);
                    this.formError = 'Error updating engineer. Please try again.';
                    this._snackBar.open('Error updating engineer. Please try again.', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom'
                    });
                }
            );
        }
    }

    /**
     * Delete an engineer
     */
    deleteEngineer(engineer: Engineer): void {
        if (confirm(`Are you sure you want to delete ${engineer.fullName}?`)) {
            this.isDeleting = true;
            
            if (engineer.id) {
                this._engineerService.deleteEngineer(engineer.id).subscribe(
                    () => {
                        this._snackBar.open('Engineer deleted successfully!', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom'
                        });
                        
                        // Reload engineers
                        this.loadEngineers();
                        this.isDeleting = false;
                    },
                    (error) => {
                        console.error('Error deleting engineer:', error);
                        this._snackBar.open('Error deleting engineer. Please try again.', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom'
                        });
                        this.isDeleting = false;
                    }
                );
            }
        }
    }

    /**
     * Navigate to add engineer page
     */
    navigateToAddEngineer(): void {
        this._router.navigate(['/add-engineer']);
    }

    /**
     * Check if a form control is invalid and touched
     */
    isControlInvalid(controlName: string): boolean {
        const control = this.editForm.get(controlName);
        return control ? control.invalid && control.touched : false;
    }

    /**
     * Get error message for a form control
     */
    getErrorMessage(controlName: string): string {
        const control = this.editForm.get(controlName);
        
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
