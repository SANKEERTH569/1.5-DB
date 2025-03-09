import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { ArrowLeft, Check } from 'lucide-react-native';

export default function DeliveryDetailsScreen() {
  const router = useRouter();
  const { delivery: deliveryString } = useLocalSearchParams();
  
  const [delivery, setDelivery] = useState(null);
  const [amountCollected, setAmountCollected] = useState('');
  const [changeToReturn, setChangeToReturn] = useState(0);

  useEffect(() => {
    if (deliveryString) {
      try {
        const parsedDelivery = JSON.parse(deliveryString as string);
        console.log('Parsed delivery:', parsedDelivery); // Debugging
        setDelivery(parsedDelivery);
      } catch (error) {
        console.error('Error parsing delivery string:', error);
        Alert.alert('Error', 'Failed to load delivery details.');
      }
    }
  }, [deliveryString]);

  useEffect(() => {
    if (delivery) {
      const collected = parseFloat(amountCollected);
      if (!isNaN(collected)) {
        setChangeToReturn(collected - delivery.total);
      } else {
        setChangeToReturn(0);
      }
    }
  }, [amountCollected, delivery]);

  const handleBack = () => {
    router.back();
  };

  // Function to generate a random OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCompleteDelivery = () => {
    const otp = generateOTP();

    Alert.alert(
      'Complete Delivery',
      `An OTP has been sent to the customer. Please confirm the OTP to complete the delivery.\n\nOTP: ${otp}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm OTP', 
          onPress: () => {
            // Simulate customer confirming OTP
            Alert.prompt(
              'Enter OTP',
              'Please enter the OTP received by the customer:',
              (userInput) => {
                if (userInput === otp) {
                  // Update delivery status to "Delivered"
                  // In a real app, you would update this in your data store
                  Alert.alert('Delivery Completed', 'The delivery has been marked as completed.');
                  router.replace('/(delivery)/index'); // Go back to the delivery list
                } else {
                  Alert.alert('Incorrect OTP', 'The OTP entered is incorrect. Please try again.');
                }
              },
              'plain-text',
              '',
            );
          }
        },
      ]
    );
  };

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Text>Loading delivery details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.hotelName}>{delivery.hotelName}</Text>
        <Text style={styles.hotelId}>{delivery.hotelId}</Text>

        <View style={styles.orderSummary}>
          <Text style={styles.summaryLabel}>Order Summary:</Text>
          <Text style={styles.summaryText}>
            {delivery.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}
          </Text>
          <Text style={styles.totalAmount}>Total: ₹{delivery.total}</Text>
        </View>

        <View style={styles.amountCollection}>
          <Text style={styles.amountLabel}>Amount Collected:</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            placeholder="Enter amount collected"
            value={amountCollected}
            onChangeText={setAmountCollected}
          />
          <Text style={styles.changeText}>Change to Return: ₹{changeToReturn.toFixed(2)}</Text>
        </View>

        <Button
          title="Complete Delivery"
          onPress={handleCompleteDelivery}
          variant="primary"
          size="large"
          style={styles.completeButton}
          icon={<Check size={20} color="white" style={{ marginRight: 8 }} />}
        />
      </ScrollView>
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
  content: {
    padding: 16,
  },
  hotelName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  hotelId: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  orderSummary: {
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
  amountCollection: {
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
  amountLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.text,
  },
  changeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.primary,
  },
  completeButton: {
    marginTop: 16,
  },
});