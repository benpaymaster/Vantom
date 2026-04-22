import { sampleManifest } from '@/services/mockData';
import DashboardHeader from '@/src/components/DashboardHeader';
import StatCard from '@/src/components/StatCard';
import { useDriverStore } from '@/src/store/driverStore';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { isShiftActive, driverReputation, vantomBalance } = useDriverStore();

  return (
    <ScrollView style={styles.container}>
      <DashboardHeader />
      
      <View style={styles.statsContainer}>
        <StatCard
          title="Today's Earnings"
          value={`$${sampleManifest.totalEarnings.toFixed(2)}`}
          subtitle={`${sampleManifest.deliveries.length} deliveries`}
          accent={true}
          trend="up"
        />
        
        <StatCard
          title="Distance Driven"
          value={`${sampleManifest.totalDistance} mi`}
          subtitle={`${Math.round(sampleManifest.totalDistance / sampleManifest.deliveries.length * 10) / 10} mi avg`}
          trend="neutral"
        />
        
        <StatCard
          title="Packages Delivered"
          value={sampleManifest.totalPackages}
          subtitle={`${sampleManifest.deliveries.filter(d => d.status === 'delivered').length} completed`}
          trend="up"
        />
        
        <StatCard
          title="Driver Rating"
          value={driverReputation.toFixed(1)}
          subtitle="5.0 max"
          accent={true}
          trend="up"
        />
        
        <StatCard
          title="Vantom Balance"
          value={`${vantomBalance} VNT`}
          subtitle="Ready to withdraw"
          accent={true}
          trend="up"
        />
        
        <StatCard
          title="Shift Time"
          value={isShiftActive ? "Active" : "Inactive"}
          subtitle={isShiftActive ? "On shift" : "Off shift"}
          trend={isShiftActive ? "up" : "neutral"}
        />
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={async () => {
            console.log('Map Rescue button pressed - initiating RescueProtocol');
            try {
              const rescueProtocol = new RescueProtocol();
              const startTime = Date.now();
              
              // Simulate rescue coordination
              const rescueResult = await rescueProtocol.initiateRescue({
                rescueId: `RESCUE_${Date.now()}`,
                requestingVan: 'CURRENT_VAN',
                requestTime: startTime,
                reason: 'overloaded',
                urgency: 'medium',
                location: { lat: 40.7128, lng: -74.0060 },
                parcelsToTransfer: 15,
                estimatedBatteryRemaining: 45,
                routeCompletion: 60
              });
              
              const latency = Date.now() - startTime;
              console.log('RescueProtocol executed:', rescueResult);
              Alert.alert('Vertex Handshake', `Rescue protocol completed: ${latency}ms latency`);
            } catch (error) {
              console.error('RescueProtocol error:', error);
              Alert.alert('Rescue Error', 'Failed to initiate rescue protocol');
            }
          }}
        >
          <Text style={styles.actionButtonText}>🗺️ Map Rescue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={async () => {
            console.log('Map Safety button pressed - initiating LocalOptimizer');
            try {
              const localOptimizer = new LocalOptimizer();
              const startTime = Date.now();
              
              // Simulate threat analysis
              const threatResult = await localOptimizer.analyzeThreat({
                threatMessage: "Switch your engine off or you're done.",
                timestamp: startTime,
                severity: 'CRITICAL',
                source: 'whatsapp',
                driverId: 'CURRENT_DRIVER'
              });
              
              const processingTime = Date.now() - startTime;
              console.log('LocalOptimizer executed:', threatResult);
              Alert.alert('Threat Neutralized', `LocalOptimizer processed threat in ${processingTime}ms`);
            } catch (error) {
              console.error('LocalOptimizer error:', error);
              Alert.alert('Safety Error', 'Failed to process threat analysis');
            }
          }}
        >
          <Text style={styles.actionButtonText}>🛡️ Map Safety</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            console.log('Camera button pressed');
            Alert.alert('Camera Ready', 'Vehicle check camera activated');
          }}
        >
          <Text style={styles.actionButtonText}>📸 Camera</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.manifestContainer}>
        <StatCard
          title="Active Deliveries"
          value={sampleManifest.deliveries.filter(d => d.status !== 'delivered').length}
          subtitle={`${sampleManifest.deliveries.filter(d => d.priority === 'express').length} express`}
          trend="neutral"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  statsContainer: {
    padding: 16,
    gap: 12,
  },
  actionContainer: {
    padding: 16,
    gap: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  manifestContainer: {
    padding: 16,
    paddingTop: 0,
  },
});
