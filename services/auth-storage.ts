import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_STORAGE_KEY = '@cantina:users';

export type AuthUser = {
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

export const registerUser = async (email: string, password: string): Promise<void> => {
  const users = await getStoredUsers();
  const normalizedEmail = normalizeEmail(email);

  const userAlreadyExists = users.some((user) => normalizeEmail(user.email) === normalizedEmail);
  if (userAlreadyExists) {
    throw new Error('Já existe um cadastro para este e-mail.');
  }

  const updatedUsers = [...users, { email: normalizedEmail, password }];
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
};

export const validateLogin = async (email: string, password: string): Promise<boolean> => {
  const users = await getStoredUsers();
  const normalizedEmail = normalizeEmail(email);

  return users.some(
    (user) => normalizeEmail(user.email) === normalizedEmail && user.password === password
  );
};
