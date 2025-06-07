import { Component, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CaseService } from 'app/core/services/case.service';
import { Case } from 'app/core/models/case.model';
import { EngineerService } from 'app/core/services/engineer.service';
import { Engineer } from 'app/core/models/engineer.model';
import * as XLSX from 'xlsx';

@Component({
    selector     : 'cases-list',
    templateUrl  : './cases-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CasesListComponent implements OnInit, AfterViewInit
{
    // Date range selection properties
    private startDate: Date | null = null;
    private endDate: Date | null = null;
    private dateElements: HTMLElement[] = [];

    // Cases data
    cases: Case[] = [];
    engineers: Engineer[] = [];
    dataSource: MatTableDataSource<Case>;
    displayedColumns: string[] = ['id', 'engineer', 'caseDescription', 'date', 'cesRating', 'surveySource', 'actions'];
    isFiltering: boolean = false;

    // File upload
    @ViewChild('fileInput') fileInput: ElementRef;
    isUploading: boolean = false;

    // Pagination and sorting
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    // Current month and year
    currentMonth: string;
    currentYear: number;
    currentMonthIndex: number;
    calendarDays: { day: number; isCurrentMonth: boolean }[] = [];

    /**
     * Constructor
     */
    constructor(
        private _caseService: CaseService,
        private _engineerService: EngineerService,
        private _snackBar: MatSnackBar,
        private _router: Router
    )
    {
        // Initialize the data source
        this.dataSource = new MatTableDataSource<Case>([]);
        
        // Initialize current month and year
        const now = new Date();
        this.currentMonthIndex = now.getMonth();
        this.currentMonth = now.toLocaleString('default', { month: 'long' });
        this.currentYear = now.getFullYear();
        
        // Generate initial calendar
        this.generateCalendarDays(this.currentYear, this.currentMonthIndex);
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Load cases and engineers
        this.loadCases();
        this.loadEngineers();
    }

    /**
     * Load all cases
     */
    loadCases(): void
    {
        this._caseService.getAllCases().subscribe(
            (cases) => {
                this.cases = cases;
                this.dataSource.data = cases;

                // Set up pagination and sorting after data is loaded
                setTimeout(() => {
                    if (this.paginator && this.sort) {
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                    }
                });
            },
            (error) => {
                console.error('Error loading cases:', error);
                this._snackBar.open('Error loading cases. Please try again.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });
            }
        );
    }

    /**
     * Load all engineers
     */
    loadEngineers(): void
    {
        this._engineerService.getAllEngineers().subscribe(
            (engineers) => {
                this.engineers = engineers;
            },
            (error) => {
                console.error('Error loading engineers:', error);
            }
        );
    }

    /**
     * Filter cases by date range
     */
    filterCasesByDateRange(): void {
        if (this.startDate && this.endDate) {
            this.isFiltering = true;
            // Convert to the start and end of the day to include all cases for those days
            const startOfDay = new Date(this.startDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(this.endDate.setHours(23, 59, 59, 999));

            // Filter the cases array directly
            const filteredCases = this.cases.filter(caseItem => {
                const caseDate = new Date(caseItem.date);
                return caseDate >= startOfDay && caseDate <= endOfDay;
            });

            this.dataSource.data = filteredCases;
            
            if (this.paginator) {
                this.paginator.firstPage();
            }
            this.isFiltering = false;

            // Show feedback to user
            const count = filteredCases.length;
            this._snackBar.open(`Found ${count} case${count !== 1 ? 's' : ''} in selected date range`, 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
            });
        }
    }

    /**
     * Trigger file input click
     */
    triggerFileInput(): void
    {
        this.fileInput.nativeElement.click();
    }

    /**
     * Handle file upload
     */
    onFileSelected(event: Event): void
    {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            return;
        }

        const file = input.files[0];

        // Check if file is an Excel file
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            this._snackBar.open('Please select an Excel file (.xlsx or .xls)', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
            });
            return;
        }

        this.isUploading = true;

        // Option 1: Use the API endpoint to upload the file
        this._caseService.uploadCasesFromExcel(file).subscribe(
            (response) => {
                this.isUploading = false;
                this._snackBar.open('Cases uploaded successfully!', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });

                // Reload cases
                this.loadCases();
            },
            (error) => {
                this.isUploading = false;
                console.error('Error uploading cases:', error);
                this._snackBar.open('Error uploading cases. Please try again.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });
            }
        );

        // Reset file input
        input.value = '';
    }

    /**
     * Delete a case
     */
    deleteCase(id: string): void
    {
        if (confirm('Are you sure you want to delete this case?')) {
            this._caseService.deleteCase(id).subscribe(
                () => {
                    this._snackBar.open('Case deleted successfully!', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom'
                    });

                    // Reload cases
                    this.loadCases();
                },
                (error) => {
                    console.error('Error deleting case:', error);
                    this._snackBar.open('Error deleting case. Please try again.', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom'
                    });
                }
            );
        }
    }

    /**
     * Generate report from current cases
     */
    generateReport(): void {
        // Get the current filtered cases from the data source
        const cases = this.dataSource.filteredData;
        
        if (cases.length === 0) {
            this._snackBar.open('No cases available to generate report', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
            });
            return;
        }

        // Call the API to generate report
        this._caseService.generateReport(cases).subscribe(
            () => {
                // Navigate to the report page
                this._router.navigate(['/report-list']);
            },
            (error) => {
                console.error('Error generating report:', error);
                this._snackBar.open('Error generating report. Please try again.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });
            }
        );
    }

    /**
     * Reset filters and restore original data
     */
    resetFilter(): void {
        // Reset date selection
        this.startDate = null;
        this.endDate = null;

        // Reset UI elements
        const startDateElement = document.getElementById('startDate');
        const endDateElement = document.getElementById('endDate');
        if (startDateElement) startDateElement.textContent = 'Select date';
        if (endDateElement) endDateElement.textContent = 'Select date';

        // Reset calendar styling
        this.resetDateElementsStyle();

        // Reload all cases
        this.loadCases();
    }

    /**
     * Navigate to previous month
     */
    previousMonth(): void {
        if (this.currentMonthIndex === 0) {
            this.currentMonthIndex = 11;
            this.currentYear--;
        } else {
            this.currentMonthIndex--;
        }
        
        const date = new Date(this.currentYear, this.currentMonthIndex);
        this.currentMonth = date.toLocaleString('default', { month: 'long' });
        this.generateCalendarDays(this.currentYear, this.currentMonthIndex);
    }

    /**
     * Navigate to next month
     */
    nextMonth(): void {
        if (this.currentMonthIndex === 11) {
            this.currentMonthIndex = 0;
            this.currentYear++;
        } else {
            this.currentMonthIndex++;
        }
        
        const date = new Date(this.currentYear, this.currentMonthIndex);
        this.currentMonth = date.toLocaleString('default', { month: 'long' });
        this.generateCalendarDays(this.currentYear, this.currentMonthIndex);
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

        // Set up pagination and sorting
        if (this.dataSource.data.length > 0) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }
    }

    /**
     * Setup date selection functionality
     */
    private setupDateSelection(calendarPopup: HTMLElement, startDateElement: HTMLElement | null, endDateElement: HTMLElement | null, applyButton: Element | null | undefined): void {
        // Get all date elements in the calendar (excluding day names)
        const dateElements = calendarPopup.querySelectorAll('.grid > div:not(.text-xs.font-medium)');
        this.dateElements = Array.from(dateElements) as HTMLElement[];

        // Add click event to each date element
        this.dateElements.forEach(element => {
            element.addEventListener('click', () => {
                // Skip if not current month
                if (element.classList.contains('text-gray-400')) {
                    return;
                }

                const day = parseInt(element.textContent?.trim() || '0', 10);
                const selectedDate = new Date(this.currentYear, this.currentMonthIndex, day);

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
        const applyFilterButton = calendarPopup.querySelector('#applyFilterButton');
        if (applyFilterButton) {
            applyFilterButton.addEventListener('click', () => {
                // Filter cases by date range
                if (this.startDate && this.endDate) {
                    this.filterCasesByDateRange();
                    calendarPopup.classList.add('hidden');
                } else {
                    this._snackBar.open('Please select both start and end dates', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom'
                    });
                }
            });
        }
    }

    /**
     * Generate calendar days for the given month
     */
    private generateCalendarDays(year: number, month: number): void {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        // Clear existing calendar days
        this.calendarDays = [];

        // Add days from previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            this.calendarDays.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false
            });
        }

        // Add days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            this.calendarDays.push({
                day: i,
                isCurrentMonth: true
            });
        }

        // Add days from next month
        const remainingDays = 42 - this.calendarDays.length; // 6 rows * 7 days = 42
        for (let i = 1; i <= remainingDays; i++) {
            this.calendarDays.push({
                day: i,
                isCurrentMonth: false
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
            if (!element.classList.contains('text-gray-400')) {
                const day = parseInt(element.textContent || '0', 10);
                
                if (day === startDay) {
                    // Start date
                    element.classList.add('bg-blue-500', 'text-white', 'rounded-full');
                } else if (day === endDay) {
                    // End date
                    element.classList.add('bg-blue-500', 'text-white', 'rounded-full');
                } else if (day > Math.min(startDay, endDay) && day < Math.max(startDay, endDay)) {
                    // Dates in between
                    element.classList.add('bg-blue-100');
                }
            }
        });
    }
}
