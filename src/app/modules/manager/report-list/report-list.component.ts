import { Component, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CaseService } from 'app/core/services/case.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

interface EngineerReport {
    engineerName: string;
    chatCount: number;
    caseCount: number;
    totalCount: number;
}

@Component({
    selector     : 'report-list',
    templateUrl  : './report-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ReportListComponent implements AfterViewInit
{
    dataSource: MatTableDataSource<EngineerReport>;
    displayedColumns: string[] = ['engineerName', 'chatCount', 'caseCount', 'totalCount'];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    // Date range selection properties
    private startDate: Date | null = null;
    private endDate: Date | null = null;
    private dateElements: HTMLElement[] = [];

    /**
     * Constructor
     */
    constructor(
        private _caseService: CaseService,
        private _snackBar: MatSnackBar,
        private _route: ActivatedRoute
    )
    {
        this.dataSource = new MatTableDataSource<EngineerReport>([]);

        // Get any state passed during navigation
        const navigation = this._route.snapshot.data;
        if (navigation && navigation['reportData']) {
            this.processReportData(navigation['reportData']);
        }

        // Initialize with default date range (current month)
        const today = new Date();
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1); // First day of current month
        this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        // Set up pagination and sorting
        if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }

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
     * Process the report data received from cases-list
     */
    private processReportData(data: any): void {
        try {
            // Transform the data into EngineerReport format
            const reports = this.transformReportData(data);
            this.dataSource.data = reports;
        } catch (error) {
            console.error('Error processing report data:', error);
            this._snackBar.open('Error processing report data', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
            });
        }
    }

    /**
     * Transform raw report data into EngineerReport format
     */
    private transformReportData(data: any[]): EngineerReport[] {
        const engineerMap = new Map<string, EngineerReport>();

        data.forEach(item => {
            const engineerName = item.engineers?.[0]?.fullName || 'Unassigned';
            
            if (!engineerMap.has(engineerName)) {
                engineerMap.set(engineerName, {
                    engineerName,
                    chatCount: 0,
                    caseCount: 0,
                    totalCount: 0
                });
            }

            const report = engineerMap.get(engineerName);
            if (report) {
                if (item.type === 'chat') {
                    report.chatCount++;
                } else {
                    report.caseCount++;
                }
                report.totalCount++;
            }
        });

        return Array.from(engineerMap.values());
    }

    /**
     * Export the current report data
     */
    exportReport(): void {
        // TODO: Implement export functionality
        // This will be implemented later to export to Excel/CSV
    }
}
