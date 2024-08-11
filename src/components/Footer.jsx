import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>ที่อยู่ : 121 หมู่ 7 ต.น้ำอ้อม อ.เกษตรวิสัย จ.ร้อยเอ็ด 45150</p>
          <p>อีเมล : saranatai.10123@gmail.com</p>
          <p>เบอร์โทร : 062-172-5040</p>
        </div>
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-media">
            <a href="https://facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>
        <div className="footer-section">
          <h3>About Us</h3>
          <p>We are dedicated to providing the best service possible. Learn more about our mission and values.</p>
        </div>
      </div>
      <div className="footer-bottom">
      <p>&copy; {new Date().getFullYear()} Web Developer. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
