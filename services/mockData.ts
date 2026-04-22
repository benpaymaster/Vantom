// Mock data service for Vantom Driver App
// Simulates Amazon Flex API responses for testing UI components

export interface DeliveryLocation {
  address: string;
  latitude: number;
  longitude: number;
  instructions?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface Package {
  id: string;
  trackingNumber: string;
  weight: number; // in lbs
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  requiresSignature: boolean;
  isFragile: boolean;
  specialInstructions?: string;
}

export interface Delivery {
  id: string;
  orderNumber: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  pickupLocation: DeliveryLocation;
  deliveryLocation: DeliveryLocation;
  packages: Package[];
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  payment: {
    baseAmount: number;
    tipAmount: number;
    bonusAmount: number;
    totalAmount: number;
  };
  distance: number; // in miles
  estimatedDuration: number; // in minutes
  priority: 'standard' | 'prime' | 'express';
  notes?: string;
}

export interface DeliveryManifest {
  id: string;
  driverId: string;
  date: string;
  shiftStartTime: string;
  shiftEndTime: string;
  deliveries: Delivery[];
  totalEarnings: number;
  totalDistance: number;
  totalPackages: number;
  vehicleType: 'car' | 'van' | 'truck';
  weatherConditions: {
    temperature: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
    windSpeed: number;
  };
}

// Generate mock delivery data
const generateMockDelivery = (index: number): Delivery => {
  const statuses: Delivery['status'][] = ['pending', 'picked_up', 'in_transit', 'delivered'];
  const priorities: Delivery['priority'][] = ['standard', 'prime', 'express'];
  
  return {
    id: `delivery-${index + 1}`,
    orderNumber: `AMZ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    pickupLocation: {
      address: `${Math.floor(Math.random() * 999) + 100} Warehouse Ave, Distribution Center`,
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      instructions: 'Go to loading dock #7, scan packages before departure',
      contactName: 'Warehouse Manager',
      contactPhone: '(555) 123-4567'
    },
    deliveryLocation: {
      address: `${Math.floor(Math.random() * 999) + 100} Customer St, Apt ${Math.floor(Math.random() * 999) + 1}`,
      latitude: 40.7589 + (Math.random() - 0.5) * 0.1,
      longitude: -73.9851 + (Math.random() - 0.5) * 0.1,
      instructions: Math.random() > 0.5 ? 'Leave at front door' : 'Hand to customer',
      contactName: `Customer ${index + 1}`,
      contactPhone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    },
    packages: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, pkgIndex) => ({
      id: `pkg-${index + 1}-${pkgIndex + 1}`,
      trackingNumber: `1Z${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
      weight: Math.round((Math.random() * 10 + 0.5) * 10) / 10,
      dimensions: {
        length: Math.round(Math.random() * 20 + 5),
        width: Math.round(Math.random() * 15 + 5),
        height: Math.round(Math.random() * 10 + 3)
      },
      requiresSignature: Math.random() > 0.7,
      isFragile: Math.random() > 0.8,
      specialInstructions: Math.random() > 0.9 ? 'Handle with extreme care' : undefined
    })),
    estimatedDeliveryTime: new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000).toISOString(),
    payment: {
      baseAmount: Math.round((Math.random() * 8 + 5) * 100) / 100,
      tipAmount: Math.round((Math.random() * 5) * 100) / 100,
      bonusAmount: Math.random() > 0.8 ? Math.round((Math.random() * 3) * 100) / 100 : 0,
      totalAmount: 0 // Will be calculated
    },
    distance: Math.round((Math.random() * 15 + 2) * 10) / 10,
    estimatedDuration: Math.round(Math.random() * 30 + 10),
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    notes: Math.random() > 0.8 ? 'Customer prefers contactless delivery' : undefined
  };
};

// Calculate total payment for each delivery
const calculatePayments = (deliveries: Delivery[]): Delivery[] => {
  return deliveries.map(delivery => ({
    ...delivery,
    payment: {
      ...delivery.payment,
      totalAmount: Math.round((delivery.payment.baseAmount + delivery.payment.tipAmount + delivery.payment.bonusAmount) * 100) / 100
    }
  }));
};

// Generate mock delivery manifest
export const generateMockManifest = (): DeliveryManifest => {
  const deliveryCount = Math.floor(Math.random() * 15) + 10; // 10-25 deliveries
  const deliveries = calculatePayments(Array.from({ length: deliveryCount }, (_, index) => generateMockDelivery(index)));
  
  const totalEarnings = deliveries.reduce((sum, delivery) => sum + delivery.payment.totalAmount, 0);
  const totalDistance = deliveries.reduce((sum, delivery) => sum + delivery.distance, 0);
  const totalPackages = deliveries.reduce((sum, delivery) => sum + delivery.packages.length, 0);

  return {
    id: `manifest-${Date.now()}`,
    driverId: 'driver-001',
    date: new Date().toISOString().split('T')[0],
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    deliveries,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalPackages,
    vehicleType: 'van',
    weatherConditions: {
      temperature: Math.round(Math.random() * 30 + 40),
      condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)] as any,
      windSpeed: Math.round(Math.random() * 20)
    }
  };
};

// Mock API functions
export const mockApi = {
  // Get current delivery manifest
  getCurrentManifest: async (): Promise<DeliveryManifest> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return generateMockManifest();
  },

  // Update delivery status
  updateDeliveryStatus: async (deliveryId: string, status: Delivery['status']): Promise<Delivery> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const delivery = generateMockDelivery(0);
    delivery.id = deliveryId;
    delivery.status = status;
    return delivery;
  },

  // Get delivery details
  getDeliveryDetails: async (deliveryId: string): Promise<Delivery> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const delivery = generateMockDelivery(0);
    delivery.id = deliveryId;
    return delivery;
  },

  // Simulate real-time location updates
  simulateLocationUpdates: (callback: (location: { latitude: number; longitude: number }) => void) => {
    const interval = setInterval(() => {
      callback({
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.01
      });
    }, 5000);

    return () => clearInterval(interval);
  }
};

// Export sample data for immediate UI testing
export const sampleManifest = generateMockManifest();
