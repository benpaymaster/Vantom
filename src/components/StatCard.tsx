import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  accent = false,
  trend = 'neutral'
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-accent';
      case 'down': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getTrendSymbol = () => {
    switch (trend) {
      case 'up': return '>';
      case 'down': return '<';
      default: return '=';
    }
  };

  return (
    <View className="bg-background p-4 rounded-2xl border border-gray-800 shadow-lg">
      <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2">
        {title}
      </Text>
      
      <View className="flex-row items-end justify-between">
        <View className="flex-1">
          <Text className={`text-2xl font-bold ${
            accent ? 'text-accent' : 'text-white'
          }`}>
            {value}
          </Text>
          
          {subtitle && (
            <Text className="text-gray-500 text-xs mt-1">
              {subtitle}
            </Text>
          )}
        </View>
        
        {trend !== 'neutral' && (
          <View className="ml-3 items-end">
            <Text className={`text-lg font-bold ${getTrendColor()}`}>
              {getTrendSymbol()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default StatCard;
