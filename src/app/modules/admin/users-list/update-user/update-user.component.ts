import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'update-user',
    templateUrl: './update-user.component.html'
})
export class UpdateUserComponent implements OnInit {
    // User form
    userForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<UpdateUserComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // Initialize user form
        this.userForm = this._formBuilder.group({
            id: [''],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            username: [''],
            phoneNumber: ['', Validators.required],
            team: ['', Validators.required],
            gender: ['', Validators.required],
            status: ['active']
        });
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Fill the form with user data if provided
        if (this.data) {
            this.userForm.patchValue({
                id: this.data.id || '',
                firstName: this.data.firstName || '',
                lastName: this.data.lastName || '',
                email: this.data.email || '',
                username: this.data.username || '',
                phoneNumber: this.data.phoneNumber || '',
                team: this.data.team || '',
                gender: this.data.gender || '',
                status: this.data.status || 'active'
            });
        }
    }

    /**
     * Save user
     */
    saveUser(): void {
        if (this.userForm.valid) {
            this.dialogRef.close(this.userForm.value);
        }
    }

    /**
     * Cancel
     */
    cancel(): void {
        this.dialogRef.close();
    }
}