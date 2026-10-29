/**
 * Indian States, Union Territories, Address Validation, and IST Date Formatting.
 */

export const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
] as const;

export const POPULAR_INDIAN_LOCATIONS = [
  { city: 'Bengaluru', zipCode: '560001', state: 'Karnataka' },
  { city: 'Mumbai', zipCode: '400001', state: 'Maharashtra' },
  { city: 'New Delhi', zipCode: '110001', state: 'Delhi (NCT)' },
  { city: 'Hyderabad', zipCode: '500001', state: 'Telangana' },
  { city: 'Chennai', zipCode: '600001', state: 'Tamil Nadu' },
  { city: 'Kolkata', zipCode: '700001', state: 'West Bengal' },
  { city: 'Pune', zipCode: '411001', state: 'Maharashtra' },
  { city: 'Ahmedabad', zipCode: '380001', state: 'Gujarat' },
  { city: 'Jaipur', zipCode: '302001', state: 'Rajasthan' },
  { city: 'Kochi', zipCode: '682001', state: 'Kerala' },
  { city: 'Lucknow', zipCode: '226001', state: 'Uttar Pradesh' },
  { city: 'Chandigarh', zipCode: '160017', state: 'Chandigarh' }
];

/**
 * Validates a standard 6-digit Indian Postal Index Number (PIN Code).
 * Cannot start with 0.
 */
export function validateIndianPIN(pin: string): boolean {
  if (!pin) return false;
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

/**
 * Validates standard Indian mobile phone numbers (10 digits starting with 6, 7, 8, or 9, optional +91 prefix).
 */
export function validateIndianPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+91)?[6-9]\d{9}$/.test(clean);
}

/**
 * Formats a timestamp into Asia/Kolkata (IST) time zone with readable date and 12-hour time.
 * E.g., "29 Oct 2026, 05:30 PM IST"
 */
export function formatDateTimeIST(dateInput: string | number | Date | undefined | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `${formatter.format(d)} IST`;
  } catch {
    return String(dateInput);
  }
}

