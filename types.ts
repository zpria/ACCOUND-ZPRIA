
export interface LogoVariant {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}

export interface UserProfile {
  id: string;
  username: string;
  login_id: string; // username@prigod.com
  firstName: string;
  lastName: string;
  email: string; // recovery email
  mobile?: string;
  address: string;
  dob: string;
  gender: string;
  isEmailVerified: boolean;
  themePreference: string;
  accountStatus: 'active' | 'suspended' | 'banned';
  theme_color?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  theme: LogoVariant;
}

export interface ProductType {
  type_id: number;
  type_name: string;
  type_description: string;
  type_icon: string;
  type_question: string;
  display_order: number;
  is_active: boolean;
}

export interface ZipraProduct {
  id: number;
  product_id: string;
  product_name: string;
  product_url: string;
  description: string;
  long_description: string;
  product_type: string;
  type_label: string;
  benefits: string[] | any;
  features: string[] | any;
  process_steps: string[] | any;
  setup_guide: string;
  tags: string;
  requirements: string;
  documentation_url: string;
  support_url: string;
  icon_url: string;
  banner_url: string;
  screenshot_urls: string[] | any;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  target_audience: string;
  pricing_type: string;
  price: number;
  currency: string;
  version: string;
  total_users: number;
  rating: number;
  review_count: number;
  meta_title: string;
  meta_description: string;
  keywords: string;
  launched_at: string;
}
