export let users = [
  {
    id: 9999,
    userName: 'admin',
    password: 'ts123',
    fullName: 'Quản Trị Viên',
    email: 'admin@shopee.vn',
    phoneNumber: '19001234',
    avatarUrl: 'https://picsum.photos/seed/admin/100/100',
    role: 'admin',
    sex: 'Nam',
    dateOfBirth: '1985-05-05',
    accountStatus: 'ACTIVE'
  },
  {
    id: 1001,
    userName: 'seller',
    password: 'ts123',
    fullName: 'Người Bán Hàng',
    email: 'seller@example.com',
    phoneNumber: '0987654321',
    avatarUrl: 'https://picsum.photos/seed/seller/100/100',
    role: 'seller',
    shopId: 101,
    sex: 'Nữ',
    dateOfBirth: '1990-01-01',
    accountStatus: 'ACTIVE'
  },
  {
    id: 1002,
    userName: 'buyer',
    password: 'ts123',
    fullName: 'Khách Mua Hàng',
    email: 'buyer@example.com',
    phoneNumber: '0123456789',
    avatarUrl: 'https://picsum.photos/seed/buyer/100/100',
    role: 'buyer',
    sex: 'Nam',
    dateOfBirth: '1995-10-10',
    accountStatus: 'ACTIVE'
  }
];

export const addresses = [
  {
    id: 1,
    userId: 1001,
    fullName: 'Nguyễn Văn A',
    phoneNumber: '0987654321',
    province: 'Hà Nội',
    district: 'Quận Hai Bà Trưng',
    ward: 'Phường Bách Khoa',
    specificAddress: 'Số 1 Đại Cồ Việt',
    isDefault: true,
    AddressType: 'Nhà riêng'
  }
];

export const categories = [];
export const shops = [];
export let products = [];
export let productVariants = [];
export let orders = [];
export let reviews = [];
