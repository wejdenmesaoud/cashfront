import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UpdateUserComponent } from './update-user/update-user.component';

@Component({
    selector     : 'users-list',
    templateUrl  : './users-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class UsersListComponent implements AfterViewInit
{
    // Date range selection properties
    private startDate: Date | null = null;
    private endDate: Date | null = null;
    private dateElements: HTMLElement[] = [];

    // User form for update popup
    userForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _dialog: MatDialog
    )
    {
        // Initialize user form
        this.userForm = this._formBuilder.group({
            id: [''],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', Validators.required],
            team: ['', Validators.required],
            gender: ['', Validators.required],
            status: ['active']
        });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        // Get elements
        const dateFilterBtn = document.getElementById('dateFilterBtn');
        const calendarPopup = document.getElementById('calendarPopup');
        const startDateElement = document.getElementById('startDate');
        const endDateElement = document.getElementById('endDate');
        const applyButton = calendarPopup?.querySelector('button');

        // Add click event to date filter button
        if (dateFilterBtn && calendarPopup) {
            dateFilterBtn.addEventListener('click', () => {
                // Toggle calendar popup visibility
                if (calendarPopup.classList.contains('hidden')) {
                    calendarPopup.classList.remove('hidden');
                } else {
                    calendarPopup.classList.add('hidden');
                }
            });

            // Close calendar when clicking outside
            document.addEventListener('click', (event) => {
                if (!dateFilterBtn.contains(event.target as Node) && 
                    !calendarPopup.contains(event.target as Node)) {
                    calendarPopup.classList.add('hidden');
                }
            });
            
            // Setup date selection functionality
            this.setupDateSelection(calendarPopup, startDateElement, endDateElement, applyButton);
        }
    }

    /**
     * Setup date selection functionality
     */
    private setupDateSelection(calendarPopup: HTMLElement, startDateElement: HTMLElement | null, endDateElement: HTMLElement | null, applyButton: Element | null | undefined): void {
        // Get all date elements in the calendar (excluding day names and previous/next month dates)
        const dateElements = calendarPopup.querySelectorAll('.grid > div:not(.text-gray-500):not(.text-gray-400)');
        this.dateElements = Array.from(dateElements) as HTMLElement[];
        
        // Add click event to each date element
        this.dateElements.forEach(element => {
            element.addEventListener('click', () => {
                const selectedDate = new Date(2019, 1, parseInt(element.textContent || '0', 10));
                
                // If no start date is selected or both dates are selected, set as new start date
                if (!this.startDate || (this.startDate && this.endDate)) {
                    this.startDate = selectedDate;
                    this.endDate = null;
                    
                    // Update UI
                    if (startDateElement) {
                        startDateElement.textContent = this.formatDate(this.startDate);
                    }
                    if (endDateElement) {
                        endDateElement.textContent = 'Select date';
                    }
                    
                    // Reset all date elements styling
                    this.resetDateElementsStyle();
                    
                    // Highlight selected start date
                    element.classList.add('bg-blue-500', 'text-white', 'rounded-full');
                } 
                // If only start date is selected, set as end date
                else if (this.startDate && !this.endDate) {
                    // Ensure end date is not before start date
                    if (selectedDate < this.startDate) {
                        this.endDate = this.startDate;
                        this.startDate = selectedDate;
                        
                        // Update UI
                        if (startDateElement) {
                            startDateElement.textContent = this.formatDate(this.startDate);
                        }
                        if (endDateElement) {
                            endDateElement.textContent = this.formatDate(this.endDate);
                        }
                    } else {
                        this.endDate = selectedDate;
                        
                        // Update UI
                        if (endDateElement) {
                            endDateElement.textContent = this.formatDate(this.endDate);
                        }
                    }
                    
                    // Highlight date range
                    this.highlightDateRange();
                }
            });
        });
        
        // Add click event to apply button
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                // Here you would implement filtering logic based on selected date range
                console.log('Filtering by date range:', {
                    from: this.startDate ? this.formatDate(this.startDate) : null,
                    to: this.endDate ? this.formatDate(this.endDate) : null
                });
                
                // Close the calendar popup
                calendarPopup.classList.add('hidden');
            });
        }
    }
    
    /**
     * Format date as DD MMM YYYY
     */
    private formatDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }
    
    /**
     * Reset all date elements to default style
     */
    private resetDateElementsStyle(): void {
        this.dateElements.forEach(element => {
            element.classList.remove('bg-blue-500', 'text-white', 'rounded-full', 'bg-blue-100');
        });
    }
    
    /**
     * Highlight the date range between start and end dates
     */
    private highlightDateRange(): void {
        if (!this.startDate || !this.endDate) {
            return;
        }
        
        // Reset all date elements styling
        this.resetDateElementsStyle();
        
        const startDay = this.startDate.getDate();
        const endDay = this.endDate.getDate();
        
        // Highlight all dates in the range
        this.dateElements.forEach(element => {
            const day = parseInt(element.textContent || '0', 10);
            
            if (day === startDay) {
                // Start date
                element.classList.add('bg-blue-500', 'text-white', 'rounded-full');
            } else if (day === endDay) {
                // End date
                element.classList.add('bg-blue-500', 'text-white', 'rounded-full');
            } else if (day > startDay && day < endDay) {
                // Dates in between
                element.classList.add('bg-blue-100');
            }
        });
    }

    /**
     * Open delete confirmation dialog
     *
     * @param userId
     */
    openDeleteConfirmationDialog(userId: string): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete user',
            message: 'Are you sure you want to delete this user? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                    color: 'warn'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Delete the user
                console.log('User deleted:', userId);
                // Here you would call your user service to delete the user
                // this._userService.deleteUser(userId).subscribe();
            }
        });
    }

    /**
     * Open update user dialog
     *
     * @param user User data
     */
    openUpdateUserDialog(user: any): void {
        // Open the dialog with the UpdateUserComponent
        const dialogRef = this._dialog.open(UpdateUserComponent, {
            width: '500px',
            data: {
                id: user.id || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                team: user.team || '',
                gender: user.gender || '',
                status: user.status || 'active'
            }
        });

        // Subscribe to the dialog closed action
        dialogRef.afterClosed().subscribe((result) => {
            // If result exists (user clicked Save)
            if (result) {
                // Update the user
                console.log('User updated:', result);
                // Here you would call your user service to update the user
                // this._userService.updateUser(result).subscribe();
            }
        });
    }
    }

