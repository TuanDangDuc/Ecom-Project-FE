<template>
  <footer class="footer">
    <div class="container footer-container">
      <div class="footer-col">
        <h3>Chăm sóc khách hàng</h3>
        <ul>
          <li>Trung tâm trợ giúp</li>
          <li>Hướng dẫn mua hàng</li>
          <li>Trả hàng & Hoàn tiền</li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Về chúng tôi</h3>
        <ul>
          <li>Giới thiệu</li>
          <li>Tuyển dụng</li>
          <li>Điều khoản</li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Theo dõi chúng tôi</h3>
        <ul>
          <li>Facebook</li>
          <li>Instagram</li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--white);
  border-top: 1px solid var(--border-color);
  padding-top: 60px;
  margin-top: 60px;
  position: relative;
}
.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-gradient);
}
.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}
.footer-col h3 {
  font-size: 16px;
  color: var(--text-dark);
  margin-bottom: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.footer-col ul li {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 16px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
}
.footer-col ul li:hover {
  color: var(--primary-color);
  transform: translateX(4px);
}
.footer-bottom {
  text-align: center;
  padding: 24px 0;
  background-color: #F8FAFC;
  font-size: 14px;
  color: var(--text-light);
  font-weight: 500;
  border-top: 1px solid var(--border-color);
}
</style>
