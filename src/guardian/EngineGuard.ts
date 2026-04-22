// EngineGuard - Physical Sensor Integration for Vantom OS
// Links AI threat detection to real-time sensor sensitivity control

export interface ThreatConfiguration {
  threat: string;
  constraint: string;
  consequence: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  engineState: 'on' | 'off' | 'unknown';
}

export interface SensorConfig {
  engineSensor: {
    sensitivity: number; // 0-100
    responseTime: number; // milliseconds
    threshold: number; // detection threshold
  };
  proximitySensor: {
    sensitivity: number;
    detectionRadius: number; // meters
  };
  motionSensor: {
    sensitivity: number;
    accelerationThreshold: number;
  };
  temperatureSensor: {
    sensitivity: number;
    warningThreshold: number; // Celsius
  };
}

export interface SensorReading {
  timestamp: number;
  engineStatus: 'on' | 'off' | 'unknown';
  proximityAlert: boolean;
  motionDetected: boolean;
  temperature: number;
  location: { lat: number; lng: number };
}

/**
 * EngineGuard - Physical Sensor Management System
 * Automatically ramps up sensor sensitivity when AI detects threats
 */
export class EngineGuard {
  private currentSensitivity: number = 50; // Default sensitivity
  private threatConfig: ThreatConfiguration | null = null;
  private sensorConfig: SensorConfig;
  private isActive: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private sensorReadings: SensorReading[] = [];

  constructor() {
    this.sensorConfig = this.initializeSensorConfig();
  }

  /**
   * Ramp up sensor sensitivity based on AI threat detection
   */
  async rampUpSensorSensitivity(sensitivity: number): Promise<void> {
    console.log(`EngineGuard: Ramping sensor sensitivity to ${sensitivity}%`);
    
    this.currentSensitivity = sensitivity;
    this.isActive = true;

    // Update all sensor configurations
    await this.updateSensorSensitivity(sensitivity);

    // Start active monitoring
    this.startActiveMonitoring();

    console.log(`EngineGuard: Active monitoring started at ${sensitivity}% sensitivity`);
  }

  /**
   * Configure threat-specific monitoring parameters
   */
  async configureThreatMonitoring(config: ThreatConfiguration): Promise<void> {
    this.threatConfig = config;
    
    console.log(`EngineGuard: Configured for threat: ${config.threat}`);
    console.log(`Constraint: ${config.constraint}`);
    console.log(`Severity: ${config.severity}`);

    // Adjust sensor configurations based on threat type
    await this.adjustSensorsForThreat(config);
  }

  /**
   * Initialize default sensor configuration
   */
  private initializeSensorConfig(): SensorConfig {
    return {
      engineSensor: {
        sensitivity: 50,
        responseTime: 100, // 100ms response
        threshold: 0.7
      },
      proximitySensor: {
        sensitivity: 50,
        detectionRadius: 5.0 // 5 meters
      },
      motionSensor: {
        sensitivity: 50,
        accelerationThreshold: 2.0 // m/s²
      },
      temperatureSensor: {
        sensitivity: 50,
        warningThreshold: 80.0 // 80°C
      }
    };
  }

  /**
   * Update sensor sensitivity across all sensors
   */
  private async updateSensorSensitivity(sensitivity: number): Promise<void> {
    // Engine sensor - most critical for engine state monitoring
    this.sensorConfig.engineSensor.sensitivity = sensitivity;
    this.sensorConfig.engineSensor.responseTime = Math.max(10, 100 - sensitivity * 0.9); // Faster response at higher sensitivity
    this.sensorConfig.engineSensor.threshold = 0.3 + (sensitivity * 0.007); // Lower threshold at higher sensitivity

    // Proximity sensor - for obstacle detection
    this.sensorConfig.proximitySensor.sensitivity = sensitivity;
    this.sensorConfig.proximitySensor.detectionRadius = 2.0 + (sensitivity * 0.1); // Larger detection radius at higher sensitivity

    // Motion sensor - for movement detection
    this.sensorConfig.motionSensor.sensitivity = sensitivity;
    this.sensorConfig.motionSensor.accelerationThreshold = Math.max(0.5, 5.0 - sensitivity * 0.045); // Lower threshold at higher sensitivity

    // Temperature sensor - for engine monitoring
    this.sensorConfig.temperatureSensor.sensitivity = sensitivity;
    this.sensorConfig.temperatureSensor.warningThreshold = 100 - (sensitivity * 0.2); // Lower warning threshold at higher sensitivity

    console.log(`EngineGuard: Sensor configurations updated for ${sensitivity}% sensitivity`);
  }

  /**
   * Adjust sensors specifically for threat type
   */
  private async adjustSensorsForThreat(config: ThreatConfiguration): Promise<void> {
    switch (config.threat) {
      case 'Engine safety violation':
        // Maximize engine sensor sensitivity
        this.sensorConfig.engineSensor.sensitivity = 100;
        this.sensorConfig.engineSensor.responseTime = 10; // 10ms response
        this.sensorConfig.engineSensor.threshold = 0.1;
        break;

      case 'Vehicle tire defect':
        // Increase motion and proximity sensitivity
        this.sensorConfig.motionSensor.sensitivity = 90;
        this.sensorConfig.proximitySensor.sensitivity = 80;
        break;

      case 'Vehicle lighting defect':
        // Focus on ambient light detection
        this.sensorConfig.proximitySensor.sensitivity = 85;
        break;

      case 'System data failure':
        // Standard monitoring with data integrity checks
        this.sensorConfig.engineSensor.sensitivity = 70;
        break;
    }
  }

  /**
   * Start active monitoring with real-time sensor readings
   */
  private startActiveMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.performSensorReading();
    }, 100); // Read sensors every 100ms

    console.log('EngineGuard: Active monitoring started');
  }

  /**
   * Perform real-time sensor reading
   */
  private performSensorReading(): void {
    const reading: SensorReading = {
      timestamp: Date.now(),
      engineStatus: this.readEngineStatus(),
      proximityAlert: this.readProximitySensor(),
      motionDetected: this.readMotionSensor(),
      temperature: this.readTemperatureSensor(),
      location: this.getCurrentLocation()
    };

    this.sensorReadings.push(reading);

    // Keep only last 100 readings to manage memory
    if (this.sensorReadings.length > 100) {
      this.sensorReadings.shift();
    }

    // Process reading for threat detection
    this.processSensorReading(reading);
  }

  /**
   * Read engine status sensor
   */
  private readEngineStatus(): 'on' | 'off' | 'unknown' {
    // Simulate engine status reading
    // In real implementation, this would read from OBD-II or engine sensors
    
    if (this.threatConfig?.engineState === 'off') {
      // High sensitivity monitoring for engine off requirement
      const random = Math.random();
      if (random < (this.currentSensitivity / 1000)) { // Small chance of detecting violation
        return 'on'; // Violation detected
      }
    }
    
    return 'off'; // Compliant
  }

  /**
   * Read proximity sensor
   */
  private readProximitySensor(): boolean {
    // Simulate proximity detection
    const detectionRadius = this.sensorConfig.proximitySensor.detectionRadius;
    const sensitivity = this.sensorConfig.proximitySensor.sensitivity;
    
    // Simulate obstacle detection based on sensitivity
    return Math.random() < (sensitivity / 200); // Higher sensitivity = more detections
  }

  /**
   * Read motion sensor
   */
  private readMotionSensor(): boolean {
    // Simulate motion detection
    const threshold = this.sensorConfig.motionSensor.accelerationThreshold;
    const sensitivity = this.sensorConfig.motionSensor.sensitivity;
    
    // Simulate motion detection
    return Math.random() < (sensitivity / 150);
  }

  /**
   * Read temperature sensor
   */
  private readTemperatureSensor(): number {
    // Simulate engine temperature
    const baseTemp = 70; // Normal operating temperature
    const variation = (Math.random() - 0.5) * 20; // ±10°C variation
    const sensitivity = this.sensorConfig.temperatureSensor.sensitivity;
    
    // Higher sensitivity readings fluctuate more
    const sensitivityFactor = (sensitivity / 100) * 5;
    return baseTemp + variation + sensitivityFactor;
  }

  /**
   * Get current GPS location
   */
  private getCurrentLocation(): { lat: number; lng: number } {
    // Simulate GPS reading
    return {
      lat: 40.7128 + (Math.random() - 0.5) * 0.01,
      lng: -74.0060 + (Math.random() - 0.5) * 0.01
    };
  }

  /**
   * Process sensor reading for threat detection
   */
  private processSensorReading(reading: SensorReading): void {
    if (!this.threatConfig) return;

    // Check for engine violations
    if (this.threatConfig.constraint.includes('Engine must be off') && 
        reading.engineStatus === 'on') {
      this.triggerSafetyAlert('Engine violation detected', reading);
    }

    // Check for proximity alerts
    if (reading.proximityAlert) {
      this.triggerSafetyAlert('Proximity obstacle detected', reading);
    }

    // Check for temperature alerts
    if (reading.temperature > this.sensorConfig.temperatureSensor.warningThreshold) {
      this.triggerSafetyAlert('Engine temperature warning', reading);
    }
  }

  /**
   * Trigger safety alert with sensor data
   */
  private triggerSafetyAlert(alert: string, reading: SensorReading): void {
    console.log(`EngineGuard SAFETY ALERT: ${alert}`);
    console.log(`Timestamp: ${new Date(reading.timestamp).toISOString()}`);
    console.log(`Engine Status: ${reading.engineStatus}`);
    console.log(`Temperature: ${reading.temperature.toFixed(1)}°C`);
    console.log(`Location: ${reading.location.lat.toFixed(6)}, ${reading.location.lng.toFixed(6)}`);

    // In real implementation, this would:
    // 1. Send alert to driver display
    // 2. Log to fleet management system
    // 3. Trigger automatic safety protocols
    // 4. Notify nearby drivers in swarm
  }

  /**
   * Get current sensor status
   */
  public getSensorStatus(): {
    isActive: boolean;
    sensitivity: number;
    currentConfig: SensorConfig;
    recentReadings: number;
    threatConfig: ThreatConfiguration | null;
  } {
    return {
      isActive: this.isActive,
      sensitivity: this.currentSensitivity,
      currentConfig: this.sensorConfig,
      recentReadings: this.sensorReadings.length,
      threatConfig: this.threatConfig
    };
  }

  /**
   * Stop active monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isActive = false;
    this.currentSensitivity = 50;
    this.threatConfig = null;

    console.log('EngineGuard: Monitoring stopped');
  }

  /**
   * Get recent sensor readings for analysis
   */
  public getRecentReadings(count: number = 10): SensorReading[] {
    return this.sensorReadings.slice(-count);
  }
}

export default EngineGuard;
