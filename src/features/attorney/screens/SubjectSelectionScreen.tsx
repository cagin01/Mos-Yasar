import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import ScreenHeader from '@/src/shared/components/ui/ScreenHeader';
import { AppColors } from '@/src/shared/theme/colors';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAttorney } from '../context/AttorneyContext';
import { Text } from '@/src/shared/components/ui/ScaledText';


const AnimatedPill = ({
  children,
  index,
}: {
  children: (isAnimationComplete: boolean) => React.ReactNode;
  index: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start(() => setIsAnimationComplete(true));
  }, [fadeAnim, index, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children(isAnimationComplete)}
    </Animated.View>
  );
};

export default function SubjectSelectionScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { availableSubjects, selectedSubjectIds, setSelectedSubjectIds } = useAttorney();
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const initialSelectionRef = useRef<number[]>(selectedSubjectIds);

  const toggleSelection = (id: number) => {
    setSelectedSubjectIds(
      selectedSubjectIds.includes(id)
        ? selectedSubjectIds.filter((item) => item !== id)
        : [...selectedSubjectIds, id],
    );
  };

  const handleBackPress = () => {
    const initial = initialSelectionRef.current;
    const hasChanges =
      selectedSubjectIds.length !== initial.length ||
      selectedSubjectIds.some((id) => !initial.includes(id));

    if (hasChanges) {
      setIsWarningVisible(true);
      return;
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title={t.attorney.selectSubject}
        onBack={handleBackPress}
        rightElement={
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
            <Text style={styles.doneButtonText}>{t.attorney.done}</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={availableSubjects}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isSelected = selectedSubjectIds.includes(item.id);
          return (
            <AnimatedPill index={index}>
              {(isAnimationComplete) => (
                <TouchableOpacity
                  style={[
                    styles.pillContainer,
                    isAnimationComplete && styles.pillShadow,
                    isSelected && styles.pillContainerSelected,
                  ]}
                  onPress={() => toggleSelection(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {item.name}
                  </Text>
                  <View style={styles.iconPlaceholder}>
                    {isSelected && <Ionicons name="checkmark-circle" size={26} color={colors.primary} />}
                  </View>
                </TouchableOpacity>
              )}
            </AnimatedPill>
          );
        }}
      />

      <ConfirmModal
        visible={isWarningVisible}
        message={t.common.unsavedChanges}
        onCancel={() => setIsWarningVisible(false)}
        onConfirm={() => {
          setIsWarningVisible(false);
          setSelectedSubjectIds(initialSelectionRef.current);
          router.back();
        }}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    iconPlaceholder: { width: 26, height: 26, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: 20, paddingBottom: 40 },
    doneButtonText: { color: colors.primary, fontWeight: 'normal', fontSize: 16 },
    pillContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 30, marginBottom: 12, borderWidth: 1.5, borderColor: colors.border },
    pillShadow: { elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    pillContainerSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLightBorder },
    pillText: { fontSize: 16, color: colors.textBody, fontWeight: '400' },
    pillTextSelected: { color: colors.primary, fontWeight: '400', fontSize: 16 },
  });
