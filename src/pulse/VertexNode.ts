// Vertex Node - Emergency Swarm Response for Vertex Challenge
// Killer Feature #5: Emergency Swarm Response with <100ms latency

import { EngineGuard } from '../guardian/EngineGuard';
import { VantomInference } from '../inference/LocalOptimizer';
import { SafetySignal, VertexSwarmCoordinator } from '../swarm/VertexCoordinator';

export interface EmergencySignal {
  signalId: string;
  nodeId: string;
  signalType: 'CRITICAL' | 'SHUTDOWN' | 'EMERGENCY_STOP';
  location: { lat: number; lng: number };
  threat: string;
  constraint: string;
  consequence: string;
  timestamp: number;
  propagationRadius: number; // meters
  priority: 'critical' | 'high';
  requiresImmediateAction: boolean;
  engineState: 'on' | 'off' | 'unknown';
}

export interface MeshPeer {
  peerId: string;
  nodeId: string;
  location: { lat: number; lng: number };
  status: 'active' | 'inactive' | 'emergency';
  lastSeen: number;
  connectionQuality: number; // 0-100
}

/**
 * Vertex Node - Emergency Swarm Response System
 * Broadcasts critical safety signals through P2P mesh with <100ms latency
 */
export class VertexNode {
  private nodeId: string;
  private swarmCoordinator: VertexSwarmCoordinator;
  private engineGuard: EngineGuard;
  private localOptimizer: VantomInference;
  private meshPeers: Map<string, MeshPeer> = new Map();
  private emergencyMode: boolean = false;
  private signalHistory: EmergencySignal[] = [];
  private emergencyCallback?: (signal: EmergencySignal) => void;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.swarmCoordinator = new VertexSwarmCoordinator(nodeId);
    this.engineGuard = new EngineGuard();
    this.localOptimizer = new VantomInference();
    
    this.initializeEmergencyMonitoring();
  }

  /**
   * Initialize emergency monitoring and threat detection
   */
  public async initializeEmergencyMonitoring(): Promise<void> {
    console.log(`VertexNode ${this.nodeId}: Initializing emergency monitoring...`);

    // Start monitoring EngineGuard for critical states
    this.startEngineGuardMonitoring();

    // Initialize FlagOS optimization for <100ms response
    await this.localOptimizer.maximizeInferenceThroughput();

    // Connect to swarm mesh
    await this.swarmCoordinator.initializeSwarm();

    console.log(`VertexNode ${this.nodeId}: Emergency monitoring active`);
  }

  /**
   * Monitor EngineGuard for critical safety states
   */
  private startEngineGuardMonitoring(): void {
    // Monitor sensor readings for critical conditions
    setInterval(() => {
      const sensorStatus = this.engineGuard.getSensorStatus();
      const recentReadings = this.engineGuard.getRecentReadings(5);

      if (recentReadings.length > 0) {
        const latest = recentReadings[recentReadings.length - 1];
        
        // Check for critical conditions
        if (this.detectCriticalCondition(latest, sensorStatus)) {
          this.handleCriticalDetection(latest, sensorStatus);
        }
      }
    }, 50); // Check every 50ms for <100ms response
  }

  /**
   * Detect critical safety conditions
   */
  private detectCriticalCondition(reading: any, sensorStatus: any): boolean {
    // Engine violation when engine must be off
    if (sensorStatus.threatConfig?.constraint.includes('Engine must be off') && 
        reading.engineStatus === 'on') {
      return true;
    }

    // Critical temperature
    if (reading.temperature > 95) { // 95°C critical threshold
      return true;
    }

    // Proximity collision risk
    if (reading.proximityAlert && sensorStatus.sensitivity > 80) {
      return true;
    }

    return false;
  }

  /**
   * Handle critical condition detection
   */
  private async handleCriticalDetection(reading: any, sensorStatus: any): Promise<void> {
    console.log(`VertexNode ${this.nodeId}: CRITICAL CONDITION DETECTED`);

    const emergencySignal: EmergencySignal = {
      signalId: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nodeId: this.nodeId,
      signalType: this.determineSignalType(reading, sensorStatus),
      location: reading.location,
      threat: sensorStatus.threatConfig?.threat || 'Critical safety violation',
      constraint: sensorStatus.threatConfig?.constraint || 'Immediate action required',
      consequence: sensorStatus.threatConfig?.consequence || 'System shutdown',
      timestamp: Date.now(),
      propagationRadius: this.calculatePropagationRadius(sensorStatus),
      priority: 'critical',
      requiresImmediateAction: true,
      engineState: reading.engineStatus
    };

    // Broadcast emergency signal with <100ms latency
    await this.broadcastEmergencySignal(emergencySignal);
  }

  /**
   * Determine signal type based on condition
   */
  private determineSignalType(reading: any, sensorStatus: any): 'CRITICAL' | 'SHUTDOWN' | 'EMERGENCY_STOP' {
    if (reading.temperature > 100) {
      return 'SHUTDOWN';
    } else if (sensorStatus.threatConfig?.severity === 'critical') {
      return 'EMERGENCY_STOP';
    } else {
      return 'CRITICAL';
    }
  }

  /**
   * Calculate propagation radius based on threat severity
   */
  private calculatePropagationRadius(sensorStatus: any): number {
    const sensitivity = sensorStatus.sensitivity;
    
    // Higher sensitivity = larger propagation radius
    if (sensitivity >= 95) return 5000; // 5km for critical
    if (sensitivity >= 80) return 3000; // 3km for high
    if (sensitivity >= 60) return 2000; // 2km for medium
    return 1000; // 1km default
  }

  /**
   * Broadcast emergency signal to all mesh peers with <100ms latency
   * Killer Feature #5: Emergency Swarm Response
   */
  async broadcastEmergencySignal(signal: EmergencySignal): Promise<void> {
    const startTime = performance.now();

    console.log(`VertexNode ${this.nodeId}: Broadcasting emergency signal ${signal.signalId}`);
    console.log(`Signal type: ${signal.signalType}`);
    console.log(`Threat: ${signal.threat}`);
    console.log(`Propagation radius: ${signal.propagationRadius}m`);

    // Enter emergency mode
    this.emergencyMode = true;

    // Store signal in history
    this.signalHistory.push(signal);
    
    // Keep only last 100 signals
    if (this.signalHistory.length > 100) {
      this.signalHistory.shift();
    }

    // Use FlagOS LocalOptimizer for ultra-fast processing
    const threatAnalysis = await this.localOptimizer.analyzeSafetyThreat(
      `EMERGENCY: ${signal.threat} - ${signal.constraint} - ${signal.consequence}`
    );

    // Create Vertex safety signal for mesh propagation
    const vertexSignal: SafetySignal = {
      signalType: signal.signalType === 'SHUTDOWN' ? 'emergency_stop' : 'hazard_detected',
      agentId: this.nodeId,
      location: signal.location,
      severity: 'critical',
      propagationRadius: signal.propagationRadius,
      timestamp: signal.timestamp
    };

    // Broadcast through Vertex swarm coordinator
    await this.swarmCoordinator.broadcastSafetySignal(vertexSignal);

    // Direct P2P broadcast to connected peers for additional redundancy
    await this.directPeerBroadcast(signal);

    // Trigger local emergency response
    this.triggerLocalEmergencyResponse(signal);

    const endTime = performance.now();
    const latency = endTime - startTime;

    console.log(`VertexNode ${this.nodeId}: Emergency signal broadcasted in ${latency.toFixed(2)}ms`);
    
    if (latency < 100) {
      console.log(`VertexNode ${this.nodeId}: <100ms latency target ACHIEVED`);
    } else {
      console.log(`VertexNode ${this.nodeId}: Latency exceeded target: ${latency.toFixed(2)}ms`);
    }

    // Call emergency callback if registered
    if (this.emergencyCallback) {
      this.emergencyCallback(signal);
    }
  }

  /**
   * Direct P2P broadcast to mesh peers
   */
  private async directPeerBroadcast(signal: EmergencySignal): Promise<void> {
    const peers = Array.from(this.meshPeers.values()).filter(peer => 
      peer.status === 'active' && this.isPeerInRange(peer, signal.location, signal.propagationRadius)
    );

    console.log(`VertexNode ${this.nodeId}: Direct broadcasting to ${peers.length} peers`);

    // Simulate ultra-fast P2P broadcast
    const broadcastPromises = peers.map(peer => 
      this.sendSignalToPeer(peer, signal)
    );

    await Promise.all(broadcastPromises);
  }

  /**
   * Send emergency signal to specific peer
   */
  private async sendSignalToPeer(peer: MeshPeer, signal: EmergencySignal): Promise<void> {
    // Simulate P2P signal transmission with <10ms latency
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`VertexNode ${this.nodeId}: Signal sent to peer ${peer.peerId}`);
        resolve();
      }, Math.random() * 10); // 0-10ms transmission time
    });
  }

  /**
   * Check if peer is within propagation radius
   */
  private isPeerInRange(peer: MeshPeer, signalLocation: { lat: number; lng: number }, radius: number): boolean {
    const distance = this.calculateDistance(peer.location, signalLocation);
    return distance <= radius;
  }

  /**
   * Calculate distance between two coordinates
   */
  private calculateDistance(
    point1: { lat: number; lng: number }, 
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Trigger local emergency response
   */
  private triggerLocalEmergencyResponse(signal: EmergencySignal): void {
    console.log(`VertexNode ${this.nodeId}: Triggering local emergency response`);

    // Local emergency actions based on signal type
    switch (signal.signalType) {
      case 'EMERGENCY_STOP':
        console.log(`VertexNode ${this.nodeId}: EMERGENCY STOP ACTIVATED`);
        // In real implementation, this would:
        // - Stop vehicle movement
        // - Activate hazard lights
        // - Notify driver
        break;

      case 'SHUTDOWN':
        console.log(`VertexNode ${this.nodeId}: SYSTEM SHUTDOWN INITIATED`);
        // In real implementation, this would:
        // - Shut down engine
        // - Activate emergency protocols
        // - Contact emergency services
        break;

      case 'CRITICAL':
        console.log(`VertexNode ${this.nodeId}: CRITICAL SAFETY PROTOCOL ACTIVE`);
        // In real implementation, this would:
        // - Increase sensor sensitivity to maximum
        // - Alert nearby drivers
        // - Prepare for emergency stop
        break;
    }
  }

  /**
   * Add mesh peer for P2P communication
   */
  public addMeshPeer(peer: MeshPeer): void {
    this.meshPeers.set(peer.peerId, peer);
    console.log(`VertexNode ${this.nodeId}: Added peer ${peer.peerId} to mesh`);
  }

  /**
   * Remove mesh peer
   */
  public removeMeshPeer(peerId: string): void {
    this.meshPeers.delete(peerId);
    console.log(`VertexNode ${this.nodeId}: Removed peer ${peerId} from mesh`);
  }

  /**
   * Register emergency callback
   */
  public onEmergencySignal(callback: (signal: EmergencySignal) => void): void {
    this.emergencyCallback = callback;
  }

  /**
   * Get current node status
   */
  public getNodeStatus(): {
    nodeId: string;
    emergencyMode: boolean;
    peerCount: number;
    signalHistory: number;
    lastSignal?: EmergencySignal;
  } {
    return {
      nodeId: this.nodeId,
      emergencyMode: this.emergencyMode,
      peerCount: this.meshPeers.size,
      signalHistory: this.signalHistory.length,
      lastSignal: this.signalHistory[this.signalHistory.length - 1]
    };
  }

  /**
   * Get emergency signal history
   */
  public getEmergencyHistory(): EmergencySignal[] {
    return [...this.signalHistory];
  }

  /**
   * Clear emergency mode
   */
  public clearEmergencyMode(): void {
    this.emergencyMode = false;
    console.log(`VertexNode ${this.nodeId}: Emergency mode cleared`);
  }

  /**
   * Shutdown node
   */
  public async shutdown(): Promise<void> {
    console.log(`VertexNode ${this.nodeId}: Shutting down...`);
    
    // Stop monitoring
    this.engineGuard.stopMonitoring();
    
    // Disconnect from swarm
    await this.swarmCoordinator.shutdown();
    
    // Clear peers
    this.meshPeers.clear();
    
    console.log(`VertexNode ${this.nodeId}: Shutdown complete`);
  }
}

export default VertexNode;
