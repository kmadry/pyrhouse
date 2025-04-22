// Podstawowe typy dla elementów transferu
export type TransferStatus = 'in_transit' | 'confirmed' | 'cancelled';
export type ItemType = 'pyr_code' | 'stock';
export type ValidationStatus = 'success' | 'failure' | '';

// Wspólne interfejsy dla lokalizacji
export interface Location {
  id: number;
  name: string;
}

// Interfejs dla pojedynczego przedmiotu w transferze
export interface TransferItem {
  id: number;
  transfer_id: number;
  item_id: number;
  quantity: number;
  status: TransferStatus;
  type: ItemType;
  pyrcode?: string;
  category?: {
    id?: number;
    label: string;
  };
}

// Bazowy interfejs dla transferu
export interface BaseTransfer {
  id: number;
  status: TransferStatus;
  items: TransferItem[];
}

// Interfejs dla transferu z zagnieżdżonymi obiektami (używany w UI)
export interface Transfer extends BaseTransfer {
  from_location: Location;
  to_location: Location;
  transfer_date: string;
}

// Interfejs dla transferu z płaską strukturą (używany w API)
export interface FlatTransfer extends BaseTransfer {
  from_location_id: number;
  from_location_name: string;
  to_location_id: number;
  to_location_name: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  description: string;
}

// Interfejs dla formularza tworzenia transferu
export interface TransferFormData {
  fromLocation: number;
  toLocation: string;
  items: {
    type: ItemType;
    id: string;
    pyrcode: string;
    quantity: number;
    status: ValidationStatus;
    category?: {
      label: string;
    };
  }[];
  users: {
    id: number;
    username: string;
    fullname: string;
  }[];
}

// Interfejs dla sugestii kodów PYR
export interface PyrCodeSuggestion {
  id: number;
  pyrcode: string;
  serial: string;
  location: Location;
  category: {
    id: number;
    label: string;
  };
  status: 'in_stock' | 'available' | 'unavailable';
} 