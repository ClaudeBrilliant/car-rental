import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

interface FleetStats {
  totalVehicles: number;
  rentedVehicles: number;
  availableVehicles: number;
  maintenanceVehicles: number;
  pendingPickups: number;
  pendingReturns: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: 'pickup' | 'return' | 'booking' | 'maintenance';
  customerName: string;
  vehicleModel: string;
  timestamp: Date;
  amount?: number;
}

@Component({
  selector: 'app-fleet-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-dashboard.html',
  styleUrl: './vehicle-dashboard.css'
})
export class VehicleDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('notificationBell') notificationBell!: ElementRef;

  // Component state
  currentTime = new Date();
  fleetStats: FleetStats | null = null;
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
    console.log('🏗️ Constructor: Component class instantiated');
    console.log('🏗️ Constructor: Initialize basic properties only');
    
    // Initialize arrays and basic properties
    this.notifications = [];
    this.currentTime = new Date();
  }

  ngOnInit(): void {
    console.log('🚀 OnInit: Perfect for data loading and subscriptions');
    
    // 🎯 This is where HTTP calls belong
    this.loadFleetStats();
    this.loadRecentActivities();
    
    // 🎯 This is where subscriptions are set up
    this.startRealTimeUpdates();
    this.startTimeUpdates();
    
    console.log('🚀 OnInit: All initial data loading started');
  }

  ngAfterViewInit(): void {
    console.log('🎨 AfterViewInit: DOM is ready for manipulation');
    
    // 🎯 Perfect for DOM manipulation
    if (this.notificationBell) {
      // Add a subtle animation to draw attention
      this.notificationBell.nativeElement.style.transition = 'transform 0.3s ease';
      console.log('🎨 AfterViewInit: Notification bell animation configured');
    }
  }

  ngOnDestroy(): void {
    console.log('🧹 OnDestroy: Cleaning up to prevent memory leaks');
    
    // 🎯 Critical: Unsubscribe to prevent memory leaks
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
      console.log('🧹 OnDestroy: Time subscription cleaned up');
    }
    
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
      console.log('🧹 OnDestroy: Stats subscription cleaned up');
    }
    
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      console.log('🧹 OnDestroy: Notification subscription cleaned up');
    }
    
    console.log('🧹 OnDestroy: All subscriptions cleaned up successfully');
  }

  // Simulate API call - this belongs in OnInit
  private loadFleetStats(): void {
    this.isLoadingStats = true;
    console.log('📊 Loading fleet statistics...');
    
    // Simulate API delay
    setTimeout(() => {
      this.fleetStats = {
        totalVehicles: 85,
        rentedVehicles: 62,
        availableVehicles: 18,
        maintenanceVehicles: 5,
        pendingPickups: 7,
        pendingReturns: 9,
        revenue: 12450.75
      };
      
      this.isLoadingStats = false;
      console.log('📊 Fleet stats loaded:', this.fleetStats);
    }, 1500);
  }

  private loadRecentActivities(): void {
    this.isLoadingActivities = true;
    console.log('📋 Loading recent activities...');
    
    setTimeout(() => {
      this.recentActivities = [
        {
          id: '1',
          type: 'pickup',
          customerName: 'Sarah Johnson',
          vehicleModel: 'Toyota Camry 2023',
          timestamp: new Date(),
          amount: 295
        },
        {
          id: '2',
          type: 'booking',
          customerName: 'Michael Chen',
          vehicleModel: 'Honda Accord 2022',
          timestamp: new Date(Date.now() - 300000), // 5 mins ago
          amount: 450
        },
        {
          id: '3',
          type: 'return',
          customerName: 'Emily Rodriguez',
          vehicleModel: 'Nissan Altima 2023',
          timestamp: new Date(Date.now() - 600000), // 10 mins ago
          amount: 380
        },
        {
          id: '4',
          type: 'maintenance',
          customerName: 'Fleet Manager',
          vehicleModel: 'Ford Explorer 2021',
          timestamp: new Date(Date.now() - 900000), // 15 mins ago
        },
        {
          id: '5',
          type: 'pickup',
          customerName: 'James Wilson',
          vehicleModel: 'Chevrolet Malibu 2023',
          timestamp: new Date(Date.now() - 1200000), // 20 mins ago
          amount: 320
        }
      ];
      
      this.isLoadingActivities = false;
      console.log('📋 Recent activities loaded:', this.recentActivities.length);
    }, 1000);
  }

  // Real-time updates - subscription setup in OnInit
  private startRealTimeUpdates(): void {
    console.log('⚡ Starting real-time updates...');
    
    // Update stats every 30 seconds
    this.statsSubscription = interval(30000).subscribe(() => {
      console.log('⚡ Updating fleet stats...');
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
    if (this.fleetStats) {
      // Simulate small changes in fleet utilization
      const pickupChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const returnChange = Math.floor(Math.random() * 3) - 1;
      
      this.fleetStats.pendingPickups = Math.max(0, this.fleetStats.pendingPickups + pickupChange);
      this.fleetStats.pendingReturns = Math.max(0, this.fleetStats.pendingReturns + returnChange);
      
      // Update revenue slightly
      this.fleetStats.revenue += Math.random() * 100;
      
      console.log('⚡ Stats updated:', this.fleetStats);
    }
  }

  private generateNotification(): void {
    const messages = [
      'Vehicle Toyota Camry ready for pickup',
      'Customer returned Honda Accord early',
      'Maintenance completed on Ford Explorer',
      'New booking received for Nissan Altima',
      'Vehicle inspection required for Chevrolet Malibu',
      'Customer support ticket resolved',
      'Fleet utilization target achieved'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    this.notifications.unshift(randomMessage);
    this.notificationCount++;
    
    // Keep only last 5 notifications
    if (this.notifications.length > 5) {
      this.notifications.pop();
    }
    
    console.log('🔔 New notification:', randomMessage);
  }

  // Public methods for template
  refreshDashboard(): void {
    console.log('🔄 Manual refresh triggered');
    this.loadFleetStats();
    this.loadRecentActivities();
  }

  clearNotifications(): void {
    this.notifications = [];
    this.notificationCount = 0;
    console.log('🔔 Notifications cleared');
    
    // Add visual feedback - DOM manipulation after AfterViewInit
    if (this.notificationBell) {
      this.notificationBell.nativeElement.style.transform = 'scale(1.1)';
      setTimeout(() => {
        if (this.notificationBell) {
          this.notificationBell.nativeElement.style.transform = 'scale(1)';
        }
      }, 200);
    }
  }

  getUtilizationPercentage(): number {
    if (!this.fleetStats) return 0;
    return Math.round((this.fleetStats.rentedVehicles / this.fleetStats.totalVehicles) * 100);
  }

  getActivityIcon(type: string): string {
    const icons = {
      'pickup': '🚗',
      'return': '🏁',
      'booking': '📝',
      'maintenance': '🔧'
    };
    return icons[type as keyof typeof icons] || '📋';
  }

  getActivityColor(type: string): string {
    const colors = {
      'pickup': 'bg-green-100 text-green-800',
      'return': 'bg-blue-100 text-blue-800',
      'booking': 'bg-purple-100 text-purple-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }
}