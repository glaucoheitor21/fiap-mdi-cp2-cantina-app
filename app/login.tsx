import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../constants/theme';

const USERS_STORAGE_KEY = '@cantina:users';

type AuthUser = {
  email: string;
  password: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getStoredUsers = async (): Promise<AuthUser[]> => {
  const usersRaw = await AsyncStorage.getItem(USERS_STORAGE_KEY);

  if (!usersRaw) {
    return [];
  }

  try {
    const parsedUsers = JSON.parse(usersRaw) as AuthUser[];
    return Array.isArray(parsedUsers) ? parsedUsers : [];
  } catch {
    return [];
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    setError('');
    setLoading(true);

    const users = await getStoredUsers();
    const normalizedEmail = normalizeEmail(email);
    const isValidUser = users.some((user) => normalizeEmail(user.email) === normalizedEmail && user.password === password);
    if (isValidUser) {
      setLoading(false);
      router.replace('/(tabs)/cardapio');
      return;
    }

    setLoading(false);
    setError('E-mail ou senha inválidos. Faça seu cadastro primeiro.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header decorativo */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>FIAP</Text>
        </View>
        <Text style={styles.appTitle}>Cantina</Text>
        <Text style={styles.subtitle}>Peça sem sair do lugar</Text>
      </View>

      {/* Card de login */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entrar</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-mail institucional</Text>
          <TextInput
            style={styles.input}
            placeholder="rm00000@fiap.com.br"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/register')}>
          <Text style={styles.registerText}>Ainda não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>© FIAP — Todos os direitos reservados</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoBox: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  errorText: {
    color: theme.colors.primary,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  registerButton: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  registerText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: theme.spacing.xl,
  },
});
