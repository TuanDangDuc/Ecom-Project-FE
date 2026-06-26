import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';
import HomeView from '../views/buyer/HomeView.vue';
import ProductView from '../views/buyer/ProductView.vue';
import CartView from '../views/buyer/CartView.vue';
import CheckoutView from '../views/buyer/CheckoutView.vue';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue';
import VerifyEmailView from '../views/auth/VerifyEmailView.vue';
import ProfileView from '../views/buyer/ProfileView.vue';
import AccountInfoView from '../views/buyer/profile/AccountInfo.vue';
import AddressesView from '../views/buyer/profile/Addresses.vue';
import OrdersView from '../views/buyer/profile/Orders.vue';
import SearchView from '../views/buyer/SearchView.vue';
import ShopView from '../views/buyer/ShopView.vue';
import SellerLayout from '../views/seller/SellerLayout.vue';
import DashboardView from '../views/seller/Dashboard.vue';
import ProductsView from '../views/seller/Products.vue';
import ProductFormView from '../views/seller/ProductForm.vue';
import ShopProfileView from '../views/seller/ShopProfile.vue';
import SellerOrdersView from '../views/seller/Orders.vue';

// Admin Views
import AdminLayout from '../views/admin/AdminLayout.vue';
import AdminDashboard from '../views/admin/Dashboard.vue';
import AdminUsers from '../views/admin/Users.vue';
import AdminShops from '../views/admin/Shops.vue';
import AdminCategories from '../views/admin/Categories.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/search', name: 'search', component: SearchView },
    { path: '/product/:id', name: 'product-detail', component: ProductView },
    { path: '/shop/:id', name: 'shop-detail', component: ShopView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/checkout', name: 'checkout', component: CheckoutView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
    { path: '/verify-email', name: 'verify-email', component: VerifyEmailView },
    {
      path: '/profile',
      component: ProfileView,
      meta: { requiresAuth: true },
      children: [
        { path: 'account', component: AccountInfoView },
        { path: 'addresses', component: AddressesView },
        { path: 'orders', component: OrdersView },
        { path: '', redirect: '/profile/account' }
      ]
    },
    {
      path: '/seller',
      component: SellerLayout,
      meta: { requiresAuth: true, requiresSeller: true },
      children: [
        { path: 'dashboard', component: DashboardView },
        { path: 'orders', component: SellerOrdersView },
        { path: 'products', component: ProductsView },
        { path: 'products/add', component: ProductFormView },
        { path: 'products/edit/:id', component: ProductFormView }, // Edit route
        { path: 'profile', component: ShopProfileView },
        { path: '', redirect: '/seller/dashboard' }
      ]
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: 'dashboard', component: AdminDashboard },
        { path: 'users', component: AdminUsers },
        { path: 'shops', component: AdminShops },
        { path: 'categories', component: AdminCategories }, // NEW
        { path: '', redirect: '/admin/dashboard' }
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else if (to.meta.requiresSeller && userStore.currentUser?.role !== 'SELLER') {
    alert('Bạn không có quyền truy cập trang người bán!');
    next('/');
  } else if (to.meta.requiresAdmin && userStore.currentUser?.role !== 'ADMIN') {
    alert('Bạn không có quyền truy cập trang quản trị!');
    next('/');
  } else {
    next();
  }
});

export default router;
