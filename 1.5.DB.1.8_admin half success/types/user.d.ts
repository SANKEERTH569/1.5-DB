export type User = {
  id: string;
  shop_name: string;
  owner_name: string;
  phone_number: string;
  email_address?: string;
  business_type?: string;
  alternate_phone_number?: string;
  google_maps_location?: string;
  address?: string;
  status: 'active' | 'inactive';
  created_at?: Date;
}; 