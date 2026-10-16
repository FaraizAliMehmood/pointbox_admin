/**
 * Centralized API Service for Admin
 * Handles all API calls to the backend
 */

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;
console.log(API_BASE_URL);

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: any;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      this.token = storedToken;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('admin_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        (error as any).response = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ==================== Authentication ====================
  // Route: POST /api/admin/login (Public route - no authentication required)

  async login(email: string, password: string): Promise<ApiResponse<any>> {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  logout() {
    this.setToken(null);
  }

  // ==================== Change Password ====================
  // Route: PUT /api/admin/change-password/:id

  async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request(`/change-password/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  /**
   * Send OTP for password change
   */
  async sendOTPForPasswordChange(email: string): Promise<ApiResponse<any>> {
    return this.request('/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Verify OTP for password change
   */
  async verifyOTPForPasswordChange(email: string, otp: string): Promise<ApiResponse<any>> {
    return this.request('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  /**
   * Change password with OTP
   */
  async changePasswordWithOTP(email: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request('/change-password', {
      method: 'PUT',
      body: JSON.stringify({ email, newPassword }),
    });
  }

  // ==================== Company Routes ====================
  // Routes: GET /api/admin/companies, POST /api/admin/companies, PUT /api/admin/companies/:id, DELETE /api/admin/companies/:id

  async getCompanies(): Promise<ApiResponse<any[]>> {
    return this.request('/companies');
  }

  async createCompany(formData: FormData): Promise<ApiResponse<any>> {
    return this.request('/companies', {
      method: 'POST',
      body: formData,
    });
  }

  async updateCompany(id: string, formData: FormData): Promise<ApiResponse<any>> {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteCompany(id: string): Promise<ApiResponse<void>> {
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleCompanyStatus(id: string, isActive: boolean): Promise<ApiResponse<any>> {
    return this.request(`/companies/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  // ==================== Employee Routes ====================
  // Routes: GET /api/admin/employees, PUT /api/admin/employees/:id/status, PUT /api/admin/employees/:id

  async getEmployees(): Promise<ApiResponse<any[]>> {
    return this.request('/employees');
  }

  async toggleEmployeeStatus(id: string, isActive: boolean): Promise<ApiResponse<any>> {
    return this.request(`/employees/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async updateEmployee(id: string, data: Partial<{
    name: string;
    email: string;
    permissions: Record<string, boolean>;
  }>): Promise<ApiResponse<any>> {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== Customer Routes ====================
  // Routes: GET /api/admin/customers, POST /api/admin/customers, PUT /api/admin/customers/:id, DELETE /api/admin/customers/:id

  async getCustomers(): Promise<ApiResponse<any[]>> {
    return this.request('/customers');
  }

  async createCustomer(data: {
    username: string;
    email: string;
    password?: string;
    phone?: string;
    address?: string;
    country?: string;
    isGoogleSignup?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: Partial<{
    username: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    country: string;
    isGoogleSignup: boolean;
  }>): Promise<ApiResponse<any>> {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Query Routes ====================
  // Routes: GET /api/admin/queries, POST /api/admin/queries/:id/respond

  async getQueries(): Promise<ApiResponse<any[]>> {
    return this.request('/queries');
  }

  async respondToQuery(id: string, response: string): Promise<ApiResponse<any>> {
    return this.request(`/queries/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  // ==================== Transaction Routes ====================
  // Routes: GET /api/admin/transactions, GET /api/admin/transactions/:id

  async getTransactions(transactionId?: string): Promise<ApiResponse<any[]>> {
    const query = transactionId ? `?transactionId=${encodeURIComponent(transactionId)}` : '';
    return this.request(`/transactions${query}`);
  }

  async getTransactionById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/transactions/${id}`);
  }

  // ==================== Notification Routes ====================
  // Routes: GET /api/admin/notifications, POST /api/admin/notifications, DELETE /api/admin/notifications/:id

  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request('/notifications');
  }

  async createNotification(data: {
    titleText: string;
    bodyText: string;
    deviceTokens: string[];
    imageUrl?: string;
    clickAction?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Banner Routes ====================
  // Routes: GET /api/admin/banners, POST /api/admin/banners, PUT /api/admin/banners/:id, DELETE /api/admin/banners/:id

  async getBanners(): Promise<ApiResponse<any[]>> {
    return this.request('/banners');
  }

  async uploadBanner(formData: FormData): Promise<ApiResponse<any>> {
    return this.request('/banners', {
      method: 'POST',
      body: formData,
    });
  }

  async updateBanner(id: string, formData: FormData): Promise<ApiResponse<any>> {
    return this.request(`/banners/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteBanner(id: string): Promise<ApiResponse<void>> {
    return this.request(`/banners/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== FAQ Routes ====================
  // Routes: GET /api/admin/faqs, POST /api/admin/faqs, PUT /api/admin/faqs/:id, DELETE /api/admin/faqs/:id

  async getFAQs(): Promise<ApiResponse<any[]>> {
    return this.request('/faqs');
  }

  async createFAQ(data: {
    question: string;
    answer: string;
    category?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request('/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFAQ(id: string, data: Partial<{
    question: string;
    answer: string;
    category: string;
    isActive: boolean;
  }>): Promise<ApiResponse<any>> {
    return this.request(`/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFAQ(id: string): Promise<ApiResponse<void>> {
    return this.request(`/faqs/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Contact Routes ====================
  // Routes: GET /api/admin/contacts, POST /api/admin/contacts/:id/respond

  async getContacts(): Promise<ApiResponse<any[]>> {
    return this.request('/contacts');
  }

  async respondToContact(id: string, response: string): Promise<ApiResponse<any>> {
    return this.request(`/contacts/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  // ==================== Newsletter Routes ====================
  // Routes: GET /api/admin/newsletters, POST /api/admin/newsletters, PUT /api/admin/newsletters/:id, DELETE /api/admin/newsletters/:id

  async getNewsletters(): Promise<ApiResponse<any[]>> {
    return this.request('/newsletters');
  }

  async createNewsletter(formData: FormData): Promise<ApiResponse<any>> {
    return this.request('/newsletters', {
      method: 'POST',
      body: formData,
    });
  }

  async updateNewsletter(id: string, formData: FormData): Promise<ApiResponse<any>> {
    return this.request(`/newsletters/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteNewsletter(id: string): Promise<ApiResponse<void>> {
    return this.request(`/newsletters/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Newsletter Email Routes ====================
  // Routes: GET /api/admin/newsletter-emails, POST /api/admin/newsletter-emails, PUT /api/admin/newsletter-emails/:id, DELETE /api/admin/newsletter-emails/:id

  async getNewsletterEmails(search?: string, source?: string, isActive?: boolean): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (source) params.append('source', source);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/newsletter-emails${query}`);
  }

  async getNewsletterEmailById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/newsletter-emails/${id}`);
  }

  async createNewsletterEmail(data: {
    email: string;
    source?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/newsletter-emails', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNewsletterEmail(id: string, data: {
    isActive?: boolean;
    source?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/newsletter-emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNewsletterEmail(id: string): Promise<ApiResponse<void>> {
    return this.request(`/newsletter-emails/${id}`, {
      method: 'DELETE',
    });
  }
}

// Initialize and export the API service instance
const apiService = new ApiService(API_BASE_URL);

export default apiService;
