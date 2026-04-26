// Tashi Vertex Consensus Visualizer
// Real-time visualization of BFT consensus rounds for hackathon demo

export interface ConsensusEvent {
  eventId: string;
  creatorId: string;
  parents: string[];
  payload: any;
  signature: string;
  timestamp: number;
  round: number;
  fame: number;
  witnesses: string[];
}

export interface ConsensusMetrics {
  totalEvents: number;
  consensusRounds: number;
  averageRoundTime: number;
  byzantineNodes: number;
  honestNodes: number;
  finalityRate: number;
  virtualVotes: number;
}

export class ConsensusVisualizer {
  private events: Map<string, ConsensusEvent> = new Map();
  private dagLayers: Map<number, ConsensusEvent[]> = new Map();
  private metrics: ConsensusMetrics = {
    totalEvents: 0,
    consensusRounds: 0,
    averageRoundTime: 0,
    byzantineNodes: 0,
    honestNodes: 0,
    finalityRate: 0,
    virtualVotes: 0
  };
  private currentRound = 0;
  private roundStartTime = 0;

  // Add event to consensus DAG
  public addEvent(eventData: Omit<ConsensusEvent, 'eventId' | 'timestamp' | 'round'>): string {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event: ConsensusEvent = {
      ...eventData,
      eventId,
      timestamp: Date.now(),
      round: this.currentRound,
      fame: 0,
      witnesses: []
    };

    this.events.set(eventId, event);
    this.metrics.totalEvents++;
    
    // Add to DAG layer
    const layer = this.dagLayers.get(event.round) || [];
    layer.push(event);
    this.dagLayers.set(event.round, layer);

    return eventId;
  }

  // Process consensus round
  public processConsensusRound(): void {
    this.roundStartTime = Date.now();
    this.currentRound++;
    
    const eventsInRound = this.dagLayers.get(this.currentRound - 1) || [];
    
    // Simulate virtual voting
    eventsInRound.forEach(event => {
      this.calculateVirtualVotes(event);
    });

    // Determine fame
    this.calculateFame();
    
    // Complete round
    const roundTime = Date.now() - this.roundStartTime;
    this.updateMetrics(roundTime);
    
    console.log(`🔄 Consensus Round ${this.currentRound - 1} completed in ${roundTime.toFixed(2)}ms`);
  }

  // Calculate virtual votes for an event
  private calculateVirtualVotes(event: ConsensusEvent): void {
    const witnesses = this.selectWitnesses();
    event.witnesses = witnesses;
    
    // Virtual voting - no actual votes transmitted
    // Fame is calculated through DAG structure
    this.metrics.virtualVotes += witnesses.length;
  }

  // Select witnesses for virtual voting
  private selectWitnesses(): string[] {
    const allNodes = Array.from(this.events.keys())
      .map(eventId => this.events.get(eventId)!.creatorId)
      .filter((nodeId, index, arr) => arr.indexOf(nodeId) === index); // Unique nodes
    
    const witnessCount = Math.max(1, Math.floor(allNodes.length / 3));
    const shuffled = [...allNodes].sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, witnessCount);
  }

  // Calculate fame for events
  private calculateFame(): void {
    this.events.forEach(event => {
      const witnessCount = event.witnesses.length;
      const totalNodes = this.events.size;
      
      // Fame calculation based on witness ratio
      event.fame = witnessCount / totalNodes;
    });
  }

  // Update consensus metrics
  private updateMetrics(roundTime: number): void {
    this.metrics.consensusRounds++;
    
    // Update average round time
    this.metrics.averageRoundTime = 
      (this.metrics.averageRoundTime * (this.metrics.consensusRounds - 1) + roundTime) / 
      this.metrics.consensusRounds;
    
    // Calculate finality rate
    const famousEvents = Array.from(this.events.values())
      .filter(event => event.fame > 0.5);
    
    this.metrics.finalityRate = (famousEvents.length / this.events.size) * 100;
  }

  // Simulate Byzantine node behavior
  public simulateByzantineNode(nodeId: string): void {
    const nodeEvents = Array.from(this.events.values())
      .filter(event => event.creatorId === nodeId);
    
    // Make Byzantine events have conflicting parents
    nodeEvents.forEach(event => {
      if (Math.random() < 0.3) { // 30% chance of malicious behavior
        event.parents = []; // Break DAG structure
        console.log(`💀 BYZANTINE NODE ${nodeId} creating conflicting event`);
      }
    });
    
    this.metrics.byzantineNodes++;
  }

  // Get consensus DAG visualization data
  public getDAGVisualization(): {
    layers: number[][];
    events: ConsensusEvent[];
    metrics: ConsensusMetrics;
  } {
    const layers = Array.from(this.dagLayers.entries())
      .sort(([a], [b]) => a - b)
      .map(([_, events]) => events.map(e => this.events.size));
    
    return {
      layers,
      events: Array.from(this.events.values()),
      metrics: this.getMetrics()
    };
  }

  // Get current metrics
  public getMetrics(): ConsensusMetrics {
    // Count honest vs Byzantine nodes
    const nodeBehaviors = new Map<string, boolean>();
    
    this.events.forEach(event => {
      const isHonest = event.parents.length > 0; // Honest events have parents
      const current = nodeBehaviors.get(event.creatorId) || true;
      nodeBehaviors.set(event.creatorId, current && isHonest);
    });
    
    this.metrics.honestNodes = Array.from(nodeBehaviors.values()).filter(honest => honest).length;
    this.metrics.byzantineNodes = Array.from(nodeBehaviors.values()).filter(honest => !honest).length;
    
    return { ...this.metrics };
  }

  // Get consensus statistics
  public getConsensusStats(): {
    totalEvents: number;
    averageFame: number;
    finalityRate: number;
    byzantineTolerance: number;
  } {
    const events = Array.from(this.events.values());
    const averageFame = events.reduce((sum, event) => sum + event.fame, 0) / events.length;
    
    return {
      totalEvents: this.metrics.totalEvents,
      averageFame,
      finalityRate: this.metrics.finalityRate,
      byzantineTolerance: this.metrics.byzantineNodes / (this.metrics.honestNodes + this.metrics.byzantineNodes)
    };
  }

  // Reset consensus state
  public reset(): void {
    this.events.clear();
    this.dagLayers.clear();
    this.currentRound = 0;
    this.metrics = {
      totalEvents: 0,
      consensusRounds: 0,
      averageRoundTime: 0,
      byzantineNodes: 0,
      honestNodes: 0,
      finalityRate: 0,
      virtualVotes: 0
    };
  }

  // Export consensus data for visualization
  public exportConsensusData(): {
    dag: any;
    metrics: ConsensusMetrics;
    stats: any;
    timestamp: number;
  } {
    return {
      dag: this.getDAGVisualization(),
      metrics: this.getMetrics(),
      stats: this.getConsensusStats(),
      timestamp: Date.now()
    };
  }
}
