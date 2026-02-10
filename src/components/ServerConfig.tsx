import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { storage } from '../utils/storage';
import { theme } from '../theme';

export const ServerConfig: React.FC = () => {
    const { t } = useTranslation();
    const [serverUrl, setServerUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSaveServer = async () => {
        if (!serverUrl.trim()) {
            Alert.alert(t('error'), t('pleaseEnterServerUrl'));
            return;
        }

        // Validate URL format
        try {
            new URL(serverUrl);
        } catch {
            Alert.alert(t('error'), t('invalidUrlFormat'));
            return;
        }

        setLoading(true);
        try {
            await storage.setItem('CUSTOM_SERVER_URL', serverUrl);
            Alert.alert(t('success'), t('serverUrlSaved'));
        } catch (error) {
            Alert.alert(t('error'), t('failedToSaveServer'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card variant="elevated" padding={6} style={styles.container}>
            <Text style={styles.title}>{t('serverConfiguration')}</Text>
            <Text style={styles.description}>{t('serverConfigDescription')}</Text>
            
            <Input
                label={t('serverUrl')}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://your-server.com/api/v1"
                keyboardType="url"
                autoCapitalize="none"
                style={styles.input}
            />
            
            <Button
                title={t('saveServer')}
                onPress={handleSaveServer}
                loading={loading}
                fullWidth
                style={styles.button}
            />
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: theme.spacing[4],
    },
    title: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2],
    },
    description: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing[4],
    },
    input: {
        marginBottom: theme.spacing[4],
    },
    button: {
        marginTop: theme.spacing[2],
    },
});