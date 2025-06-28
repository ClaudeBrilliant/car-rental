import { Component, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval } from 'rxjs';

import { Room } from '../../models/room';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css'
})
export class Rooms {
  // Properties for demonstration
  hotelName = 'Grand Palace Hotel';
  currentDate = new Date();
  isHotelOpen = true;
  guestCount = 0;
  searchTerm = '';
  selectedRoomType = '';
  selectedRoomId = signal<string | null>(null);
  showFilters = signal(true);
  isLoading = signal(false);
  
  // Array of rooms for demonstrations
  rooms: Room[] = [
    {
      id: '1',
      name: 'Deluxe Ocean View',
      type: 'Deluxe',
      price: 250,
      available: true,
      image: 'https://via.placeholder.com/300x200',
      amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View'],
      rating: 4.8,
      description: 'Beautiful room with stunning ocean views'
    },
    {
      id: '2',
      name: 'Standard City Room',
      type: 'Standard',
      price: 150,
      available: false,
      image: 'https://via.placeholder.com/300x200',
      amenities: ['WiFi', 'Air Conditioning', 'TV'],
      rating: 4.2,
      description: 'Comfortable standard room in the heart of the city'
    },
    {
      id: '3',
      name: 'Presidential Suite',
      type: 'Suite',
      price: 500,
      available: true,
      image: 'https://via.placeholder.com/300x200',
      amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Butler Service'],
      rating: 5.0,
      description: 'Luxurious suite with premium amenities'
    }
  ];

   roomsSignal = signal<Room[]>([
   {
      id: '1',
      name: 'Deluxe Ocean View',
      type: 'Deluxe',
      price: 250,
      available: true,
      image: 'https://via.placeholder.com/300x200',
      amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View'],
      guest: 'John Doe',
      status: 'Available',
      rating: 4.8,
      description: 'Beautiful room with stunning ocean views'
    },
    {
      id: '2',
      name: 'Standard City Room',
      type: 'Standard',
      price: 150,
      available: false,
      status: 'Maintainance',
      image: 'https://via.placeholder.com/300x200',
      amenities: ['WiFi', 'Air Conditioning', 'TV'],
      rating: 4.2,
      description: 'Comfortable standard room in the heart of the city'
    },
    {
      id: '3',
      name: 'Presidential Suite',
      type: 'Suite',
      price: 500,
      available: true,
      status: 'Occupied',
      image: 'https://via.placeholder.com/300x200',
      amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Butler Service'],
      rating: 5.0,
      description: 'Luxurious suite with premium amenities'
    }
  ]);

  roomTypes = ['All', 'Standard', 'Deluxe', 'Suite'];


   filterSignal = signal({
    status: '' as string,
    type: '' as string,
    availableOnly: false
  });

  filteredRooms = computed(() => {
    const rooms = this.roomsSignal();
    const filter = this.filterSignal();
    
    console.log('🔄 Computed: Filtering rooms...');
    
    return rooms.filter(room => {
      if (filter.status && room.status !== filter.status) return false;
      if (filter.type && room.type !== filter.type) return false;
      if (filter.availableOnly && room.status !== 'available') return false;
      return true;
    });
  });


  roomStats = computed(() => {
    const rooms = this.roomsSignal();
    const stats = {
      total: rooms.length,
      available: rooms.filter(r => r.status === 'available').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      cleaning: rooms.filter(r => r.status === 'cleaning').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
      occupancyRate: 0
    };
    
    stats.occupancyRate = Math.round((stats.occupied / stats.total) * 100);
    
    console.log('📊 Computed: Room stats updated', stats);
    return stats;
  });
  
  // 6. Computed signal for revenue
  totalRevenue = computed(() => {
    const occupiedRooms = this.roomsSignal().filter(r => r.status === 'occupied');
    const revenue = occupiedRooms.reduce((sum, room) => sum + room.price!, 0);
    console.log('💰 Computed: Revenue calculated', revenue);
    return revenue;
  });
  
  // 7. Computed signal for selected room details
  selectedRoom = computed(() => {
    const roomId = this.selectedRoomId();
    const rooms = this.roomsSignal();
    return roomId ? rooms.find(r => r.id === (roomId)) || null : null;
  });


  constructor() {
    // 8. Effects - React to signal changes
    effect(() => {
      const stats = this.roomStats();
      console.log('🔔 Effect: Room stats changed!', `Occupancy: ${stats.occupancyRate}%`);
      
      // Alert when occupancy is high
      if (stats.occupancyRate >= 80) {
        console.log('⚠️ Effect: High occupancy alert!');
      }
    });
    
    effect(() => {
      const selected = this.selectedRoom();
      if (selected) {
        console.log(`🏠 Effect: Room ${selected.number} selected (${selected.status})`);
      }
    });
    
    effect(() => {
      const revenue = this.totalRevenue();
      console.log(`💰 Effect: Revenue updated: $${revenue}`);
    });
  }


  selectRoom(roomId: string): void {
    console.log('👆 Action: Selecting room', roomId);
    this.selectedRoomId.set(roomId);
  }
  
  updateRoomStatus(roomId: string, newStatus: Room['status'], guest?: string): void {
    console.log('🔄 Action: Updating room status', { roomId, newStatus, guest });
    
    this.roomsSignal.update(rooms => 
      rooms.map(room => 
        room.id === (roomId )
          ? { ...room, status: newStatus, guest: newStatus === 'occupied' ? guest : undefined }
          : room
      )
    );
  }
  
  // Filter methods using signals
  updateFilter(criteria: Partial<{ status: string; type: string; availableOnly: boolean }>): void {
    console.log('🔍 Action: Updating filter', criteria);
    this.filterSignal.update(current => ({ ...current, ...criteria }));
  }
  
  clearFilters(): void {
    console.log('🧹 Action: Clearing filters');
    this.filterSignal.set({ status: '', type: '', availableOnly: false });
  }
  
  toggleFilters(): void {
    this.showFilters.update(current => !current);
  }
  
  // Quick actions for demo
  checkInGuest(roomId: string): void {
    const guestName = prompt('Enter guest name:');
    if (guestName) {
      this.updateRoomStatus(roomId, 'occupied', guestName);
    }
  }
  
  checkOutGuest(roomId: string): void {
    this.updateRoomStatus(roomId, 'cleaning');
  }
  
  markRoomClean(roomId: string): void {
    this.updateRoomStatus(roomId, 'available');
  }
  
  scheduleMaintenance(roomId: string): void {
    this.updateRoomStatus(roomId, 'maintenance');
  }
  
  // 10. Simulate real-time updates
  private startRealTimeUpdates(): void {
    interval(10000).subscribe(() => {
      const rooms = this.roomsSignal();
      const cleaningRooms = rooms.filter(r => r.status === 'cleaning');
      
      if (cleaningRooms.length > 0 && Math.random() > 0.7) {
        const randomRoom = cleaningRooms[Math.floor(Math.random() * cleaningRooms.length)];
        console.log('🤖 Auto: Room cleaning completed', randomRoom.number);
        this.markRoomClean(randomRoom.id.toString());
      }
    });
  }

  // Helper methods for template
  getStatusColor(status: string): string {
    const colors = {
      'available': 'bg-green-100 text-green-800',
      'occupied': 'bg-blue-100 text-blue-800',
      'cleaning': 'bg-yellow-100 text-yellow-800',
      'maintenance': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  }
  
  getRoomTypeIcon(type: string): string {
    const icons = { 'standard': '🛏️', 'deluxe': '🏨', 'suite': '👑' };
    return icons[type as keyof typeof icons] || '🏠';
  }

  // Event binding methods
  onBookRoom(roomId: string): void {
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      alert(`Booking room: ${room.name}`);
      room.available = false;
    }
  }

  onGuestCountChange(count: number): void {
    this.guestCount = count;
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    console.log('Searching for:', term);
  }

  onRoomTypeChange(type: string): void {
    this.selectedRoomType = type;
  }

  toggleHotelStatus(): void {
    this.isHotelOpen = !this.isHotelOpen;
  }

  // Method for template usage
  getRoomStatusClass(available: boolean): string {
    return available ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  }

  getFilteredRooms(): Room[] {
    let filtered = this.rooms;
    
    if (this.selectedRoomType && this.selectedRoomType !== 'All') {
      filtered = filtered.filter(room => room.type === this.selectedRoomType);
    }
    
    if (this.searchTerm) {
      filtered = filtered.filter(room => 
        room.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        room.type?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }

}
