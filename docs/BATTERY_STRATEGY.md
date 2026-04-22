# Battery Saver Strategy for Vantom Driver App

## Overview

This document outlines our strategy for implementing battery-efficient location tracking using Expo TaskManager to minimize GPS pings when the driver is stationary, while maintaining accurate location data for delivery tracking.

## Technical Implementation

### 1. Expo TaskManager Configuration

```typescript
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data;
    // Process location data
  }
});
```

### 2. Adaptive Location Tracking Strategy

#### High-Frequency Mode (Active Delivery)
- **Interval**: 10-15 seconds
- **Accuracy**: `Location.Accuracy.High`
- **Trigger**: When driver is en route to pickup/delivery

#### Medium-Frequency Mode (Available for Deliveries)
- **Interval**: 30-60 seconds  
- **Accuracy**: `Location.Accuracy.Balanced`
- **Trigger**: When shift is active but no active delivery

#### Low-Frequency Mode (Stationary)
- **Interval**: 5-10 minutes
- **Accuracy**: `Location.Accuracy.Low`
- **Trigger**: When device detects no movement for 2+ minutes

### 3. Movement Detection Algorithm

```typescript
interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

class MovementDetector {
  private recentLocations: LocationPoint[] = [];
  private stationaryThreshold = 2; // minutes
  private movementThreshold = 10; // meters

  isStationary(currentLocation: LocationPoint): boolean {
    this.recentLocations.push(currentLocation);
    
    // Keep only last 5 minutes of data
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    this.recentLocations = this.recentLocations.filter(
      loc => loc.timestamp > fiveMinutesAgo
    );

    if (this.recentLocations.length < 2) return false;

    // Calculate total distance moved in last 5 minutes
    let totalDistance = 0;
    for (let i = 1; i < this.recentLocations.length; i++) {
      totalDistance += this.calculateDistance(
        this.recentLocations[i - 1],
        this.recentLocations[i]
      );
    }

    return totalDistance < this.movementThreshold;
  }

  private calculateDistance(point1: LocationPoint, point2: LocationPoint): number {
    // Haversine formula implementation
    const R = 6371e3; // Earth's radius in meters
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const deltaLon = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
```

### 4. Battery Optimization Features

#### Geofencing Integration
- Use geofences around delivery areas to trigger high-accuracy tracking only when needed
- Reduce GPS usage when driver is far from delivery zones

#### Background Task Management
- Implement exponential backoff for failed location requests
- Pause tracking during prolonged stationary periods
- Resume normal tracking when movement is detected

#### Network-Aware Tracking
- Use Wi-Fi and cell tower positioning when GPS accuracy isn't critical
- Fall back to network-based location to save battery

### 5. Implementation Steps

1. **Setup Permissions**
   ```typescript
   const { status } = await Location.requestForegroundPermissionsAsync();
   const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
   ```

2. **Initialize TaskManager**
   - Register background location task
   - Configure initial tracking parameters

3. **Implement Movement Detection**
   - Create movement detector class
   - Integrate with location updates

4. **Adaptive Tracking Logic**
   - Implement state machine for tracking modes
   - Add transition logic between modes

5. **Testing & Optimization**
   - Test battery consumption in different scenarios
   - Fine-tune thresholds and intervals

### 6. Performance Metrics

- **Target Battery Usage**: < 5% per hour during active shifts
- **Location Accuracy**: Within 10 meters for active deliveries
- **Response Time**: < 30 seconds to detect movement changes

### 7. Edge Cases

#### GPS Signal Loss
- Implement exponential backoff for GPS attempts
- Use last known location with increased uncertainty radius
- Notify user if GPS is unavailable for extended periods

#### Battery Critical Levels
- Automatically switch to low-frequency mode when battery < 20%
- Provide user notifications about battery-saving measures

#### Network Connectivity Issues
- Cache location data locally when offline
- Sync with server when connectivity is restored
- Implement conflict resolution for overlapping data

## Conclusion

This strategy balances the need for accurate location tracking with battery efficiency by using adaptive tracking modes based on driver activity and movement patterns. The implementation will automatically optimize GPS usage while maintaining the accuracy required for delivery operations.
