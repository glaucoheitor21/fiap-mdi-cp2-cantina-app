import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../constants/theme';

const ORDERS_STORAGE_KEY = '@cantina:orders';

type OrderStatus = 'aguardando' | 'preparando' | 'pronto';

type Order = {
  id: string;
  items: { name: string; qty: number; price: number; emoji: string }[];
  status: OrderStatus;
  time: string;
  total: number;
  userEmail: string;
};

const getStoredOrders = async (): Promise<Order[]> => {
  const ordersRaw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  if (!ordersRaw) {
    return [];
  }
  try {
    const parsedOrders = JSON.parse(ordersRaw) as Order[];
    return Array.isArray(parsedOrders) ? parsedOrders : [];
  } catch {
    return [];
  }
};

const saveOrders = async (orders: Order[]) => {
  await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

const CATEGORIES = ['Todos', 'Lanches', 'Refeições', 'Bebidas', 'Sobremesas'];

const MENU_ITEMS = [
  { id: '1', name: 'X-Burguer', category: 'Lanches', price: 18.9, description: 'Pão, hambúrguer 160g, queijo, alface e tomate', emoji: '🍔' },
  { id: '2', name: 'X-Frango', category: 'Lanches', price: 17.5, description: 'Pão, frango grelhado, queijo e maionese', emoji: '🥪' },
  { id: '3', name: 'Prato Executivo', category: 'Refeições', price: 28.0, description: 'Arroz, feijão, carne, salada e suco', emoji: '🍽️' },
  { id: '4', name: 'Marmita Fit', category: 'Refeições', price: 24.9, description: 'Frango, arroz integral, legumes no vapor', emoji: '🥗' },
  { id: '5', name: 'Suco Natural', category: 'Bebidas', price: 8.0, description: 'Laranja, limão ou maracujá — 300ml', emoji: '🍊' },
  { id: '6', name: 'Refrigerante', category: 'Bebidas', price: 5.5, description: 'Lata 350ml — Coca, Guaraná ou Sprite', emoji: '🥤' },
  { id: '7', name: 'Água Mineral', category: 'Bebidas', price: 3.0, description: 'Garrafa 500ml com ou sem gás', emoji: '💧' },
  { id: '8', name: 'Brownie', category: 'Sobremesas', price: 9.9, description: 'Brownie de chocolate com nozes', emoji: '🍫' },
  { id: '9', name: 'Açaí 300ml', category: 'Sobremesas', price: 14.9, description: 'Açaí com granola, banana e mel', emoji: '🫐' },
];

type CartItem = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  qty: number;
};

export default function CardapioScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const makeOrder = async () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return;

    const items = cartItems.map(item => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      emoji: item.emoji,
    }));
    const total = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const orderId = `#${Date.now().toString().slice(-4)}`;

    const newOrder: Order = {
      id: orderId,
      items,
      status: 'aguardando',
      time,
      total,
      userEmail: 'user@fiap.com.br', // TODO: obter email do usuário logado
    };

    const existingOrders = await getStoredOrders();
    const updatedOrders = [newOrder, ...existingOrders];
    await saveOrders(updatedOrders);

    setCart({}); // Limpar carrinho
    router.push('/(tabs)/pedidos');
  };

  const filtered =
    selectedCategory === 'Todos'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((i) => i.category === selectedCategory);

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: {
        id: item.id,
        name: item.name,
        price: item.price,
        emoji: item.emoji,
        qty: (prev[item.id]?.qty ?? 0) + 1,
      },
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const current = prev[id];
      if (!current || current.qty <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...current, qty: current.qty - 1 } };
    });
  };

  const totalItems = Object.values(cart).reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = Object.values(cart).reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <View style={styles.container}>
      {/* Categorias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de itens */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const qty = cart[item.id]?.qty ?? 0;
          return (
            <View style={styles.card}>
              <View style={styles.cardEmoji}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.qtyControl}>
                {qty > 0 ? (
                  <>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                      <Ionicons name="remove" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                  </>
                ) : null}
                <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Botão de pedido flutuante */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={makeOrder}
          activeOpacity={0.9}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
          <Text style={styles.cartButtonText}>Fazer Pedido</Text>
          <Text style={styles.cartButtonPrice}>R$ {totalPrice.toFixed(2)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  categoriesScroll: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    maxHeight: 52,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
    gap: 10,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  cardEmoji: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  itemDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 4,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    minWidth: 18,
    textAlign: 'center',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 16,
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  cartBadge: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cartButtonPrice: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    opacity: 0.9,
  },
});
