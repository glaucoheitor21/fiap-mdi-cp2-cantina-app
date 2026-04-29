import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
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
  userEmail: string; // Adicionado para associar ao usuário
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

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  aguardando: {
    label: 'Aguardando',
    color: theme.colors.warning,
    bg: theme.colors.warningLight,
    icon: 'time-outline',
  },
  preparando: {
    label: 'Preparando',
    color: '#1565C0',
    bg: '#E3F2FD',
    icon: 'flame-outline',
  },
  pronto: {
    label: 'Pronto! 🎉',
    color: theme.colors.success,
    bg: theme.colors.successLight,
    icon: 'checkmark-circle-outline',
  },
};

export default function PedidosScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadOrders = async () => {
        const storedOrders = await getStoredOrders();
        setOrders(storedOrders);
      };
      loadOrders();
    }, [])
  );

  const removeOrder = async (orderId: string) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    await saveOrders(updatedOrders);
  };

  const prontos = orders.filter((o) => o.status === 'pronto');
  const emAndamento = orders.filter((o) => o.status !== 'pronto');

  const renderOrder = (order: Order) => {
    const status = STATUS_CONFIG[order.status];
    return (
      <View key={order.id} style={styles.card}>
        {/* Cabeçalho do card */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>Pedido {order.id}</Text>
            <Text style={styles.orderTime}>
              <Ionicons name="time-outline" size={11} color={theme.colors.textMuted} /> {order.time}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={13} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Linha divisória */}
        <View style={styles.divider} />

        {/* Itens */}
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={styles.itemQty}>{item.qty}x</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>R$ {(item.qty * item.price).toFixed(2)}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>R$ {order.total.toFixed(2)}</Text>
        </View>

        {/* Ação para pedido pronto */}
        {order.status === 'pronto' && (
          <TouchableOpacity style={styles.collectButton} activeOpacity={0.85} onPress={() => removeOrder(order.id)}>
            <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
            <Text style={styles.collectButtonText}>Confirmar Retirada</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Prontos primeiro */}
      {prontos.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.sectionTitle}>Pronto para retirar</Text>
          </View>
          {prontos.map(renderOrder)}
        </>
      )}

      {/* Em andamento */}
      {emAndamento.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: '#1565C0' }]} />
            <Text style={styles.sectionTitle}>Em andamento</Text>
          </View>
          {emAndamento.map(renderOrder)}
        </>
      )}

      {orders.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>Nenhum pedido aberto</Text>
          <Text style={styles.emptySubtitle}>Seus pedidos ativos aparecerão aqui.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: theme.spacing.sm,
    marginBottom: 2,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  orderTime: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemEmoji: {
    fontSize: 16,
    width: 24,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    width: 22,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  collectButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.sm,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  collectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: theme.spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
