import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

interface HotelStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: 'checkin' | 'checkout' | 'booking' | 'cancellation';
  guestName: string;
  roomNumber: string;
  timestamp: Date;
  amount?: number;
}

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotel-dashboard.html',
  styleUrl: './hotel-dashboard.css'
})
export class HotelDashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('notificationBell') notificationBell!: ElementRef;

  // Component state
  currentTime = new Date();
  hotelStats: HotelStats | null = null;
  recentActivities: RecentActivity[] = [];
  notifications: string[] = [];
  notificationCount = 0;
  isLoadingStats = false;
  isLoadingActivities = false;
  
  // Subscription management
  private timeSubscription?: Subscription;
  private statsSubscription?: Subscription;
  private notificationSubscription?: Subscription;

  constructor() {
    // Demonstrate what belongs in constructor
    console.log(' Constructor: Component class instantiated');
    console.log(' Constructor: Initialize basic properties only');
    
    
    this.notifications = []; // Initialize arrays
    this.currentTime = new Date(); // Set initial values
  }

  ngOnInit(): void {
    console.log(' OnInit: Perfect for data loading and subscriptions');
    
    //  This is where HTTP calls belong
    this.loadHotelStats();
    this.loadRecentActivities();
    
    //  This is where subscriptions are set up
    this.startRealTimeUpdates();
    this.startTimeUpdates();
    
    console.log(' OnInit: All initial data loading started');
  }

  ngAfterViewInit(): void {
    console.log(' AfterViewInit: DOM is ready for manipulation');
    
    //  Perfect for DOM manipulation
    if (this.notificationBell) {
      // Add a subtle animation to draw attention
      this.notificationBell.nativeElement.style.transition = 'transform 0.3s ease';
      console.log(' AfterViewInit: Notification bell animation configured');
    }
  }

  ngOnDestroy(): void {
    console.log(' OnDestroy: Cleaning up to prevent memory leaks');
    
    //  Critical: Unsubscribe to prevent memory leaks
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
      console.log(' OnDestroy: Time subscription cleaned up');
    }
    
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
      console.log(' OnDestroy: Stats subscription cleaned up');
    }
    
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      console.log(' OnDestroy: Notification subscription cleaned up');
    }
    
    console.log(' OnDestroy: All subscriptions cleaned up successfully');
  }

  // Simulate API call - this belongs in OnInit
  private loadHotelStats(): void {
    this.isLoadingStats = true;
    console.log(' Loading hotel statistics...');
    
    // Simulate API delay
    setTimeout(() => {
      this.hotelStats = {
        totalRooms: 150,
        occupiedRooms: 127,
        availableRooms: 23,
        pendingCheckIns: 8,
        pendingCheckOuts: 12,
        revenue: 45280.50
      };
      
      this.isLoadingStats = false;
      console.log(' Hotel stats loaded:', this.hotelStats);
    }, 1500);
  }

  private loadRecentActivities(): void {
    this.isLoadingActivities = true;
    console.log(' Loading recent activities...');
    
    setTimeout(() => {
      this.recentActivities = [
        {
          id: '1',
          type: 'checkin',
          guestName: 'John Smith',
          roomNumber: '205',
          timestamp: new Date(),
          amount: 450
        },
        {
          id: '2',
          type: 'booking',
          guestName: 'Maria Garcia',
          roomNumber: '118',
          timestamp: new Date(Date.now() - 300000), // 5 mins ago
          amount: 280
        },
        {
          id: '3',
          type: 'checkout',
          guestName: 'David Wilson',
          roomNumber: '301',
          timestamp: new Date(Date.now() - 600000), // 10 mins ago
          amount: 890
        }
      ];
      
      this.isLoadingActivities = false;
      console.log(' Recent activities loaded:', this.recentActivities.length);
    }, 1000);
  }

  // Real-time updates - subscription setup in OnInit
  private startRealTimeUpdates(): void {
    console.log(' Starting real-time updates...');
    
    // Update stats every 30 seconds
    this.statsSubscription = interval(30000).subscribe(() => {
      console.log(' Updating hotel stats...');
      this.updateStats();
    });

    // Generate notifications every 10 seconds
    this.notificationSubscription = interval(10000).subscribe(() => {
      this.generateNotification();
    });
  }

  private startTimeUpdates(): void {
    // Update time every second
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  private updateStats(): void {
    if (this.hotelStats) {
      // Simulate small changes in occupancy
      const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      this.hotelStats.occupiedRooms = Math.max(0, 
        Math.min(this.hotelStats.totalRooms, this.hotelStats.occupiedRooms + change));
      this.hotelStats.availableRooms = this.hotelStats.totalRooms - this.hotelStats.occupiedRooms;
      
      console.log(' Stats updated:', this.hotelStats);
    }
  }

  private generateNotification(): void {
    const messages = [
      'New booking received for Room 245',
      'Guest checked out from Room 108',
      'Maintenance request for Room 156',
      'Room 203 ready for check-in'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    this.notifications.unshift(randomMessage);
    this.notificationCount++;
    
    // Keep only last 5 notifications
    if (this.notifications.length > 5) {
      this.notifications.pop();
    }
    
    console.log('New notification:', randomMessage);
  }

  // Public methods for template
  refreshDashboard(): void {
    console.log(' Manual refresh triggered');
    this.loadHotelStats();
    this.loadRecentActivities();
  }

  clearNotifications(): void {
    this.notifications = [];
    this.notificationCount = 0;
    console.log('🔔 Notifications cleared');
  }

  getOccupancyPercentage(): number {
    if (!this.hotelStats) return 0;
    return Math.round((this.hotelStats.occupiedRooms / this.hotelStats.totalRooms) * 100);
  }

  getActivityIcon(type: string): string {
    const icons = {
      'checkin': '🏨',
      'checkout': '🚪',
      'booking': '📝',
      'cancellation': '❌'
    };
    return icons[type as keyof typeof icons] || '📋';
  }

  getActivityColor(type: string): string {
    const colors = {
      'checkin': 'text-green-600 bg-green-100',
      'checkout': 'text-blue-600 bg-blue-100',
      'booking': 'text-purple-600 bg-purple-100',
      'cancellation': 'text-red-600 bg-red-100'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  }
}