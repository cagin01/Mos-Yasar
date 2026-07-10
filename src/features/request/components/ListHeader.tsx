import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/shared/components/ui/ScaledText';


const ListHeader = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.primary }]}>{t.requests.listTitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 5,
  },
});

export default ListHeader;