import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { ArrowLeft, Phone, MapPin, Check } from 'lucide-react-native';

// Mock data for deliveries
const DELIVERIES = [
  {
    id: '1',
    hotelId: 'KIR001',
    hotelName: 'Hotel Sunshine',
    ownerName: 'John Doe',
    phone: '+91 9876543210',
    address: '123 Main Street, City Center, Hyderabad, 500001',
    addressLink: 'https://maps.google.com/?q=17.385044,78.486671',
    items: [
      { name: 'Rice', quantity: 5, price: 50, unit: 'kg' },
      { name: 'Wheat Flour', quantity: 2, price: 40, unit: 'kg' },
      { name: 'Cooking Oil', quantity: 3, price: 120, unit: 'liter' },
    ],
    total: 610,
    completed: false,
  },
  {
    id: '2',
    hotelId: 'KIR002',
    hotelName: 'Grand Restaurant',
    ownerName: 'Jane Smith',
    phone: '+91 9876543211',
    address: '456 Park Avenue, Jubilee Hills, Hyderabad, 500033',
    addressLink: 'https://maps.google.com/?q=17.431915,78.409682',
    items: [
      { name: 'Milk', quantity: 10, price: 60, unit: 'liter' },
      { name: 'Tomatoes', quantity: 3, price: 30, unit: 'kg' },
      { name: 'Onions', quantity: 4, price: 25, unit: 'kg' },
    ],
    total: 790,
    completed: false,
  },
];

export default function DeliveryScreen() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState(DELIVERIES);

  const handleBack = () => {
    router.back();
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleOpenMap = (mapLink: string) => {
    Linking.openURL(mapLink);
  };

  const handleCompleteDelivery = (id: string) => {
    Alert.alert(
      'Complete Delivery',
      'Mark this delivery as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => {
            setDeliveries(prevDeliveries => 
              prevDeliveries.map(delivery => 
                delivery.id === id ? { ...delivery, completed: true } : delivery
              )
            );
          }
        },
      ]
    );
  };

  const renderDeliveryItem = ({ item }: { item: any }) => (
    <View style={[styles.deliveryCard, item.completed && styles.completedCard]}>
      <View style={styles.deliveryHeader}>
        <View>
          <Text style={styles.hotelId}>{item.hotelId}</Text>
          <Text style={styles.hotelName}>{item.hotelName}</Text>
        </View>
        {item.completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>Completed</Text>
            <Check size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
          </View>
        )}
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.ownerName}>{item.ownerName}</Text>
        
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => handleCall(item.phone.replace(/\s/g, ''))}
        >
          <Phone size={16} color={COLORS.primary} style={styles.contactIcon} />
          <Text style={styles.contactText}>{item.phone}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => handleOpenMap(item.addressLink)}
        >
          <MapPin size={16} color={COLORS.primary} style={styles.contactIcon} />
          <Text style={styles.contactText}>{item.address}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.orderSummary}>
        <Text style={styles.summaryLabel}>Order Summary:</Text>
        <Text style={styles.summaryText}>
          {item.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}
        </Text>
        <Text style={styles.totalAmount}>Total: ₹{item.total}</Text>
      </View>
      
      {!item.completed && (
        <Button
          title="Mark as Completed"
          onPress={() => handleCompleteDelivery(item.id)}
          variant="primary"
          size="large"
          style={styles.completeButton}
          icon={<Check size={20} color="white" style={{ marginRight: 8 }} />}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deliveries</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No deliveries available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.text,
  },
  listContainer: {
    padding: 16,
  },
  deliveryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hotelId: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  hotelName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20', // 20% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.success,
  },
  contactInfo: {
    marginBottom: 16,
  },
  ownerName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  contactText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  orderSummary: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  summaryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  totalAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.primary,
  },
  completeButton: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});