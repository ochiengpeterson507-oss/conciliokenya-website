// Page Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase
    const SUPABASE_URL = 'https://vdhzukeyavndyfcbdpau.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaHp1a2V5YXZuZHlmY2JkcGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTM3OTQsImV4cCI6MjA4MzI4OTc5NH0.S0IiJxH6RSbrKe0DQtM9wlBBOMb6Z_pgZMbm1oe6u7M';
    
    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // ... rest of your existing DOMContentLoaded code ...
    
    // Updated booking form submission
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                full_name: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim().toLowerCase(),
                phone: document.getElementById('phone').value.trim(),
                service_type: document.getElementById('serviceType').value,
                session_type: document.querySelector('input[name="sessionType"]:checked').value,
                preferred_date: document.getElementById('preferredDate').value,
                message: document.getElementById('message').value.trim() || '',
                status: 'pending',
                appointment_id: generateAppointmentId(),
                created_at: new Date().toISOString()
            };
            
            // Validate form data
            if (!validateForm(formData)) {
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            try {
                // Insert appointment into Supabase
                const { data, error } = await supabase
                    .from('appointments')
                    .insert([formData])
                    .select();
                
                if (error) {
                    throw error;
                }
                
                // Send confirmation email via edge function
                await sendConfirmationEmail(formData);
                
                // Send WhatsApp notification
                await sendWhatsAppNotification(formData);
                
                // Show success message
                showSuccessModal(formData);
                
                // Reset form
                appointmentForm.reset();
                
                // Switch to home page
                switchPage('home');
                
            } catch (error) {
                console.error('Appointment submission error:', error);
                showError(error.message || 'Failed to submit appointment. Please try again.');
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Helper functions
    function generateAppointmentId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `APPT-${timestamp}-${random}`;
    }
    
    function validateForm(formData) {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError('Please enter a valid email address');
            return false;
        }
        
        // Phone validation (Kenyan format)
        const phoneRegex = /^(07|01)\d{8}$/;
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            showError('Please enter a valid Kenyan phone number (07XX or 01XX format)');
            return false;
        }
        
        // Date validation
        const selectedDate = new Date(formData.preferred_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
            showError('Please select a future date for your appointment');
            return false;
        }
        
        return true;
    }
    
    async function sendConfirmationEmail(formData) {
        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/send-confirmation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                console.warn('Failed to send confirmation email, but appointment was saved');
            }
        } catch (error) {
            console.warn('Email service error:', error);
        }
    }
    
    async function sendWhatsAppNotification(formData) {
        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                console.warn('Failed to send WhatsApp notification, but appointment was saved');
            }
        } catch (error) {
            console.warn('WhatsApp service error:', error);
        }
    }
    
    function showSuccessModal(formData) {
        // Create modal HTML
        const modalHTML = `
            <div class="success-modal">
                <div class="modal-content">
                    <div class="modal-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Appointment Request Submitted!</h3>
                    <p>Thank you, <strong>${formData.full_name}</strong>! Your appointment request has been received.</p>
                    
                    <div class="appointment-details">
                        <div class="detail-item">
                            <span class="detail-label">Appointment ID:</span>
                            <span class="detail-value">${formData.appointment_id}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Service:</span>
                            <span class="detail-value">${formatServiceType(formData.service_type)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Session Type:</span>
                            <span class="detail-value">${formData.session_type === 'online' ? 'Online (Video Call)' : 
                                formData.session_type === 'inperson' ? 'In-Person' : 'Phone Session'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Preferred Date:</span>
                            <span class="detail-value">${new Date(formData.preferred_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                    </div>
                    
                    <div class="next-steps">
                        <h4><i class="fas fa-info-circle"></i> Next Steps:</h4>
                        <ol>
                            <li>You'll receive a confirmation email shortly</li>
                            <li>Our team will call you within 24 hours to finalize details</li>
                            <li>Check your WhatsApp for appointment reminders</li>
                        </ol>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" id="closeModalBtn">
                            <i class="fas fa-home"></i> Return to Home
                        </button>
                        <a href="https://wa.me/254701794838?text=Hello%20Conciliokenya%2C%20I%20just%20submitted%20an%20appointment%20request%20with%20ID%3A%20${formData.appointment_id}" 
                           target="_blank" class="btn btn-whatsapp">
                            <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add CSS for modal
        const modalCSS = `
            <style>
                .success-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.3s ease;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideUp 0.3s ease;
                }
                
                .modal-icon {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .modal-icon i {
                    font-size: 60px;
                    color: #4CAF50;
                }
                
                .modal-content h3 {
                    text-align: center;
                    margin-bottom: 15px;
                    color: var(--dark);
                }
                
                .appointment-details {
                    background: var(--primary-light);
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                }
                
                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                }
                
                .detail-item:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: var(--dark);
                }
                
                .next-steps {
                    background: #FFF3E0;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                }
                
                .next-steps h4 {
                    color: #FF9800;
                    margin-bottom: 10px;
                }
                
                .next-steps ol {
                    padding-left: 20px;
                }
                
                .next-steps li {
                    margin-bottom: 5px;
                }
                
                .modal-actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 30px;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @media (max-width: 768px) {
                    .modal-actions {
                        flex-direction: column;
                    }
                    
                    .modal-content {
                        padding: 30px 20px;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', modalCSS);
        
        // Add event listener to close button
        document.getElementById('closeModalBtn').addEventListener('click', function() {
            document.querySelector('.success-modal').remove();
        });
        
        // Close modal when clicking outside
        document.querySelector('.success-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                this.remove();
            }
        });
    }
    
    function formatServiceType(type) {
        const serviceMap = {
            'individual': 'Individual Counseling',
            'couples': 'Couples Therapy',
            'family': 'Family Counseling',
            'anxiety': 'Anxiety & Depression Support',
            'youth': 'Youth & Adolescent Counseling',
            'workplace': 'Workplace Stress & Burnout',
            'notsure': 'Not Sure / Need Guidance'
        };
        return serviceMap[type] || type;
    }
    
    function showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        // Add styles
        if (!document.querySelector('#toast-styles')) {
            const toastStyles = document.createElement('style');
            toastStyles.id = 'toast-styles';
            toastStyles.textContent = `
                .error-toast {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: #FF5252;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 2000;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    animation: slideInRight 0.3s ease;
                    max-width: 400px;
                }
                
                .error-toast i {
                    font-size: 20px;
                }
                
                .toast-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    margin-left: auto;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(toastStyles);
        }
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
        
        // Close button event
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    }
    
    // ... rest of your existing code ...
});