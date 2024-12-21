export interface Transfer {
    id: number;
    from_location: {
      id: number;
      name: string;
    };
    to_location: {
      id: number;
      name: string;
    };
    transfer_date: string;
    status: string;
  }
  