import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';
import { Icon } from '../components/icons/Icon';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export const ChatbotScreen: React.FC = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: t('chatbotWelcome'),
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSend = async () => {
        if (inputText.trim() === '') return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(userMessage.text),
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const getBotResponse = (userText: string): string => {
        const lowerText = userText.toLowerCase();

        if (lowerText.includes('فعالية') || lowerText.includes('event')) {
            return t('chatbotEventsResponse');
        } else if (lowerText.includes('عرض') || lowerText.includes('deal')) {
            return t('chatbotDealsResponse');
        } else if (lowerText.includes('خبر') || lowerText.includes('news')) {
            return t('chatbotNewsResponse');
        } else if (lowerText.includes('مساعدة') || lowerText.includes('help')) {
            return t('chatbotHelpResponse');
        } else {
            return t('chatbotDefaultResponse');
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageContainer,
                item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
            ]}
        >
            {!item.isUser && (
                <View style={styles.botAvatar}>
                    <LinearGradient
                        colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                        style={styles.botAvatarGradient}
                    >
                        <Icon name="messageCircle" size={20} color="#FFFFFF" />
                    </LinearGradient>
                </View>
            )}
            <View
                style={[
                    styles.messageBubble,
                    item.isUser ? styles.userBubble : styles.botBubble,
                ]}
            >
                <Text
                    style={[
                        styles.messageText,
                        item.isUser ? styles.userText : styles.botText,
                    ]}
                >
                    {item.text}
                </Text>
                <Text
                    style={[
                        styles.timestamp,
                        item.isUser ? styles.userTimestamp : styles.botTimestamp,
                    ]}
                >
                    {item.timestamp.toLocaleTimeString('ar', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
        </View>
    );

    const renderTypingIndicator = () => (
        <View style={[styles.messageContainer, styles.botMessageContainer]}>
            <View style={styles.botAvatar}>
                <LinearGradient
                    colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                    style={styles.botAvatarGradient}
                >
                    <Icon name="messageCircle" size={20} color="#FFFFFF" />
                </LinearGradient>
            </View>
            <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, styles.typingDotDelay1]} />
                    <View style={[styles.typingDot, styles.typingDotDelay2]} />
                </View>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Header */}
            <LinearGradient
                colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerAvatar}>
                        <Icon name="messageCircle" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>{t('chatbot')}</Text>
                        <Text style={styles.headerSubtitle}>{t('chatbotOnline')}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={isTyping ? renderTypingIndicator : null}
            />

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder={t('chatbotPlaceholder')}
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            inputText.trim() === '' && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={inputText.trim() === ''}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={
                                inputText.trim() === ''
                                    ? [theme.colors.text.tertiary, theme.colors.text.tertiary]
                                    : [theme.colors.primary[500], theme.colors.primary[700]]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sendButtonGradient}
                        >
                            <Icon name="send" size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: theme.spacing[4],
        paddingBottom: theme.spacing[4],
        paddingHorizontal: theme.spacing[6],
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[3],
    },
    headerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: theme.typography.sizes.xl,
        fontFamily: theme.typography.fonts.bold,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.regular,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    messagesList: {
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[4],
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing[3],
        alignItems: 'flex-end',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    botMessageContainer: {
        justifyContent: 'flex-start',
    },
    botAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: theme.spacing[2],
        overflow: 'hidden',
    },
    botAvatarGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userBubble: {
        backgroundColor: theme.colors.primary[500],
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.regular,
        lineHeight: 22,
        marginBottom: theme.spacing[1],
    },
    userText: {
        color: '#FFFFFF',
    },
    botText: {
        color: theme.colors.text.primary,
    },
    timestamp: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.regular,
    },
    userTimestamp: {
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'right',
    },
    botTimestamp: {
        color: theme.colors.text.tertiary,
    },
    typingBubble: {
        paddingVertical: theme.spacing[2],
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[1],
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.text.tertiary,
    },
    typingDotDelay1: {
        opacity: 0.7,
    },
    typingDotDelay2: {
        opacity: 0.4,
    },
    inputContainer: {
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: theme.colors.background.tertiary,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing[2],
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.background.tertiary,
        borderRadius: 20,
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.primary,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
