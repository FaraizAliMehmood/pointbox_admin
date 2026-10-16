import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  UserCheck, 
  Users, 
  Mail, 
  CreditCard, 
  Loader2, 
  RefreshCw,
  Image,
  Bell,
  HelpCircle,
  Newspaper,
  MessageSquare,
  MailCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalEmployees: 0,
    totalCustomers: 0,
    pendingQueries: 0,
    totalTransactions: 0,
    totalBanners: 0,
    totalNotifications: 0,
    totalFAQs: 0,
    totalNewsletters: 0,
    totalContacts: 0,
    totalNewsletterEmails: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const REFRESH_INTERVAL = 30000; // 30 seconds

  // Helper function to check if a permission is allowed
  const hasPermission = (permissionKey: string): boolean => {
    if (!user || !user.permissions) return false;
    
    // Handle both Record<string, boolean> and Permission[] formats
    if (Array.isArray(user.permissions)) {
      return user.permissions.some(p => p.id === permissionKey);
    }
    
    // Handle Record<string, boolean> format
    return user.permissions[permissionKey] === true;
  };

  useEffect(() => {
    if (user) {
      loadStats();
      
      // Set up auto-refresh interval
      intervalRef.current = setInterval(() => {
        refreshStats();
      }, REFRESH_INTERVAL);

      // Cleanup interval on unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [user]);

  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Build array of API calls based on permissions
      const apiCalls: Promise<any>[] = [];
      const callMap: { [key: string]: () => Promise<any> } = {
        companies: () => apiService.getCompanies(),
        employees: () => apiService.getEmployees(),
        customers: () => apiService.getCustomers(),
        queries: () => apiService.getQueries(),
        transactions: () => apiService.getTransactions(),
        banners: () => apiService.getBanners(),
        notifications: () => apiService.getNotifications(),
        faqs: () => apiService.getFAQs(),
        newsletters: () => apiService.getNewsletters(),
        contacts: () => apiService.getContacts(),
        newsletterEmails: () => apiService.getNewsletterEmails(),
      };

      const results: { [key: string]: any } = {};

      // Only fetch data for permissions the user has
      if (hasPermission('manageCompanies')) {
        apiCalls.push(
          callMap.companies().then(res => {
            if (res.success && res.data) {
              results.companies = res.data;
            } else {
              results.companies = [];
            }
          }).catch(err => {
            console.error('Error fetching companies:', err);
            results.companies = [];
          })
        );
      }
      if (hasPermission('manageEmployees')) {
        apiCalls.push(
          callMap.employees().then(res => {
            if (res.success && res.data) {
              results.employees = res.data;
            } else {
              results.employees = [];
            }
          }).catch(err => {
            console.error('Error fetching employees:', err);
            results.employees = [];
          })
        );
      }
      if (hasPermission('manageCustomers')) {
        apiCalls.push(
          callMap.customers().then(res => {
            if (res.success && res.data) {
              results.customers = res.data;
            } else {
              results.customers = [];
            }
          }).catch(err => {
            console.error('Error fetching customers:', err);
            results.customers = [];
          })
        );
      }
      if (hasPermission('manageQueries')) {
        apiCalls.push(
          callMap.queries().then(res => {
            if (res.success && res.data) {
              results.queries = res.data;
            } else {
              results.queries = [];
            }
          }).catch(err => {
            console.error('Error fetching queries:', err);
            results.queries = [];
          })
        );
      }
      if (hasPermission('manageTransactions')) {
        apiCalls.push(
          callMap.transactions().then(res => {
            if (res.success && res.data) {
              results.transactions = res.data;
            } else {
              results.transactions = [];
            }
          }).catch(err => {
            console.error('Error fetching transactions:', err);
            results.transactions = [];
          })
        );
      }
      if (hasPermission('manageBanners')) {
        apiCalls.push(
          callMap.banners().then(res => {
            if (res.success && res.data) {
              results.banners = res.data;
            } else {
              results.banners = [];
            }
          }).catch(err => {
            console.error('Error fetching banners:', err);
            results.banners = [];
          })
        );
      }
      if (hasPermission('manageNotifications')) {
        apiCalls.push(
          callMap.notifications().then(res => {
            if (res.success && res.data) {
              results.notifications = res.data;
            } else {
              results.notifications = [];
            }
          }).catch(err => {
            console.error('Error fetching notifications:', err);
            results.notifications = [];
          })
        );
      }
      if (hasPermission('manageFaqs')) {
        apiCalls.push(
          callMap.faqs().then(res => {
            if (res.success && res.data) {
              results.faqs = res.data;
            } else {
              results.faqs = [];
            }
          }).catch(err => {
            console.error('Error fetching FAQs:', err);
            results.faqs = [];
          })
        );
      }
      if (hasPermission('manageNewsletter')) {
        apiCalls.push(
          callMap.newsletters().then(res => {
            if (res.success && res.data) {
              results.newsletters = res.data;
            } else {
              results.newsletters = [];
            }
          }).catch(err => {
            console.error('Error fetching newsletters:', err);
            results.newsletters = [];
          })
        );
        apiCalls.push(
          callMap.newsletterEmails().then(res => {
            if (res.success && res.data) {
              results.newsletterEmails = res.data;
            } else {
              results.newsletterEmails = [];
            }
          }).catch(err => {
            console.error('Error fetching newsletter emails:', err);
            results.newsletterEmails = [];
          })
        );
      }
      if (hasPermission('manageContactUs')) {
        apiCalls.push(
          callMap.contacts().then(res => {
            if (res.success && res.data) {
              results.contacts = res.data;
            } else {
              results.contacts = [];
            }
          }).catch(err => {
            console.error('Error fetching contacts:', err);
            results.contacts = [];
          })
        );
      }

      // Wait for all permitted API calls to complete
      await Promise.all(apiCalls);

      const companies = results.companies || [];
      const employees = results.employees || [];
      const customers = results.customers || [];
      const queries = results.queries || [];
      const transactions = results.transactions || [];
      const banners = results.banners || [];
      const notifications = results.notifications || [];
      const faqs = results.faqs || [];
      const newsletters = results.newsletters || [];
      const contacts = results.contacts || [];
      const newsletterEmails = results.newsletterEmails || [];

      setStats({
        totalCompanies: companies.length,
        totalEmployees: employees.length,
        totalCustomers: customers.length,
        pendingQueries: queries.filter((q: any) => q.status === 'pending' || !q.status || q.status === 'unresolved')?.length || 0,
        totalTransactions: transactions.length,
        totalBanners: banners.length,
        totalNotifications: notifications.length,
        totalFAQs: faqs.length,
        totalNewsletters: newsletters.length,
        totalContacts: contacts.length,
        totalNewsletterEmails: newsletterEmails.length,
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshStats = () => {
    loadStats(true);
  };

  const handleManualRefresh = () => {
    refreshStats();
  };

  const allStatCards = [
    {
      title: t('dashboard.totalCompanies'),
      value: stats.totalCompanies,
      icon: Building2,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      route: '/companies',
      permission: 'manageCompanies',
    },
    {
      title: t('dashboard.totalEmployees'),
      value: stats.totalEmployees,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      route: '/employees',
      permission: 'manageEmployees',
    },
    {
      title: t('dashboard.totalCustomers'),
      value: stats.totalCustomers,
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      route: '/customers',
      permission: 'manageCustomers',
    },
    {
      title: t('dashboard.pendingQueries'),
      value: stats.pendingQueries,
      icon: Mail,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      route: '/queries',
      permission: 'manageQueries',
    },
    {
      title: t('dashboard.totalTransactions'),
      value: stats.totalTransactions,
      icon: CreditCard,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      route: '/transactions',
      permission: 'manageTransactions',
    },
    {
      title: t('dashboard.totalBanners'),
      value: stats.totalBanners,
      icon: Image,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      route: '/banners',
      permission: 'manageBanners',
    },
    {
      title: t('dashboard.totalNotifications'),
      value: stats.totalNotifications,
      icon: Bell,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      route: '/notifications',
      permission: 'manageNotifications',
    },
    {
      title: t('dashboard.totalFAQs'),
      value: stats.totalFAQs,
      icon: HelpCircle,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      route: '/faqs',
      permission: 'manageFaqs',
    },
    {
      title: t('dashboard.totalNewsletters'),
      value: stats.totalNewsletters,
      icon: Newspaper,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      route: '/newsletter-images',
      permission: 'manageNewsletter',
    },
    {
      title: t('dashboard.totalContacts'),
      value: stats.totalContacts,
      icon: MessageSquare,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      route: '/contact-us',
      permission: 'manageContactUs',
    },
    {
      title: t('dashboard.totalNewsletterEmails'),
      value: stats.totalNewsletterEmails,
      icon: MailCheck,
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      route: '/newsletter-emails',
      permission: 'manageNewsletter',
    },
  ];

  // Filter stat cards based on permissions
  const statCards = allStatCards.filter(card => hasPermission(card.permission));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              {t('dashboard.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('dashboard.refresh')}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{t('dashboard.refresh')}</span>
        </button>
      </div>

      {statCards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-500 text-lg">
            {t('dashboard.noPermissions')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(card.route)}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
