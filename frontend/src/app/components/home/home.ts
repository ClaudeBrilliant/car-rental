import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { NavbarComponent } from "../navbar/navbar"
import { FormsModule } from "@angular/forms"
import { VehicleService } from "../../services/vehicle.service"
import { Vehicle } from "../models/vehicle"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  featuredVehicles: Vehicle[] = []
  isLoading = true
  searchParams = {
    location: "",
    startDate: "",
    endDate: "",
  }

  // Animation states
  heroVisible = false
  featuresVisible = false

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadFeaturedVehicles()
    
    // Trigger animations after component loads
    setTimeout(() => {
      this.heroVisible = true
    }, 100)
    
    setTimeout(() => {
      this.featuresVisible = true
    }, 600)
  }

  loadFeaturedVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.featuredVehicles = vehicles.slice(0, 6)
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading featured vehicles:", error)
        this.isLoading = false
      },
    })
  }

  searchVehicles(): void {
    if (!this.searchParams.location || !this.searchParams.startDate || !this.searchParams.endDate) {
      // Show validation message or handle empty fields
      return
    }
    
    // Navigate to vehicles page with search params
    // Implementation depends on your routing strategy
    console.log('Searching vehicles with params:', this.searchParams)
  }

  getPrimaryImage(vehicle: Vehicle): string {
    const primaryImage = vehicle.images?.find((img) => img.isPrimary)
    return primaryImage?.imageUrl || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop"
  }

  trackByVehicleId(index: number, vehicle: Vehicle): string {
    return vehicle.id
  }

  // Helper method to get category icon
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'SUV': '🚙',
      'Sedan': '🚗',
      'Hatchback': '🚙',
      'Convertible': '🏎️',
      'Truck': '🚚',
      'Van': '🚐'
    }
    return icons[category] || '🚗'
  }

  // Scroll to section method
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}