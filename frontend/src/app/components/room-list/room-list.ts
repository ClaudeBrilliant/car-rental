import { Component } from '@angular/core';
import { Room } from '../../models/room';
import { Booking } from '../../models/booking';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-list',
  imports: [FormsModule, CommonModule],
  templateUrl: './room-list.html',
  styleUrl: './room-list.css',
})
export class RoomList {
  showAvailableOnly = false;
  selectedView = 'grid';
  sortBy = 'name';
  rooms: Room[] = [
    {
      id: '1',
      name: 'Beach Front View',
      type: 'En Suite',
      price: 25000,
      available: true,
      image:
        'https://thumbs.dreamstime.com/b/beach-front-holiday-view-africa-use-as-background-image-beach-front-holiday-view-africa-155608942.jpg',
      amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View'],
      rating: 4.5,
      description:
        'Clean Self contained room with a view of the expansive ocean',
    },
    {
      id: '2',
      name: 'Presidential Suite',
      type: 'Master En Suite',
      price: 45000,
      available: true,
      image: 'image.jpeg',
      amenities: [
        'WiFi',
        'Air Conditioning',
        'Mini Bar',
        'Ocean View',
        'Room Service',
        'Personal Pool',
      ],
      rating: 4.5,
      description:
        'Clean Self contained luxurious room with a view of the expansive ocean',
    },
    {
      id: '3',
      name: 'Standard Room',
      type: 'Suite',
      price: 20000,
      available: true,
      image: 'image.jpeg',
      amenities: ['WiFi', 'Air Conditioning', 'Mini Bar'],
      rating: 4.5,
      description:
        'Clean Self contained standard room with a view of the expansive ocean',
    },
  ];

  bookings: Booking[] = [
    {
      id: '1',
      guestName: 'Claude Nyongesa',
      roomId: '1',
      checkIn: '2025-06-22',
      checkOut: '2025-06-29',
      guests: 3,
      status: 'confirmed',
      totalAmount: 16000,
    },
     {
      id: '2',
      guestName: 'Duncan Ochieng',
      roomId: '4',
      checkIn: '2025-06-25',
      checkOut: '2025-06-30',
      guests: 3,
      status: 'pending',
      totalAmount: 29000,
    },
  ];

  viewOptions = [
    {value: 'grid', label: 'Grid View'},
    {value: 'list', label: 'List View'},
    {value: 'table', label: 'Table View'}
  ];

  sortOptions = [
    {value: 'name', label: 'Name'},
    {value: 'price', label: "Price"},
    {value: 'rating', label: 'Rating'},
    {value: 'type', label: 'Type'}
  ];

  getFilteredRooms(): Room[] {
    let filtered = this.rooms;
    
    if (this.showAvailableOnly) {
      filtered = filtered.filter(room => room.available);
    }
    
    // Sort rooms
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    return filtered;
  }

  getRoomStatusBadgeClasses(available: boolean): string {
    return available 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  getPriceRangeClass(price: number): string {
    if (price < 200) return 'text-green-600 bg-green-50';
    if (price < 400) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }
   trackByRoomId(index: number, room: any): any {
    return room.id;
  }

  getRatingStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    if (hasHalfStar) {
      stars.push('half');
    }
    
    while (stars.length < 5) {
      stars.push('empty');
    }
    
    return stars;
  }

  getBookingForRoom(roomId: string): Booking | undefined {
    return this.bookings.find(booking => booking.roomId === roomId);
  }
}
