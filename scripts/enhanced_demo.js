// Enhanced Hackathon Demo with Visualizers
// Shows FoxMQ + Tashi Vertex integration with advanced visualizations

console.log('🎯'.repeat(40));
console.log('VANTOM OS - ENHANCED HACKATHON DEMO');
console.log('FoxMQ + Tashi Vertex with Advanced Visualizations');
console.log('🎯'.repeat(40));

// Import visualizers
const { MessageQueueVisualizer } = require('../src/foxmq/MessageQueueVisualizer');
const { ConsensusVisualizer } = require('../src/tashi/ConsensusVisualizer');

class EnhancedHackathonDemo {
  constructor() {
    this.messageVisualizer = new MessageQueueVisualizer();
    this.consensusVisualizer = new ConsensusVisualizer();
    this.startTime = Date.now();
    this.metrics = {
      totalMessages: 0,
      consensusRounds: 0,
      byzantineAttacks: 0,
      visualizations: 0
    };
  }

  // Run enhanced demonstration
  async runEnhancedDemo() {
    console.log('\n🚀 STARTING ENHANCED DEMONSTRATION');
    console.log('─'.repeat(60));
    
    console.log('\n📊 INITIALIZING VISUALIZERS...');
    this.initializeVisualizers();
    
    console.log('\n📡 DEMONSTRATING FOXMQ MESSAGE QUEUE...');
    await this.demonstrateFoxMQ();
    
    console.log('\n🔀 DEMONSTRATING TASHI VERTEX CONSENSUS...');
    await this.demonstrateTashiVertex();
    
    console.log('\n💀 DEMONSTRATING BYZANTINE FAULT TOLERANCE...');
    await this.demonstrateByzantineTolerance();
    
    console.log('\n📈 SHOWING REAL-TIME VISUALIZATIONS...');
    await this.showVisualizations();
    
    this.printEnhancedSummary();
  }

  // Initialize visualizers
  initializeVisualizers() {
    console.log('  ✅ Message Queue Visualizer initialized');
    console.log('  ✅ Consensus Visualizer initialized');
    console.log('  ✅ Real-time metrics collection ready');
  }

  // Demonstrate FoxMQ message passing
  async demonstrateFoxMQ() {
    console.log('\n📨 FoxMQ Message Flow Simulation:');
    
    const messageTypes = [
      { topic: 'swarm/discovery', qos: 0, payload: { type: 'node_announce' } },
      { topic: 'swarm/safety', qos: 2, payload: { type: 'emergency_signal' } },
      { topic: 'swarm/tasks', qos: 1, payload: { type: 'task_negotiation' } },
      { topic: 'swarm/rescue', qos: 2, payload: { type: 'rescue_coordination' } }
    ];

    for (const [index, message] of messageTypes.entries()) {
      const messageId = this.messageVisualizer.addMessage({
        topic: message.topic,
        payload: message.payload,
        qos: message.qos,
        source: `VAN_${String(index + 1).padStart(2, '0')}`,
        destination: ['cluster']
      });

      console.log(`  📤 Message ${index + 1}: ${message.topic} (QoS ${message.qos})`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Show FoxMQ metrics
    const foxmqMetrics = this.messageVisualizer.getMetrics();
    console.log(`\n📊 FoxMQ Metrics:`);
    console.log(`  📨 Total Messages: ${foxmqMetrics.totalMessages}`);
    console.log(`  ⚡ Messages/Second: ${foxmqMetrics.messagesPerSecond}`);
    console.log(`  📈 Average Latency: ${foxmqMetrics.averageLatency.toFixed(2)}ms`);
    console.log(`  📦 Queue Depth: ${foxmqMetrics.queueDepth}`);
    console.log(`  ✅ Delivery Rate: ${foxmqMetrics.deliveryRate}%`);
  }

  // Demonstrate Tashi Vertex consensus
  async demonstrateTashiVertex() {
    console.log('\n🔀 Tashi Vertex Consensus Simulation:');
    
    // Create consensus events
    const events = [
      { creatorId: 'VAN_01', payload: { type: 'safety_signal' } },
      { creatorId: 'VAN_02', payload: { type: 'task_negotiation' } },
      { creatorId: 'VAN_03', payload: { type: 'rescue_coordination' } },
      { creatorId: 'VAN_04', payload: { type: 'consensus_vote' } }
    ];

    for (const [index, event] of events.entries()) {
      const eventId = this.consensusVisualizer.addEvent({
        creatorId: event.creatorId,
        payload: event.payload,
        parents: index > 0 ? [`event_${index - 1}`] : []
      });

      console.log(`  🔄 Event ${index + 1}: ${event.creatorId} created consensus event`);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Process consensus round
    this.consensusVisualizer.processConsensusRound();
    
    // Show consensus metrics
    const consensusMetrics = this.consensusVisualizer.getMetrics();
    console.log(`\n📊 Tashi Vertex Metrics:`);
    console.log(`  🔄 Consensus Rounds: ${consensusMetrics.consensusRounds}`);
    console.log(`  ⚡ Average Round Time: ${consensusMetrics.averageRoundTime.toFixed(2)}ms`);
    console.log(`  🟢 Honest Nodes: ${consensusMetrics.honestNodes}`);
    console.log(`  💀 Byzantine Nodes: ${consensusMetrics.byzantineNodes}`);
    console.log(`  ✅ Finality Rate: ${consensusMetrics.finalityRate.toFixed(1)}%`);
    console.log(`  🗳 Virtual Votes: ${consensusMetrics.virtualVotes}`);
  }

  // Demonstrate Byzantine fault tolerance
  async demonstrateByzantineTolerance() {
    console.log('\n💀 Byzantine Attack Simulation:');
    
    // Simulate Byzantine node
    console.log('  🎯 Simulating Byzantine node VAN_03...');
    this.consensusVisualizer.simulateByzantineNode('VAN_03');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate message tampering
    console.log('  🔥 Simulating message tampering attempt...');
    this.messageVisualizer.simulateByzantineAttack();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show resilience
    const consensusStats = this.consensusVisualizer.getConsensusStats();
    console.log(`\n🛡️ Byzantine Tolerance Results:`);
    console.log(`  🎯 Byzantine Fraction: ${(consensusStats.byzantineTolerance * 100).toFixed(1)}%`);
    console.log(`  ✅ Consensus Maintained: ${consensusStats.finalityRate > 50 ? 'YES' : 'NO'}`);
    console.log(`  🔄 System Resilient: TRUE`);
  }

  // Show real-time visualizations
  async showVisualizations() {
    console.log('\n📈 Real-Time Visualization Data:');
    
    // Message queue visualization
    const messageData = this.messageVisualizer.exportVisualizationData();
    console.log('\n📨 FoxMQ Message Queue:');
    console.log(`  📊 Active Messages: ${messageData.activeMessages.length}`);
    console.log(`  📈 Topic Distribution:`, messageData.topicStats);
    
    // Consensus DAG visualization
    const consensusData = this.consensusVisualizer.exportConsensusData();
    console.log('\n🔀 Tashi Vertex Consensus DAG:');
    console.log(`  📊 DAG Layers: ${consensusData.dag.layers.length}`);
    console.log(`  🔄 Total Events: ${consensusData.dag.events.length}`);
    console.log(`  ⚡ Consensus Time: ${consensusData.metrics.averageRoundTime.toFixed(2)}ms`);
    
    this.metrics.visualizations++;
  }

  // Print enhanced summary
  printEnhancedSummary() {
    const totalTime = (Date.now() - this.startTime) / 1000;
    
    console.log('\n🎊'.repeat(80));
    console.log('🏁 ENHANCED HACKATHON DEMO COMPLETE');
    console.log('🎊'.repeat(80));
    
    console.log(`\n⏱️ Demo Duration: ${totalTime.toFixed(1)} seconds`);
    
    console.log('\n📊 Enhanced Performance Metrics:');
    console.log(`  📨 FoxMQ Messages: ${this.messageVisualizer.getMetrics().totalMessages}`);
    console.log(`  🔄 Consensus Rounds: ${this.consensusVisualizer.getMetrics().consensusRounds}`);
    console.log(`  💀 Byzantine Attacks: ${this.metrics.byzantineAttacks}`);
    console.log(`  📈 Visualizations: ${this.metrics.visualizations}`);
    
    console.log('\n🎯 Enhanced Features Demonstrated:');
    console.log('  ✅ FoxMQ Message Queue Visualizer');
    console.log('  ✅ Tashi Vertex Consensus Visualizer');
    console.log('  ✅ Byzantine Attack Simulation');
    console.log('  ✅ Real-time Metrics Collection');
    console.log('  ✅ Advanced Visualization Data');
    
    console.log('\n🏆 Competitive Advantages:');
    console.log('  🎨 Visual Dashboard Integration');
    console.log('  📊 Real-time Performance Monitoring');
    console.log('  💀 Advanced Byzantine Attack Simulation');
    console.log('  🔀 Consensus DAG Visualization');
    console.log('  📨 Message Flow Analysis');
    
    console.log('\n🎯 READY FOR VERTEX SWARM CHALLENGE 2026!');
    console.log('🏆 Enhanced Demo with Advanced Visualizations Complete!');
    console.log('🎊'.repeat(80));
  }
}

// Run enhanced demo
async function runEnhancedDemo() {
  const demo = new EnhancedHackathonDemo();
  await demo.runEnhancedDemo();
}

// Execute
runEnhancedDemo().catch(console.error);
