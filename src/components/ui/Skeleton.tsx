import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.md,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={14} />
      </View>
      
      <View style={styles.content}>
        <Skeleton width="100%" height={14} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="60%" height={14} />
      </View>
      
      <View style={styles.footer}>
        <Skeleton width={100} height={32} borderRadius={theme.borderRadius.lg} />
      </View>
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 3, 
  style 
}) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={styles.listItem} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.border.secondary,
    opacity: 0.6,
  },
  
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  
  header: {
    marginBottom: theme.spacing[3],
  },
  
  content: {
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
  listItem: {
    marginBottom: theme.spacing[3],
  },
});