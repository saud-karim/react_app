// User Types
export interface User {
    id: number;
    name: string;
    employee_id: string;
    email: string;
    phone: string;
    ip_device: string;
    avatar: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

// Auth Types
export interface LoginRequest {
    employee_id: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    employee_id: string;
    password: string;
    phone: string;
    email: string;
    ip_device?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    phone?: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

// Category Type
export interface Category {
    id: number;
    name: string;
    name_ar?: string;
    name_en?: string;
}

// Event Types
export interface Event {
    id: number;
    title: string;
    description: string;
    category: Category | null;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    location: string;
    current_attendees: number;
    is_published: boolean;
    visibility: string;
    is_registered: boolean;
    images: MediaItem[];
    videos: MediaItem[];
    created_at: string;
}

export interface MediaItem {
    id: number;
    url: string;
    title?: string;
}

// Deal Types
export interface Deal {
    id: number;
    title: string;
    description: string;
    company_name: string;
    company_logo: string;
    deal_type: 'percentage' | 'fixed_amount' | 'free_item' | 'other';
    deal_value: number;
    original_price: number;
    category: Category;
    location: string;
    start_date: string;
    end_date: string;
    is_expired: boolean;
    images: MediaItem[];
    terms_conditions?: string;
    how_to_redeem?: string;
    contact_info?: {
        phone: string;
        email: string;
    };
}

// News Types
export interface News {
    id: number;
    title: string;
    description: string;
    category: Category;
    publish_date: string;
    views_count: number;
    images: MediaItem[];
    videos: MediaItem[];
    documents: DocumentItem[];
    created_at: string;
}

export interface DocumentItem {
    id: number;
    url: string;
    title: string;
    size: string;
}

// Notification Types
export interface Notification {
    id: number;
    type: string;
    title: string;
    body: string;
    reference_type: string;
    reference_id: number;
    is_read: boolean;
    read_at: string;
    created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: {
        [key: string]: T[];
    } & {
        pagination: Pagination;
    };
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

// Search Types
export interface SearchResult {
    query: string;
    events: Event[];
    deals: Deal[];
    news: News[];
    total_events: number;
    total_deals: number;
    total_news: number;
}
