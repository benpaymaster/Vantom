import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDriverStore } from '../store/driverStore';

const DashboardHeader: React.FC = () => {
  const { isShiftActive, driverReputation, vantomBalance, toggleShift } = useDriverStore();

  return (
    <View className="bg-background p-6 rounded-b-3xl shadow-lg">
      {/* Status Bar */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">Vantom Driver</Text>
          <Text className="text-gray-400 text-sm mt-1">
            {isShiftActive ? 'On Shift' : 'Off Shift'}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={toggleShift}
          className={`px-6 py-3 rounded-full ${
            isShiftActive ? 'bg-accent' : 'bg-gray-700'
          }`}
        >
          <Text className={`font-semibold ${
            isShiftActive ? 'text-background' : 'text-white'
          }`}>
            {isShiftActive ? 'End Shift' : 'Start Shift'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View className="flex-row justify-between mt-6">
        <View className="flex-1">
          <Text className="text-gray-400 text-xs uppercase tracking-wider">Reputation</Text>
          <Text className="text-white text-xl font-bold mt-1">{driverReputation}</Text>
        </View>
        
        <View className="flex-1 items-center">
          <Text className="text-gray-400 text-xs uppercase tracking-wider">Balance</Text>
          <Text className="text-accent text-xl font-bold mt-1">{vantomBalance} VNT</Text>
        </View>
        
        <View className="flex-1 items-end">
          <Text className="text-gray-400 text-xs uppercase tracking-wider">Status</Text>
          <View className={`w-3 h-3 rounded-full mt-2 ${
            isShiftActive ? 'bg-accent' : 'bg-gray-500'
          }`} />
        </View>
      </View>

      {/* Active Shift Indicator */}
      {isShiftActive && (
        <View className="bg-accent/20 border border-accent rounded-lg p-3 mt-4">
          <Text className="text-accent text-center text-sm font-medium">
            Active Shift - Deliveries Available
          </Text>
        </View>
      )}
    </View>
  );
};

export default DashboardHeader;
