// FoxMQ Message Queue Visualizer
// Real-time visualization of FoxMQ message passing for hackathon demo

export interface MessageFlow {
  messageId: string;
  topic: string;
  payload: any;
  qos: number;
  timestamp: number;
  source: string;
  destination: string[];
  status: 'queued' | 'processing' | 'delivered' | 'failed';
}

export interface QueueMetrics {
  totalMessages: number;
  messagesPerSecond: number;
  averageLatency: number;
  queueDepth: number;
  deliveryRate: number;
  failedMessages: number;
}

export class MessageQueueVisualizer {
  private messageFlows: Map<string, MessageFlow> = new Map();
  private metrics: QueueMetrics = {
    totalMessages: 0,
    messagesPerSecond: 0,
    averageLatency: 0,
    queueDepth: 0,
    deliveryRate: 100,
    failedMessages: 0
  };
  private lastSecond = Date.now();
  private messagesInLastSecond = 0;

  // Add message to visualization
  public addMessage(message: Omit<MessageFlow, 'timestamp' | 'status'>): void {
    const messageFlow: MessageFlow = {
      ...message,
      timestamp: Date.now(),
      status: 'queued'
    };

    this.messageFlows.set(messageFlow.messageId, messageFlow);
    this.metrics.totalMessages++;
    this.messagesInLastSecond++;
    
    // Simulate message processing
    this.processMessage(messageFlow);
  }

  // Process message through FoxMQ queue
  private processMessage(message: MessageFlow): void {
    const processingTime = Math.random() * 5 + 1; // 1-6ms processing
    
    setTimeout(() => {
      message.status = 'processing';
      
      setTimeout(() => {
        const success = Math.random() > 0.05; // 95% success rate
        message.status = success ? 'delivered' : 'failed';
        
        if (!success) {
          this.metrics.failedMessages++;
        }
        
        this.updateMetrics();
      }, processingTime);
    }, Math.random() * 10); // 0-10ms queue delay
  }

  // Update queue metrics
  private updateMetrics(): void {
    const now = Date.now();
    const timeDiff = now - this.lastSecond;
    
    if (timeDiff >= 1000) {
      this.metrics.messagesPerSecond = this.messagesInLastSecond;
      this.messagesInLastSecond = 0;
      this.lastSecond = now;
    }
    
    // Calculate average latency
    const deliveredMessages = Array.from(this.messageFlows.values())
      .filter(m => m.status === 'delivered');
    
    if (deliveredMessages.length > 0) {
      const totalLatency = deliveredMessages.reduce((sum, m) => {
        return sum + (m.timestamp - Date.now());
      }, 0);
      this.metrics.averageLatency = Math.abs(totalLatency / deliveredMessages.length);
    }
    
    // Update queue depth
    this.metrics.queueDepth = this.messageFlows.size;
  }

  // Get current metrics
  public getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  // Get active message flows
  public getActiveMessages(): MessageFlow[] {
    return Array.from(this.messageFlows.values())
      .filter(m => m.status === 'queued' || m.status === 'processing');
  }

  // Get message statistics by topic
  public getTopicStats(): Map<string, number> {
    const topicStats = new Map<string, number>();
    
    this.messageFlows.forEach(message => {
      const count = topicStats.get(message.topic) || 0;
      topicStats.set(message.topic, count + 1);
    });
    
    return topicStats;
  }

  // Simulate Byzantine message tampering
  public simulateByzantineAttack(): void {
    const activeMessages = this.getActiveMessages();
    if (activeMessages.length > 0) {
      const targetMessage = activeMessages[Math.floor(Math.random() * activeMessages.length)];
      targetMessage.status = 'failed';
      this.metrics.failedMessages++;
      
      console.log(`🔥 BYZANTINE ATTACK: Message ${targetMessage.messageId} compromised`);
    }
  }

  // Clear old messages
  public clearOldMessages(maxAge: number = 60000): void {
    const cutoff = Date.now() - maxAge;
    
    for (const [messageId, message] of this.messageFlows.entries()) {
      if (message.timestamp < cutoff) {
        this.messageFlows.delete(messageId);
      }
    }
  }

  // Export visualization data
  public exportVisualizationData(): {
    metrics: QueueMetrics;
    activeMessages: MessageFlow[];
    topicStats: Map<string, number>;
    timestamp: number;
  } {
    return {
      metrics: this.getMetrics(),
      activeMessages: this.getActiveMessages(),
      topicStats: this.getTopicStats(),
      timestamp: Date.now()
    };
  }
}
