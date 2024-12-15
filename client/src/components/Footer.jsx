import React, { useState } from 'react';
import './components-css/Footer.css';

function Footer() {
  const [activeModal, setActiveModal] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const toggleDropdown = (policy) => {
    setOpenDropdown(openDropdown === policy ? null : policy);
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

                  <h3 onClick={() => toggleDropdown('softwareSecurity')}>Software Security Policy</h3>
                  {openDropdown === 'softwareSecurity' && (
                    <div>
                      <p>This policy ensures that all system software, including applications and operating systems, is regularly updated with security patches. Licensed software must be used exclusively, with prohibited installation of unauthorized or pirated software. Secure coding practices are enforced during development to mitigate vulnerabilities, and regular penetration testing is conducted to identify and resolve potential threats.</p>
                      <p>Purpose: To safeguard system software and ensure compliance with licensing and updates.</p>
                      <ul>
                        <li>Use only licensed and approved software.</li>
                        <li>Regularly update and patch all applications and operating systems.</li>
                        <li>Implement endpoint security tools such as antivirus and anti-malware.</li>
                        <li>Restrict user access to software based on job roles.</li>
                        <li>Conduct vulnerability assessments for critical software.</li>
                      </ul>
                    </div>
                  )}

                  <h3 onClick={() => toggleDropdown('networkCommunications')}>Network Communications Policy</h3>
                  {openDropdown === 'networkCommunications' && (
                    <div>
                      <p>Network communication policies establish guidelines to safeguard data transmission. Protocols such as HTTPS and SSL/TLS are used to encrypt data in transit. Firewalls, intrusion detection/prevention systems (IDS/IPS), and access control lists (ACLs) are implemented to monitor and filter network traffic. Only authorized personnel can access internal networks, with VPN access for remote users.</p>
                      <p>Purpose: To ensure the secure and reliable operation of network systems.</p>
                      <ul>
                        <li>Encrypt all sensitive data transmitted over the network.</li>
                        <li>Use firewalls and intrusion detection/prevention systems.</li>
                        <li>Segment the network to minimize risks of breaches.</li>
                        <li>Monitor network traffic for unauthorized activity.</li>
                        <li>Establish and enforce a Virtual Private Network (VPN) policy for remote access.</li>
                      </ul>
                    </div>
                  )}

                  <h3 onClick={() => toggleDropdown('dataPolicy')}>Data Policy</h3>
                  {openDropdown === 'dataPolicy' && (
                    <div>
                      <p>This policy governs the secure collection, storage, access, and sharing of data. Sensitive data must be encrypted both at rest and in transit. Access is role-based, adhering to the principle of least privilege. Regular data backups are mandatory, with recovery testing procedures in place. Additionally, users are prohibited from transferring sensitive information to unauthorized external devices or platforms.</p>
                      <p>Purpose: To protect the integrity, confidentiality, and availability of data.</p>
                      <ul>
                        <li>Classify data based on sensitivity (e.g., public, internal, confidential).</li>
                        <li>Encrypt sensitive data at rest and in transit.</li>
                        <li>Implement regular data backups and disaster recovery procedures.</li>
                        <li>Restrict access to data on a need-to-know basis.</li>
                        <li>Provide training on proper data handling and protection techniques.</li>
                      </ul>
                    </div>
                  )}

                  <h3 onClick={() => toggleDropdown('processPolicy')}>Process Policy</h3>
                  {openDropdown === 'processPolicy' && (
                    <div>
                      <p>Process policies document standard operating procedures (SOPs) for handling system operations and security incidents. This includes protocols for routine maintenance, incident response, and change management. Any modifications to system configurations must undergo proper approval and documentation. Incident reporting and mitigation steps are standardized to ensure quick resolution.</p>
                      <p>Purpose: To define secure procedures for operational workflows.</p>
                      <ul>
                        <li>Establish and document all processes, including incident response and change management.</li>
                        <li>Regularly audit and refine processes to align with security standards.</li>
                        <li>Automate repetitive tasks to minimize human error.</li>
                        <li>Define clear accountability for process implementation.</li>
                        <li>Conduct periodic reviews of workflows for efficiency and security compliance.</li>
                      </ul>
                    </div>
                  )}

                  <h3 onClick={() => toggleDropdown('peoplePolicy')}>People Policy</h3>
                  {openDropdown === 'peoplePolicy' && (
                    <div>
                      <p>The people policy focuses on the human aspect of security, including user education and training on cybersecurity best practices. Background checks are required for personnel handling sensitive systems. Employees must sign agreements regarding the acceptable use of organizational resources. Regular security awareness campaigns and simulated phishing exercises are conducted to reinforce vigilance.</p>
                      <p>Purpose: To address the human factor in security.</p>
                      <ul>
                        <li>Conduct background checks for all employees handling sensitive systems.</li>
                        <li>Provide security awareness training regularly.</li>
                        <li>Enforce policies on password management and social engineering prevention.</li>
                        <li>Clearly define user roles and responsibilities.</li>
                        <li>Create a culture of accountability through enforcement of disciplinary actions for policy violations.</li>
                      </ul>
                    </div>
                  )}

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