import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { analyzeImage } from '@/ai/analyze';
import { Button, IconButton, Text } from '@/components/ui';
import { makeId } from '@/lib/id';
import { persistScanImage } from '@/lib/image';
import { useScansStore } from '@/store/scans';
import { useSettingsStore } from '@/store/settings';
import { useAppTheme } from '@/theme';
import type { Scan } from '@/types/scan';

export default function ScanScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const language = useSettingsStore((state) => state.language);
  const addScan = useScansStore((state) => state.addScan);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(true);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [frameHeight, setFrameHeight] = useState(260);
  const cameraRef = useRef<CameraView>(null);
  const [scanAnim] = useState(() => new Animated.Value(0));
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
        setReady(false);
      };
    }, []),
  );

  useEffect(() => {
    if (!focused || capturedUri) {
      return;
    }

    const loop = Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 2600,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();

    return () => {
      loop.stop();
      scanAnim.setValue(0);
    };
  }, [capturedUri, focused, scanAnim]);

  useEffect(() => {
    return () => {
      if (stepTimer.current) {
        clearInterval(stepTimer.current);
      }
    };
  }, []);

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
    setReady(false);
  };

  const openSettings = () => {
    void Linking.openSettings();
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setCapturedUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('Gallery pick failed', error);
      Alert.alert(t('camera.errorTitle'), t('camera.galleryError'));
    }
  };

  const takePhoto = async () => {
    if (!ready || !cameraRef.current) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        void Haptics.selectionAsync();
      }
    } catch (error) {
      console.warn('Capture failed', error);
      Alert.alert(t('camera.errorTitle'), t('camera.errorBody'));
    }
  };

  const cancelAnalysis = () => {
    cancelledRef.current = true;
    if (stepTimer.current) {
      clearInterval(stepTimer.current);
      stepTimer.current = null;
    }
    setAnalyzing(false);
    setStep(0);
  };

  const runAnalysis = async () => {
    if (!capturedUri || analyzing) {
      return;
    }

    cancelledRef.current = false;
    setAnalyzing(true);
    setStep(0);
    stepTimer.current = setInterval(() => {
      setStep((current) => Math.min(3, current + 1));
    }, 650);

    try {
      const id = makeId('scan');
      const permanentUri = await persistScanImage(capturedUri, id);
      const result = await analyzeImage(permanentUri, language);

      if (stepTimer.current) {
        clearInterval(stepTimer.current);
        stepTimer.current = null;
      }

      if (cancelledRef.current) {
        return;
      }

      const scan: Scan = {
        id,
        createdAt: new Date().toISOString(),
        imageUri: permanentUri,
        locale: language,
        model: result.model,
        ...result.analysis,
      };

      addScan(scan);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAnalyzing(false);
      setStep(0);
      setCapturedUri(null);
      router.push(`/scan/${id}`);
    } catch (error) {
      console.warn('Analysis failed', error);
      if (stepTimer.current) {
        clearInterval(stepTimer.current);
        stepTimer.current = null;
      }
      setAnalyzing(false);
      setStep(0);
      if (!cancelledRef.current) {
        Alert.alert(t('camera.errorTitle'), t('camera.errorBody'));
      }
    }
  };

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingHorizontal: 28 }]}>
        <View style={[styles.permissionIcon, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
          <Feather name="camera-off" size={28} color={colors.accent} />
        </View>
        <Text variant="heading" style={styles.centerText}>
          {t('camera.permissionTitle')}
        </Text>
        <Text tone="secondary" style={[styles.centerText, styles.permissionBody]}>
          {t('camera.permissionBody')}
        </Text>
        <View style={styles.permissionActions}>
          {permission.canAskAgain ? (
            <Button label={t('camera.grant')} onPress={() => void requestPermission()} icon="camera" />
          ) : (
            <Button label={t('camera.openSettings')} onPress={openSettings} icon="settings" />
          )}
          <Button label={t('camera.gallery')} onPress={pickFromGallery} variant="secondary" icon="image" />
        </View>
      </View>
    );
  }

  if (capturedUri) {
    return (
      <View style={styles.root}>
        <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} contentFit="contain" />
        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <SafeAreaView edges={['top']} style={styles.previewHeader}>
          <IconButton
            icon="arrow-left"
            accessibilityLabel={t('camera.retake')}
            onPress={() => setCapturedUri(null)}
            background="rgba(8,10,11,0.62)"
            color="#FFFFFF"
          />
          <Text variant="bodyStrong" style={styles.whiteText}>
            {t('camera.readyTitle')}
          </Text>
          <View style={styles.headerSpacer} />
        </SafeAreaView>

        <View style={styles.previewBottom}>
          <Text tone="secondary" style={[styles.centerText, styles.whiteSecondary]}>
            {t('camera.readyBody')}
          </Text>
          <View style={styles.previewActions}>
            <Button
              label={t('camera.retake')}
              onPress={() => setCapturedUri(null)}
              variant="secondary"
              icon="rotate-ccw"
              style={styles.previewButton}
            />
            <Button
              label={t('camera.usePhoto')}
              onPress={runAnalysis}
              icon="zap"
              style={styles.previewButton}
            />
          </View>
        </View>

        {analyzing ? (
          <AnalysisOverlay
            step={step}
            onCancel={cancelAnalysis}
            colors={colors}
            labels={[
              t('camera.stepDetect'),
              t('camera.stepLabels'),
              t('camera.stepDamage'),
              t('camera.stepRepair'),
            ]}
            title={t('camera.analyzingTitle')}
            body={t('camera.analyzingBody')}
            cancelLabel={t('camera.cancel')}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {focused ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
          active={focused}
          onCameraReady={() => setReady(true)}
        />
      ) : null}

      <LinearGradient
        colors={['rgba(0,0,0,0.72)', 'transparent', 'rgba(0,0,0,0.78)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView edges={['top']} style={styles.cameraHeader}>
        <View style={styles.headerText}>
          <Text variant="heading" style={styles.whiteText}>
            {t('camera.title')}
          </Text>
          <Text variant="caption" style={styles.whiteSecondary} numberOfLines={1}>
            {t('camera.hint')}
          </Text>
        </View>
        <IconButton
          icon={flash === 'on' ? 'zap' : 'zap-off'}
          accessibilityLabel={t('camera.flash')}
          onPress={toggleFlash}
          background="rgba(8,10,11,0.55)"
          color={flash === 'on' ? colors.accent : '#FFFFFF'}
        />
      </SafeAreaView>

      <View style={styles.frameWrap} pointerEvents="none">
        <View style={styles.frame} onLayout={(event) => setFrameHeight(event.nativeEvent.layout.height)}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <View style={[styles.frameLine, styles.frameLineVertical]} />
          <View style={[styles.frameLine, styles.frameLineHorizontal]} />
          <Animated.View
            style={[
              styles.scanLine,
              {
                backgroundColor: colors.accent,
                transform: [
                  {
                    translateY: scanAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.max(0, frameHeight - 2)],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.bottomArea}>
        <Text variant="caption" style={[styles.centerText, styles.hint]}>
          {t('camera.tip')}
        </Text>
        <View style={styles.controls}>
          <IconButton
            icon="image"
            accessibilityLabel={t('camera.gallery')}
            onPress={pickFromGallery}
            background="rgba(8,10,11,0.55)"
            color="#FFFFFF"
            size={21}
            style={styles.controlButton}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('camera.capture')}
            onPress={takePhoto}
            style={({ pressed }) => [styles.shutterOuter, pressed && styles.shutterPressed]}>
            <View style={[styles.shutterInner, { backgroundColor: colors.accent }]} />
          </Pressable>
          <IconButton
            icon="refresh-cw"
            accessibilityLabel={t('camera.flip')}
            onPress={toggleFacing}
            background="rgba(8,10,11,0.55)"
            color="#FFFFFF"
            size={20}
            style={styles.controlButton}
          />
        </View>
      </View>

      {!ready ? (
        <View style={styles.loadingCamera} pointerEvents="none">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}
    </View>
  );
}

function AnalysisOverlay({
  step,
  onCancel,
  colors,
  labels,
  title,
  body,
  cancelLabel,
}: {
  step: number;
  onCancel: () => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
  labels: string[];
  title: string;
  body: string;
  cancelLabel: string;
}) {
  return (
    <View style={[styles.analysisOverlay, { backgroundColor: colors.background }]}>
      <View style={[styles.analysisIcon, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
        <Feather name="aperture" size={30} color={colors.accent} />
      </View>
      <Text variant="heading" style={styles.centerText}>
        {title}
      </Text>
      <Text tone="secondary" style={[styles.centerText, styles.analysisBody]}>
        {body}
      </Text>

      <View style={styles.analysisSteps}>
        {labels.map((label, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <View key={label} style={styles.analysisStep}>
              <View
                style={[
                  styles.analysisStepIcon,
                  {
                    backgroundColor: done ? colors.accentSoft : colors.surface,
                    borderColor: done ? colors.accentBorder : colors.border,
                  },
                ]}>
                {done ? (
                  <Feather name="check" size={12} color={colors.accent} />
                ) : current ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <View style={[styles.stepDot, { backgroundColor: colors.textMuted }]} />
                )}
              </View>
              <Text variant={current ? 'bodyStrong' : 'caption'} tone={done || current ? 'primary' : 'muted'}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <Button label={cancelLabel} onPress={onCancel} variant="ghost" style={styles.cancelButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  centerText: {
    textAlign: 'center',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  whiteSecondary: {
    color: 'rgba(255,255,255,0.72)',
  },
  permissionIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  permissionBody: {
    marginTop: 8,
    maxWidth: 340,
  },
  permissionActions: {
    marginTop: 26,
    gap: 10,
    alignSelf: 'stretch',
    maxWidth: 340,
    width: '100%',
  },
  cameraHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  headerSpacer: {
    width: 42,
  },
  frameWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  frame: {
    width: '86%',
    maxWidth: 460,
    aspectRatio: 1.18,
    borderRadius: 26,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  frameLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  frameLineVertical: {
    top: 0,
    bottom: 0,
    left: '50%',
    width: StyleSheet.hairlineWidth,
  },
  frameLineHorizontal: {
    left: 0,
    right: 0,
    top: '50%',
    height: StyleSheet.hairlineWidth,
  },
  scanLine: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 0,
    height: 2,
    opacity: 0.75,
    shadowColor: '#C8F751',
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 26,
    paddingBottom: 26,
    gap: 20,
  },
  hint: {
    color: 'rgba(255,255,255,0.65)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  shutterOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  loadingCamera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 16,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  previewButton: {
    flex: 1,
  },
  analysisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  analysisIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  analysisBody: {
    marginTop: 7,
  },
  analysisSteps: {
    marginTop: 30,
    gap: 14,
    alignSelf: 'stretch',
    maxWidth: 320,
    width: '100%',
  },
  analysisStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analysisStepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.6,
  },
  cancelButton: {
    marginTop: 28,
  },
});
