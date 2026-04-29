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

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const users = await getStoredUsers();
      const normalizedEmail = normalizeEmail(email);
      const userAlreadyExists = users.some((user) => normalizeEmail(user.email) === normalizedEmail);
      if (userAlreadyExists) {
        throw new Error('Já existe um cadastro para este e-mail.');
      }
      const updatedUsers = [...users, { email: normalizedEmail, password }];
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      setLoading(false);
      router.replace('/login');
    } catch (registrationError) {
      const message =
        registrationError instanceof Error
          ? registrationError.message
          : 'Não foi possível concluir o cadastro.';
      setLoading(false);
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>FIAP</Text>
        </View>
        <Text style={styles.appTitle}>Criar conta</Text>
        <Text style={styles.subtitle}>Use seu e-mail para se registrar</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cadastro</Text>

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

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Voltar para login</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
});
