import React, { useState } from 'react';
import './components-css/Footer.css';

function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><button onClick={() => openModal('privacy')}>Privacy Policy</button></li>
            <li><button onClick={() => openModal('terms')}>Terms of Service</button></li>
            <li><button onClick={() => openModal('security')}>Security</button></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact Information</h4>
          <p>Quality Assurance Office</p>
          <p>Bukidnon State University</p>
          <p>Email: qa.office@buksu.edu.ph</p>
          <p>Phone: (088) 813-5661</p>
        </div>

        <div className="footer-section">
          <h4>Office Hours</h4>
          <p>Monday - Friday</p>
          <p>8:00 AM - 5:00 PM</p>
          <p>Except Holidays</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2024 Quality Assurance Office's Document Request System. All Rights Reserved.</p>
        <p>Bukidnon State University</p>
      </div>

      {/* Modal Component */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h2>{activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms of Service'}
                {activeModal === 'security' && 'Security'}</h2>
            <div className="modal-body">
              {activeModal === 'privacy' && (
                <>
                  <p>We value your privacy and are committed to protecting the personal information collected through this Document Request System. Your data, including personal details, document requests, and other relevant information, is stored securely and used only for processing and managing requests. We strictly adhere to Bukidnon State University's data privacy policies and relevant national regulations such as the Data Privacy Act of 2012. Your information will not be shared with third parties without your explicit consent, except as required by law.</p>
                  <ul>
                    <li>We only collect information necessary for document processing</li>
                    <li>Your personal data is stored securely and protected</li>
                    <li>We never share your information with third parties without your consent</li>
                    <li>You have the right to request access to your personal data</li>
                  </ul>
                  <p>Last updated: December 2024</p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>By accessing and using this Document Request System, you agree to abide by the terms set forth by Bukidnon State University. This includes ensuring the accuracy of the information you provide, using the system responsibly, and refraining from any unauthorized access or actions that may compromise the integrity of the system. Any misuse, including attempts to alter or manipulate data, will be subject to disciplinary and/or legal actions. This system is intended solely for the university’s students, staff, and authorized personnel.</p>
                  <ul>
                    <li>All submitted information must be accurate and truthful</li>
                    <li>Documents are processed in the order they are received</li>
                    <li>Processing times may vary depending on document type</li>
                    <li>Users must comply with university policies and guidelines</li>
                    <li>Misuse of the system may result in service suspension</li>
                  </ul>
                  <p>These terms are subject to change without prior notice.</p>
                </>
              )}

              {activeModal === 'security' && (
                <>
                  <p>We take the security of your data seriously. This system uses advanced encryption protocols, secure authentication mechanisms, and regular vulnerability assessments to ensure the safety and confidentiality of your information. Only authorized personnel have access to sensitive data, and all system activities are logged for monitoring and auditing purposes. For concerns about data security, unauthorized access, or system performance, please contact the Quality Assurance Office directly at [qao.drs@gmail.com].</p>
                  <ul>
                    <li>End-to-end encryption for all data transmission</li>
                    <li>Regular security audits and updates</li>
                    <li>Secure user authentication protocols</li>
                    <li>Regular backup of all system data</li>
                    <li>Strict access controls for staff members</li>
                  </ul>
                  <p>For security concerns, please contact our IT department.</p>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer; 