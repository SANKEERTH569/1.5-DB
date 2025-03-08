import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { Mic, Plus, Minus } from 'lucide-react-native';

// Mock data for grocery items
const GROCERY_ITEMS = [
  { id: 1, name: 'Rice', price: 50, unit: 'kg' },
  { id: 2, name: 'Wheat Flour', price: 40, unit: 'kg' },
  { id: 3, name: 'Sugar', price: 45, unit: 'kg' },
  { id: 4, name: 'Cooking Oil', price: 120, unit: 'liter' },
  { id: 5, name: 'Milk', price: 60, unit: 'liter' },
  { id: 6, name: 'Tomatoes', price: 30, unit: 'kg' },
  { id: 7, name: 'Onions', price: 25, unit: 'kg' },
  { id: 8, name: 'Potatoes', price: 20, unit: 'kg' },
  { id: 9, name: 'Lentils', price: 90, unit: 'kg' },
  { id: 10, name: 'Salt', price: 15, unit: 'kg' },
];

// Mock data for delivery dates
const DELIVERY_DATES = {
  '2025-01-05': { marked: true, dotColor: COLORS.success },
  '2025-01-10': { marked: true, dotColor: COLORS.success },
  '2025-01-15': { marked: true, dotColor: COLORS.error },
  '2025-01-20': { marked: true, dotColor: COLORS.success },
};

type Grams = 100 | 250 | 500 | 750;

export default function UserHomeScreen() {
  const [quantities, setQuantities] = useState<Record<number, number>>(
    GROCERY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );
  const [grams, setGrams] = useState<Record<number, Grams | null>>(
    GROCERY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: null }), {})
  );
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const hotelId = 'KIR001'; // Mock hotel ID

  const handleQuantityChange = (id: number, change: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, (prev[id] || 0) + change);
      return { ...prev, [id]: newQuantity };
    });
  };

  const handleGramsChange = (id: number, gram: Grams) => {
    setGrams((prev) => {
      if (prev[id] === gram) {
        return { ...prev, [id]: null };
      } else {
        return { ...prev, [id]: gram };
      }
    });
  };

  const calculateTotal = () => {
    return GROCERY_ITEMS.reduce((total, item) => {
      const itemQuantity = quantities[item.id] || 0;
      const itemGrams = grams[item.id] || 0;
      const price = itemQuantity * item.price + (itemGrams / 1000) * item.price;
      return total + price;
    }, 0);
  };

  const handleConfirmOrder = () => {
    // In a real app, this would send the order to Firebase
    console.log('Order confirmed:', {
      items: GROCERY_ITEMS.filter(
        (item) => quantities[item.id] > 0 || grams[item.id] !== null
      ).map((item) => ({
        ...item,
        quantity: quantities[item.id],
        grams: grams[item.id],
      })),
      note,
      total: calculateTotal(),
      date: new Date().toISOString(),
    });

    // Reset form
    setQuantities(
      GROCERY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
    );
    setGrams(
      GROCERY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: null }), {})
    );
    setNote('');

    // Show success message (in a real app, this would be a proper notification)
    alert('Order confirmed successfully!');
  };

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          }}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Kirana</Text>
        <View style={styles.hotelIdContainer}>
          <Text style={styles.hotelIdLabel}>Hotel ID</Text>
          <Text style={styles.hotelId}>{hotelId}</Text>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <Text style={styles.sectionTitle}>Delivery Calendar</Text>
        <TouchableOpacity onPress={toggleCalendar} style={styles.dateBox}>
          <Text style={styles.dateText}>
            {selectedDate ? formatDate(selectedDate) : formatDate(getTodayDate())}
          </Text>
        </TouchableOpacity>

        {showCalendar && (
          <Calendar
            markedDates={DELIVERY_DATES}
            onDayPress={handleDayPress}
            theme={{
              todayTextColor: COLORS.primary,
              arrowColor: COLORS.primary,
              dotColor: COLORS.primary,
              selectedDayBackgroundColor: COLORS.primary,
            }}
          />
        )}

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: COLORS.success }]}
            />
            <Text style={styles.legendText}>Successful Delivery</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
            <Text style={styles.legendText}>Missed Delivery</Text>
          </View>
        </View>
      </View>

      <View style={styles.groceryListContainer}>
        <Text style={styles.sectionTitle}>Today's Grocery List</Text>

        {GROCERY_ITEMS.map((item) => (
          <View key={item.id} style={styles.groceryItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                ₹{item.price}/{item.unit}
              </Text>
            </View>

            <View>
              <View style={styles.quantityControl}>
                <Text>Kg:</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, -1)}
                >
                  <Minus size={16} color={COLORS.darkGray} />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantities[item.id] || 0}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, 1)}
                >
                  <Plus size={16} color={COLORS.darkGray} />
                </TouchableOpacity>
              </View>

              <View style={styles.additionalQuantities}>
                {[100, 250, 500, 750].map((quantity) => (
                  <TouchableOpacity
                    key={quantity}
                    style={[
                      styles.additionalQuantityButton,
                      grams[item.id] === quantity && {
                        backgroundColor: COLORS.primary,
                      },
                    ]}
                    onPress={() =>
                      handleGramsChange(item.id, quantity as Grams)
                    }
                  >
                    <Text
                      style={[
                        styles.additionalQuantityText,
                        grams[item.id] === quantity && { color: COLORS.white },
                      ]}
                    >
                      {quantity}g
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
        </View>
      </View>

      <View style={styles.noteContainer}>
        <Text style={styles.noteLabel}>Additional Notes:</Text>
        <View style={styles.noteInputContainer}>
          <TextInput
            style={styles.noteInput}
            placeholder="Add any special requests here..."
            value={note}
            onChangeText={setNote}
            multiline
          />
          <TouchableOpacity style={styles.micButton}>
            <Mic size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Button
        title="Confirm Order"
        onPress={handleConfirmOrder}
        variant="primary"
        size="large"
        style={styles.confirmButton}
      />
    </ScrollView>
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
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
  hotelIdContainer: {
    alignItems: 'center',
  },
  hotelIdLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
  },
  hotelId: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.text,
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
  },
  dateBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
  },
  groceryListContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groceryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
  },
  itemPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  additionalQuantities: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 10, // Spacing below Kg
  },
  additionalQuantityButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
  },
  additionalQuantityText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  totalAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
  noteContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  noteInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  micButton: {
    padding: 8,
  },
  confirmButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
});