export interface DefaultOrderItem {
  id: string; // This is the item_id from AVAILABLE_ITEMS
  name: string;
  price: number;
  unit: string;
  quantity: number;
  registration_item_id?: string; // Optional ID from registration_items table
}