// Vertex 2.0 - P2P Coordination Fabric for Vantom OS Swarm
// The TCP/IP for Delivery Driver Swarms - Eliminate the Middleman
// Enhanced with FoxMQ message-passing and Tashi Vertex BFT coordination

import { FoxMQClient } from '../foxmq/FoxMQClient.js';
import { VertexConsensus } from '../tashi/VertexConsensus.js';

export interface SwarmAgent {
  id: string;
  type: 'driver_phone' | 'driver_tablet' | 'delivery_drone' | 'warehouse_robot' | 'manager_device';
  vendor: string; // Apple, Samsung, DJI, Boston Dynamics, etc.
  capabilities: string[];
  location: { lat: number; lng: number; altitude?: number };
  batteryLevel: number;
  currentTask: string | null;
  status: 'active' | 'idle' | 'emergency' | 'offline';
  lastSeen: number;
}

export interface SwarmMessage {
  messageId: string;
  senderId: string;
  recipientId?: string; // undefined = broadcast
  messageType: 'discovery' | 'state_sync' | 'task_negotiation' | 'safety_signal' | 'handoff';
  payload: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TaskNegotiation {
  taskId: string;
  taskType: 'package_delivery' | 'route_optimization' | 'emergency_response' | 'battery_swap';
  location: { lat: number; lng: number };
  urgency: number; // 1-10
  requirements: string[];
  bids: TaskBid[];
  deadline: number;
}

export interface TaskBid {
  agentId: string;
  estimatedTime: number;
  batteryCost: number;
  confidence: number; // 0-1
  proposedRoute?: string[];
}

export interface SafetySignal {
  signalType: 'emergency_stop' | 'hazard_detected' | 'battery_critical' | 'network_degraded';
  agentId: string;
  location: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  propagationRadius: number; // meters
  timestamp: number;
}

/**
 * Vertex 2.0 P2P Swarm Coordinator
 * Enables delivery drivers, drones, and robots to coordinate without central orchestrator
 */
export class VertexSwarmCoordinator {
  private agents: Map<string, SwarmAgent> = new Map();
  private messageQueue: SwarmMessage[] = [];
  private activeTasks: Map<string, TaskNegotiation> = new Map();
  private safetySignals: SafetySignal[] = [];
  private meshConnections: Map<string, string[]> = new Map(); // agentId -> connected peers
  private isInitialized = false;
  private nodeId: string;
  private discoveryInterval: NodeJS.Timeout | null = null;
  
  // FoxMQ and Tashi Vertex integration
  private foxmqClient: FoxMQClient;
  private vertexConsensus: VertexConsensus;
  private byzantineLatency: number = 0;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.foxmqClient = new FoxMQClient(nodeId);
    this.vertexConsensus = new VertexConsensus(nodeId);
  }

  /**
   * Initialize Vertex 2.0 P2P mesh network
   * Low Barrier: Get resilient mesh running in under an hour
   */
  async initializeSwarm(): Promise<void> {
    console.log('Initializing Vertex 2.0 P2P swarm coordination with FoxMQ + Tashi Vertex BFT...');
    
    // Initialize Tashi Vertex consensus engine first
    await this.vertexConsensus.initialize();
    
    // Initialize FoxMQ message-passing layer
    await this.foxmqClient.initializeCluster();
    
    // Register this node with Byzantine consensus
    await this.registerLocalAgent();
    
    // Start agent discovery
    this.startAgentDiscovery();
    
    // Initialize mesh connections
    await this.establishMeshConnections();
    
    // Start safety signal monitoring
    this.startSafetySignalPropagation();
    
    // Setup FoxMQ subscriptions for swarm communication
    await this.setupFoxMQSubscriptions();
    
    this.isInitialized = true;
    console.log(`Vertex swarm initialized - Node ${this.nodeId} ready with FoxMQ + Tashi Vertex BFT coordination`);
  }

  /**
   * Setup FoxMQ subscriptions for swarm communication
   */
  private async setupFoxMQSubscriptions(): Promise<void> {
    console.log(`Vertex Swarm ${this.nodeId}: Setting up FoxMQ subscriptions...`);
    
    // Subscribe to swarm discovery messages
    await this.foxmqClient.subscribe('swarm/discovery', 1, (message) => {
      this.handleFoxMQDiscovery(message);
    });
    
    // Subscribe to safety signals
    await this.foxmqClient.subscribe('swarm/safety', 2, (message) => {
      this.handleFoxMQSafetySignal(message);
    });
    
    // Subscribe to task negotiations
    await this.foxmqClient.subscribe('swarm/tasks', 1, (message) => {
      this.handleFoxMQTaskNegotiation(message);
    });
    
    // Subscribe to rescue coordination
    await this.foxmqClient.subscribe('swarm/rescue', 2, (message) => {
      this.handleFoxMQRescue(message);
    });
    
    console.log(`Vertex Swarm ${this.nodeId}: FoxMQ subscriptions configured`);
  }

  /**
   * Handle FoxMQ discovery messages
   */
  private handleFoxMQDiscovery(message: any): void {
    const agentInfo = message.payload.agentInfo;
    if (agentInfo && !this.agents.has(agentInfo.id)) {
      this.agents.set(agentInfo.id, agentInfo);
      this.establishPeerConnection(agentInfo.id);
      console.log(`FoxMQ Discovery: New agent ${agentInfo.id} (${agentInfo.type})`);
    }
  }

  /**
   * Handle FoxMQ safety signals
   */
  private async handleFoxMQSafetySignal(message: any): Promise<void> {
    const safetySignal = message.payload;
    await this.handleSafetySignal(safetySignal);
    console.log(`FoxMQ Safety: Received signal from ${safetySignal.agentId}`);
  }

  /**
   * Handle FoxMQ task negotiations
   */
  private handleFoxMQTaskNegotiation(message: any): void {
    const taskData = message.payload;
    if (taskData.taskId && taskData.bid) {
      // Handle incoming bid
      const task = this.activeTasks.get(taskData.taskId);
      if (task) {
        task.bids.push(taskData.bid);
        console.log(`FoxMQ Task: Bid received for task ${taskData.taskId}`);
      }
    } else if (taskData.taskId && !taskData.bid) {
      // Handle new task
      this.activeTasks.set(taskData.taskId, taskData);
      console.log(`FoxMQ Task: New task ${taskData.taskId}`);
    }
  }

  /**
   * Handle FoxMQ rescue messages
   */
  private handleFoxMQRescue(message: any): void {
    const rescueData = message.payload;
    console.log(`FoxMQ Rescue: Rescue coordination message received`);
    // Process rescue coordination through existing RescueProtocol
  }

  private async registerLocalAgent(): Promise<void> {
    const localAgent: SwarmAgent = {
      id: this.nodeId,
      type: this.detectDeviceType(),
      vendor: this.detectVendor(),
      capabilities: this.detectCapabilities(),
      location: await this.getCurrentLocation(),
      batteryLevel: await this.getBatteryLevel(),
      currentTask: null,
      status: 'active',
      lastSeen: Date.now()
    };

    this.agents.set(this.nodeId, localAgent);
  }

  private detectDeviceType(): SwarmAgent['type'] {
    // Detect if this is phone, tablet, or integrated with drone/robot
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mobile')) return 'driver_phone';
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) return 'driver_tablet';
    return 'driver_phone'; // Default
  }

  private detectVendor(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('iPhone') || userAgent.includes('Mac')) return 'Apple';
    if (userAgent.includes('Android')) return 'Samsung'; // Simplified
    return 'Unknown';
  }

  private detectCapabilities(): string[] {
    const capabilities = ['gps', 'messaging', 'task_execution'];
    
    // Add drone/robot capabilities if connected
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      capabilities.push('camera', 'visual_navigation');
    }
    
    // Add battery optimization capability
    capabilities.push('battery_optimization');
    
    return capabilities;
  }

  private async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          () => resolve({ lat: 40.7128, lng: -74.0060 }) // Default to NYC
        );
      } else {
        resolve({ lat: 40.7128, lng: -74.0060 });
      }
    });
  }

  private async getBatteryLevel(): Promise<number> {
    if (navigator && 'getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return battery.level * 100;
    }
    return 85; // Simulated
  }

  /**
   * P2P Agent Discovery - Multi-vendor compatibility
   * Different brands. Same swarm.
   */
  private startAgentDiscovery(): void {
    this.discoveryInterval = setInterval(() => {
      this.broadcastDiscovery();
      this.processDiscoveryResponses();
    }, 5000); // Discover every 5 seconds
  }

  private broadcastDiscovery(): void {
    const discoveryMessage: SwarmMessage = {
      messageId: `discovery_${Date.now()}`,
      senderId: this.nodeId,
      messageType: 'discovery',
      payload: {
        agentInfo: this.agents.get(this.nodeId),
        capabilities: this.agents.get(this.nodeId)?.capabilities
      },
      timestamp: Date.now(),
      ttl: 10000, // 10 seconds
      priority: 'medium'
    };

    this.broadcastMessage(discoveryMessage);
  }

  private processDiscoveryResponses(): void {
    // Process incoming discovery messages
    const discoveryMessages = this.messageQueue.filter(msg => 
      msg.messageType === 'discovery' && msg.senderId !== this.nodeId
    );

    for (const message of discoveryMessages) {
      const agentInfo = message.payload.agentInfo;
      if (agentInfo && !this.agents.has(agentInfo.id)) {
        this.agents.set(agentInfo.id, agentInfo);
        this.establishPeerConnection(agentInfo.id);
        console.log(`Discovered new agent: ${agentInfo.id} (${agentInfo.type})`);
      }
    }
  }

  /**
   * Mesh Network Establishment - No single point of failure
   */
  private async establishMeshConnections(): Promise<void> {
    // Establish connections with discovered agents
    for (const agentId of this.agents.keys()) {
      if (agentId !== this.nodeId) {
        await this.establishPeerConnection(agentId);
      }
    }
  }

  private async establishPeerConnection(peerId: string): Promise<void> {
    if (!this.meshConnections.has(this.nodeId)) {
      this.meshConnections.set(this.nodeId, []);
    }
    
    if (!this.meshConnections.get(this.nodeId)!.includes(peerId)) {
      this.meshConnections.get(this.nodeId)!.push(peerId);
      
      // Establish reciprocal connection
      if (!this.meshConnections.has(peerId)) {
        this.meshConnections.set(peerId, []);
      }
      if (!this.meshConnections.get(peerId)!.includes(this.nodeId)) {
        this.meshConnections.get(peerId)!.push(this.nodeId);
      }
    }
  }

  /**
   * Leaderless Task Negotiation - Track 3: Agent Economy
   * Rip out the "Master Orchestrator" and build leaderless network
   */
  async initiateTaskNegotiation(task: Omit<TaskNegotiation, 'taskId' | 'bids'>): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const negotiation: TaskNegotiation = {
      ...task,
      taskId,
      bids: []
    };

    this.activeTasks.set(taskId, negotiation);

    // Submit to Tashi Vertex consensus for Byzantine agreement on task creation
    const consensusResult = await this.vertexConsensus.submitTransaction({
      type: 'task_creation',
      task: negotiation,
      nodeId: this.nodeId
    });

    // Broadcast task via FoxMQ for fault-tolerant message passing
    await this.foxmqClient.publish('swarm/tasks', {
      type: 'task_negotiation',
      task: negotiation,
      consensusId: consensusResult,
      nodeId: this.nodeId
    }, task.urgency > 7 ? 2 : 1); // Higher QoS for urgent tasks

    // Also use traditional broadcast for redundancy
    const taskMessage: SwarmMessage = {
      messageId: `task_${taskId}`,
      senderId: this.nodeId,
      messageType: 'task_negotiation',
      payload: negotiation,
      timestamp: Date.now(),
      ttl: 30000, // 30 seconds for bids
      priority: task.urgency > 7 ? 'high' : 'medium'
    };

    this.broadcastMessage(taskMessage);
    console.log(`Task negotiation initiated via FoxMQ + Tashi Vertex: ${taskId}`);

    return taskId;
  }

  async submitTaskBid(taskId: string, bid: Omit<TaskBid, 'agentId'>): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    const fullBid: TaskBid = {
      ...bid,
      agentId: this.nodeId
    };

    task.bids.push(fullBid);

    // Submit bid to Tashi Vertex consensus for Byzantine agreement
    const consensusResult = await this.vertexConsensus.submitTransaction({
      type: 'task_bid',
      taskId,
      bid: fullBid,
      nodeId: this.nodeId
    });

    // Broadcast bid via FoxMQ for fault-tolerant message passing
    await this.foxmqClient.publish('swarm/tasks', {
      type: 'task_bid',
      taskId,
      bid: fullBid,
      consensusId: consensusResult,
      nodeId: this.nodeId
    }, 1); // QoS 1 for bid messages

    // Also use traditional broadcast for redundancy
    const bidMessage: SwarmMessage = {
      messageId: `bid_${taskId}_${this.nodeId}`,
      senderId: this.nodeId,
      messageType: 'task_negotiation',
      payload: { taskId, bid: fullBid },
      timestamp: Date.now(),
      ttl: 5000,
      priority: 'medium'
    };

    this.broadcastMessage(bidMessage);
    console.log(`Task bid submitted via FoxMQ + Tashi Vertex: ${taskId}`);
  }

  /**
   * Safety Signal Propagation - Millisecond fleet response
   * One node detects a fault -> entire fleet freezes in milliseconds
   */
  private startSafetySignalPropagation(): void {
    setInterval(() => {
      this.processSafetySignals();
    }, 100); // Process every 100ms for real-time response
  }

  async broadcastSafetySignal(signal: Omit<SafetySignal, 'timestamp'>): Promise<void> {
    const fullSignal: SafetySignal = {
      ...signal,
      timestamp: Date.now()
    };

    this.safetySignals.push(fullSignal);

    // Submit to Tashi Vertex consensus for Byzantine agreement
    const consensusResult = await this.vertexConsensus.submitTransaction({
      type: 'safety_signal',
      signal: fullSignal,
      nodeId: this.nodeId
    });

    // Broadcast via FoxMQ for fault-tolerant message passing
    await this.foxmqClient.publish('swarm/safety', {
      type: 'safety_broadcast',
      signal: fullSignal,
      consensusId: consensusResult,
      nodeId: this.nodeId
    }, 2); // QoS 2 for critical safety signals

    // Also use traditional broadcast for redundancy
    const safetyMessage: SwarmMessage = {
      messageId: `safety_${Date.now()}`,
      senderId: this.nodeId,
      messageType: 'safety_signal',
      payload: fullSignal,
      timestamp: Date.now(),
      ttl: 1000, // 1 second for emergency propagation
      priority: 'critical'
    };

    this.broadcastMessage(safetyMessage);
    
    // Immediate local response
    await this.handleSafetySignal(fullSignal);
    
    console.log(`Safety signal broadcasted via FoxMQ + Tashi Vertex with BFT consensus`);
  }

  private async handleSafetySignal(signal: SafetySignal): Promise<void> {
    const localAgent = this.agents.get(this.nodeId);
    if (!localAgent) return;

    // Check if within propagation radius
    const distance = this.calculateDistance(localAgent.location, signal.location);
    
    if (distance <= signal.propagationRadius) {
      switch (signal.signalType) {
        case 'emergency_stop':
          localAgent.status = 'emergency';
          console.log('EMERGENCY STOP ACTIVATED - Fleet halting');
          break;
        case 'battery_critical':
          if (localAgent.batteryLevel < 20) {
            await this.initiateEmergencyBatterySwap();
          }
          break;
        case 'network_degraded':
          await this.enableMeshResilience();
          break;
      }
    }
  }

  private calculateDistance(
    point1: { lat: number; lng: number }, 
    point2: { lat: number; lng: number }
  ): number {
    // Haversine distance calculation
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private async initiateEmergencyBatterySwap(): Promise<void> {
    console.log('Emergency battery swap protocol initiated');
    // Find nearest agent with battery swap capability
    const nearbyAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.capabilities.includes('battery_swap') && 
        agent.id !== this.nodeId &&
        agent.status === 'active'
      )
      .sort((a, b) => 
        this.calculateDistance(
          this.agents.get(this.nodeId)!.location, 
          a.location
        ) - 
        this.calculateDistance(
          this.agents.get(this.nodeId)!.location, 
          b.location
        )
      );

    if (nearbyAgents.length > 0) {
      const nearestAgent = nearbyAgents[0];
      console.log(`Battery swap requested from ${nearestAgent.id}`);
    }
  }

  private async enableMeshResilience(): Promise<void> {
    console.log('Mesh resilience mode activated - Network degraded');
    // Increase broadcast frequency, reduce TTL, prioritize critical messages
  }

  /**
   * Self-Healing Mesh Network - No manual intervention
   */
  private processSafetySignals(): void {
    const now = Date.now();
    
    // Remove expired signals
    this.safetySignals = this.safetySignals.filter(signal => 
      now - signal.timestamp < 5000 // Keep signals for 5 seconds
    );

    // Check for offline agents and heal connections
    this.healMeshConnections();
  }

  private healMeshConnections(): void {
    const now = Date.now();
    const offlineAgents: string[] = [];

    for (const [agentId, agent] of this.agents) {
      if (now - agent.lastSeen > 15000) { // 15 seconds timeout
        offlineAgents.push(agentId);
      }
    }

    // Remove offline agents and heal connections
    for (const offlineAgentId of offlineAgents) {
      this.agents.delete(offlineAgentId);
      
      // Remove from mesh connections
      for (const [nodeId, connections] of this.meshConnections) {
        const index = connections.indexOf(offlineAgentId);
        if (index > -1) {
          connections.splice(index, 1);
        }
      }
      
      console.log(`Agent ${offlineAgentId} went offline - Mesh healed`);
    }
  }

  /**
   * Message Broadcasting - P2P Communication
   */
  private broadcastMessage(message: SwarmMessage): void {
    // Simulate P2P message broadcasting
    this.messageQueue.push(message);
    
    // In real implementation, this would use WebRTC, WebSocket, or similar
    // For now, simulate immediate delivery to connected peers
    const peers = this.meshConnections.get(this.nodeId) || [];
    for (const peerId of peers) {
      this.deliverMessage(peerId, message);
    }
  }

  private deliverMessage(recipientId: string, message: SwarmMessage): void {
    // Simulate message delivery
    const recipient = this.agents.get(recipientId);
    if (recipient) {
      recipient.lastSeen = Date.now();
    }
  }

  // Public API for Vantom OS Integration
  public getSwarmStatus(): {
    totalAgents: number;
    activeTasks: number;
    meshConnections: number;
    safetySignals: number;
    foxmqStats: any;
    vertexStats: any;
    byzantineLatency: number;
  } {
    const foxmqStats = this.foxmqClient.getStatistics();
    const vertexStats = this.vertexConsensus.getStatistics();
    
    return {
      totalAgents: this.agents.size,
      activeTasks: this.activeTasks.size,
      meshConnections: this.meshConnections.get(this.nodeId)?.length || 0,
      safetySignals: this.safetySignals.length,
      foxmqStats,
      vertexStats,
      byzantineLatency: this.byzantineLatency
    };
  }

  public getNearbyAgents(radius: number = 1000): SwarmAgent[] {
    const localAgent = this.agents.get(this.nodeId);
    if (!localAgent) return [];

    return Array.from(this.agents.values())
      .filter(agent => 
        agent.id !== this.nodeId &&
        this.calculateDistance(localAgent.location, agent.location) <= radius
      );
  }

  public async shutdown(): Promise<void> {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }
    
    // Shutdown FoxMQ client
    await this.foxmqClient.disconnect();
    
    // Shutdown Tashi Vertex consensus
    await this.vertexConsensus.shutdown();
    
    this.agents.clear();
    this.messageQueue = [];
    this.activeTasks.clear();
    this.safetySignals = [];
    this.meshConnections.clear();
    this.isInitialized = false;
    
    console.log('Vertex swarm coordinator with FoxMQ + Tashi Vertex shutdown complete');
  }
}

export default VertexSwarmCoordinator;
