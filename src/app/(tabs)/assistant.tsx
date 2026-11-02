import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScanArtwork } from '@/components/scan-artwork';
import { Badge, Chip, EmptyState, IconButton, Screen, Text } from '@/components/ui';
import { buildAssistantReply } from '@/lib/assistant-reply';
import { makeId } from '@/lib/id';
import { useAssistantStore } from '@/store/assistant';
import { useScansStore } from '@/store/scans';
import { fontFamily, useAppTheme } from '@/theme';

export default function AssistantScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const scans = useScansStore((state) => state.scans);
  const activeScanId = useAssistantStore((state) => state.activeScanId);
  const setActiveScanId = useAssistantStore((state) => state.setActiveScanId);
  const messages = useAssistantStore((state) => state.messages);
  const addMessage = useAssistantStore((state) => state.addMessage);
  const updateMessage = useAssistantStore((state) => state.updateMessage);
  const clearMessages = useAssistantStore((state) => state.clearMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeScan = scans.find((scan) => scan.id === activeScanId) ?? scans[0] ?? null;

  useEffect(() => {
    if (!activeScanId && scans[0]) {
      setActiveScanId(scans[0].id);
      return;
    }
    if (activeScanId && scans.length > 0 && !scans.some((scan) => scan.id === activeScanId)) {
      setActiveScanId(scans[0].id);
    }
  }, [activeScanId, scans, setActiveScanId]);

  useEffect(() => {
    return () => {
      if (revealTimer.current) {
        clearInterval(revealTimer.current);
      }
      if (replyTimer.current) {
        clearTimeout(replyTimer.current);
      }
    };
  }, []);

  const stopReveal = () => {
    if (revealTimer.current) {
      clearInterval(revealTimer.current);
      revealTimer.current = null;
    }
    if (replyTimer.current) {
      clearTimeout(replyTimer.current);
      replyTimer.current = null;
    }
    setTyping(false);
  };

  const send = (value?: string) => {
    const content = (value ?? input).trim();
    if (!content || typing || !activeScan) {
      return;
    }

    setInput('');
    addMessage({ id: makeId('msg'), role: 'user', text: content, createdAt: new Date().toISOString() });
    setTyping(true);

    const reply = buildAssistantReply(activeScan, content);
    const replyId = makeId('msg');

    replyTimer.current = setTimeout(() => {
      addMessage({ id: replyId, role: 'assistant', text: '', createdAt: new Date().toISOString() });
      setTyping(false);

      let cursor = 0;
      revealTimer.current = setInterval(() => {
        cursor += 4;
        updateMessage(replyId, reply.slice(0, cursor));
        if (cursor >= reply.length) {
          if (revealTimer.current) {
            clearInterval(revealTimer.current);
            revealTimer.current = null;
          }
        }
      }, 16);
    }, 700);
  };

  const selectScan = (scanId: string) => {
    stopReveal();
    setActiveScanId(scanId);
  };

  const newChat = () => {
    stopReveal();
    clearMessages();
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text variant="label" tone="muted">
          {t('assistant.subtitle')}
        </Text>
        <Text variant="title">{t('assistant.title')}</Text>
      </View>
      <View style={styles.headerActions}>
        {messages.length > 0 ? (
          <IconButton
            icon="edit"
            accessibilityLabel={t('assistant.newChat')}
            onPress={newChat}
          />
        ) : null}
        <Badge label="Llama" tone="accent" icon="cpu" />
      </View>
    </View>
  );

  if (scans.length === 0) {
    return (
      <Screen>
        {header}
        <EmptyState
          icon="message-circle"
          title={t('assistant.noScan')}
          body={t('assistant.noScanBody')}
          actionLabel={t('assistant.scanFirst')}
          onAction={() => router.navigate('/scan')}
        />
      </Screen>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.padded}>{header}</View>

      <View style={styles.context}>
        <View style={styles.contextHeader}>
          <Text variant="label" tone="muted">
            {t('assistant.context')}
          </Text>
          <Text variant="caption" tone="muted">
            {t('assistant.chooseScan')}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contextList}>
          {scans.map((scan) => {
            const selected = scan.id === activeScan?.id;
            return (
              <Pressable
                key={scan.id}
                accessibilityRole="button"
                onPress={() => selectScan(scan.id)}
                style={[
                  styles.contextItem,
                  {
                    backgroundColor: selected ? colors.accentSoft : colors.surface,
                    borderColor: selected ? colors.accentBorder : colors.border,
                  },
                ]}>
                <ScanArtwork
                  category={scan.component.category}
                  imageUri={scan.imageUri}
                  height={34}
                  showLabel={false}
                  style={styles.contextArtwork}
                />
                <View style={styles.contextText}>
                  <Text variant="caption" numberOfLines={1} style={styles.contextName}>
                    {scan.component.name}
                  </Text>
                  <Text variant="caption" tone={selected ? 'accent' : 'muted'} style={styles.contextSeverity}>
                    {t(`severity.${scan.damage.severity}`)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.chat}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          <View style={styles.greetingRow}>
            <View style={[styles.assistantAvatar, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
              <Feather name="cpu" size={13} color={colors.accent} />
            </View>
            <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text variant="caption" tone="secondary" style={styles.bubbleText}>
                {activeScan
                  ? t('assistant.greeting', { name: activeScan.component.name })
                  : t('assistant.greetingNoScan')}
              </Text>
            </View>
          </View>

          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <View key={message.id} style={[styles.messageRow, isUser && styles.userRow]}>
                {!isUser ? (
                  <View style={[styles.assistantAvatar, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
                    <Feather name="cpu" size={13} color={colors.accent} />
                  </View>
                ) : null}
                <View
                  style={[
                    styles.bubble,
                    isUser
                      ? [styles.userBubble, { backgroundColor: colors.accent }]
                      : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
                  ]}>
                  <Text
                    variant="caption"
                    selectable
                    style={[
                      styles.bubbleText,
                      isUser ? { color: colors.accentText } : { color: colors.textSecondary },
                    ]}>
                    {message.text || ' '}
                  </Text>
                </View>
              </View>
            );
          })}

          {typing ? (
            <View style={styles.messageRow}>
              <View style={[styles.assistantAvatar, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
                <Feather name="cpu" size={13} color={colors.accent} />
              </View>
              <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text variant="caption" tone="muted">
                  {t('assistant.typing')}
                </Text>
              </View>
            </View>
          ) : null}

          {messages.length === 0 ? (
            <View style={styles.suggestions}>
              {[
                t('assistant.suggestWorth'),
                t('assistant.suggestTools'),
                t('assistant.suggestSafety'),
                t('assistant.suggestCost'),
              ].map((suggestion) => (
                <Chip key={suggestion} label={suggestion} onPress={() => send(suggestion)} />
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.composer,
            { backgroundColor: colors.tabBar, borderTopColor: colors.border },
          ]}>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.input, borderColor: colors.border },
            ]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t('assistant.inputPlaceholder')}
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              style={[styles.input, { color: colors.text }]}
              multiline
              maxLength={500}
              onSubmitEditing={() => send()}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('assistant.send')}
              onPress={() => send()}
              disabled={!input.trim() || typing}
              style={({ pressed }) => [
                styles.send,
                {
                  backgroundColor: input.trim() && !typing ? colors.accent : colors.surfaceElevated,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Feather
                name="arrow-up"
                size={18}
                color={input.trim() && !typing ? colors.accentText : colors.textMuted}
              />
            </Pressable>
          </View>
          <Text variant="caption" tone="muted" style={styles.disclaimer}>
            {t('assistant.disclaimer')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 10,
    gap: 12,
  },
  headerText: {
    gap: 3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  context: {
    paddingTop: 18,
    paddingBottom: 14,
    gap: 8,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  contextList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingRight: 12,
    overflow: 'hidden',
  },
  contextArtwork: {
    width: 34,
  },
  contextText: {
    maxWidth: 138,
    gap: 1,
  },
  contextName: {
    fontFamily: fontFamily.medium,
  },
  contextSeverity: {
    fontSize: 10,
  },
  chat: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  assistantBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    borderBottomRightRadius: 5,
  },
  bubbleText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    paddingLeft: 36,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 7,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 5,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 110,
    paddingTop: 8,
    paddingBottom: 8,
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 10,
  },
});
