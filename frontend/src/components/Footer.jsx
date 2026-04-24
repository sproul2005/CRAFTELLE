import React from 'react';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer id="contact-us" style={{
            backgroundColor: '#111',
            color: '#e0e0e0',
            padding: '5rem 0 2rem',
            marginTop: 'auto',
            borderTop: '1px solid #222'
        }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '3rem',
                marginBottom: '3rem'
            }}>
                {}
                <div>
                    <h3 style={{
                        color: 'white',
                        fontSize: '1.8rem',
                        marginBottom: '1.5rem',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '-0.5px'
                    }}>
                        Craftelle.
                    </h3>
                    <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        Curating the finest handcrafted treasures. We bring you products that tell a story, crafted with love and tradition.
                    </p>

                    {}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <a href="https://www.facebook.com/share/1CUjiCsiWD/" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', transition: 'color 0.2s', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                            <Facebook size={20} className="hover:text-white" />
                        </a>
                        <a href="https://www.instagram.com/flashy___ray?utm_source=qr&igsh=MXV1ZnlxbHpjdHd5OQ==" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', transition: 'color 0.2s', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                            <Instagram size={20} className="hover:text-white" />
                        </a>
                        <a href="https://youtube.com/@rashmi_artzone?si=m9xHpgTugM-Cr9Wv" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', transition: 'color 0.2s', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                            <Youtube size={20} className="hover:text-white" />
                        </a>
                    </div>
                </div>

                {}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li><a href="/" style={{ color: '#aaa', fontSize: '0.95rem', transition: 'color 0.2s' }}>Home</a></li>
                        <li><a href="/#about-us" style={{ color: '#aaa', fontSize: '0.95rem', transition: 'color 0.2s' }}>About Us</a></li>
                        <li><a href="/shop" style={{ color: '#aaa', fontSize: '0.95rem', transition: 'color 0.2s' }}>Collections</a></li>
                        <li><a href="/login" style={{ color: '#aaa', fontSize: '0.95rem', transition: 'color 0.2s' }}>My Account</a></li>
                    </ul>
                </div>

                {}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Contact Us</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', color: '#aaa' }}>
                            <Mail size={18} />
                            <span style={{ fontSize: '0.95rem' }}>craftelle0203@gmail.com</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', color: '#aaa' }}>
                            <Phone size={18} />
                            <span style={{ fontSize: '0.95rem' }}>+91 7438855060</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'start', color: '#aaa' }}>
                            <MapPin size={18} style={{ marginTop: '3px' }} />
                            <span style={{ fontSize: '0.95rem' }}>Khosalpur, Kuakhia, Jajpur,<br />Odisha - 755009</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                textAlign: 'center',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                color: '#666',
                fontSize: '0.85rem'
            }}>
                <p>&copy; {new Date().getFullYear()} Craftelle. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default React.memo(Footer);
