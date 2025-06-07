import { Component, ViewEncapsulation, AfterViewInit, OnInit } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UpdateUserComponent } from '../users-list/update-user/update-user.component';
import { ManagerService } from 'app/core/services/manager.service';
import { User } from 'app/core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector     : 'managers-list',
    templateUrl  : './managers-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ManagersListComponent implements OnInit, AfterViewInit
{
    // Managers array
    managers: User[] = [];
    isLoading: boolean = false;

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
        private _dialog: MatDialog,
        private _managerService: ManagerService,
        private _snackBar: MatSnackBar
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
     * On init
     */
    ngOnInit(): void {
        this.loadManagers();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Initialize date elements if needed
    }

    /**
     * Load managers from API
     */
    loadManagers(): void {
        this.isLoading = true;
        this._managerService.getAllManagers().subscribe(
            (managers) => {
                // Process managers to ensure all required fields are present
                this.managers = managers.map(manager => {
                    // Generate a username if not present
                    const username = manager.username ||
                                    (manager.firstName && manager.lastName ?
                                    manager.firstName.toLowerCase() + '.' + manager.lastName.toLowerCase() :
                                    'user_' + Math.random().toString(36).substring(2, 8));

                    return {
                        ...manager,
                        // Ensure these fields exist with default values if they don't
                        firstName: manager.firstName || '',
                        lastName: manager.lastName || '',
                        email: manager.email || '',
                        phoneNumber: manager.phoneNumber || '',
                        gender: manager.gender || '',
                        username: username, // Ensure username is present
                        team: manager.team || { id: '', name: 'Not Assigned' }
                    };
                });
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading managers:', error);
                this.isLoading = false;
                this._snackBar.open('Error loading managers. Please try again.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });
            }
        );
    }

    /**
     * Open delete confirmation dialog
     *
     * @param username Manager's username
     */
    openDeleteConfirmationDialog(username: string): void {
        // Check if username is valid
        if (!username) {
            this._snackBar.open('Cannot remove manager role: Invalid username', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
            });
            return;
        }

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Remove Manager Role',
            message: 'Are you sure you want to remove the manager role from this user? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Remove',
                    color: 'warn'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Remove manager role
                this._managerService.removeManagerRole(username).subscribe(
                    (response) => {
                        this._snackBar.open('Manager role removed successfully', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom'
                        });
                        this.loadManagers(); // Reload the managers list
                    },
                    (error) => {
                        console.error('Error removing manager role:', error);
                        this._snackBar.open('Error removing manager role. Please try again.', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom'
                        });
                    }
                );
            }
        });
    }

    /**
     * Open update user dialog
     *
     * @param manager Manager data
     */
    openUpdateUserDialog(manager: User): void {
        // Open the dialog with the UpdateUserComponent
        const dialogRef = this._dialog.open(UpdateUserComponent, {
            width: '500px',
            data: {
                id: manager.id || '',
                firstName: manager.firstName || '',
                lastName: manager.lastName || '',
                email: manager.email || '',
                username: manager.username || '',
                phoneNumber: manager.phoneNumber || '',
                team: manager.team?.id || '',
                gender: manager.gender || '',
                status: 'active'
            }
        });

        // Subscribe to the dialog closed action
        dialogRef.afterClosed().subscribe((result) => {
            // If data was provided (user clicked Save)
            if (result) {
                // Create a user object with the updated data
                const updatedManager: User = {
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    phoneNumber: result.phoneNumber,
                    gender: result.gender,
                    // Keep the original username if available
                    username: manager.username || (result.firstName.toLowerCase() + '.' + result.lastName.toLowerCase()),
                    // Only include password if it was provided and not empty
                    ...(result.password && { password: result.password }),
                    // Include team if it was provided
                    ...(result.team && {
                        team: {
                            id: result.team,
                            name: this.getTeamName(result.team)
                        }
                    }),
                    role: 'manager'
                };

                // Update the manager
                this._managerService.updateManager(result.id, updatedManager).subscribe(
                    (response) => {
                        this._snackBar.open('Manager updated successfully', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom'
                        });

                        // If team was updated, update the team assignment
                        if (result.team && manager.team?.id !== result.team) {
                            // Use the username for team assignment
                            const username = updatedManager.username;
                            this._managerService.updateManagerTeam(result.team, username).subscribe(
                                () => {
                                    this.loadManagers(); // Reload the managers list
                                },
                                (error) => {
                                    console.error('Error updating manager team:', error);
                                    this.loadManagers(); // Still reload the managers list
                                }
                            );
                        } else {
                            this.loadManagers(); // Reload the managers list
                        }
                    },
                    (error) => {
                        console.error('Error updating manager:', error);
                        this._snackBar.open('Error updating manager. Please try again.', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom'
                        });
                    }
                );
            }
        });
    }

    /**
     * Get team name based on team ID
     *
     * @param teamId Team ID
     * @returns Team name
     */
    private getTeamName(teamId: string): string {
        switch(teamId) {
            case 'development':
                return 'Development';
            case 'marketing':
                return 'Marketing';
            case 'sales':
                return 'Sales';
            case 'support':
                return 'Support';
            case 'hr':
                return 'Human Resources';
            default:
                return teamId;
        }
    }
}
