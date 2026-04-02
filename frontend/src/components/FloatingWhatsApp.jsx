import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingWhatsApp = () => {
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Show popup 3 seconds after load to grab attention
        const timerId = setTimeout(() => setShowPopup(true), 3000);
        return () => clearTimeout(timerId);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '15px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        style={{
                            backgroundColor: 'white',
                            padding: '10px 16px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            position: 'relative',
                            marginRight: '6px', 
                            border: '1px solid #f0f0f0'
                        }}
                    >
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#333', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            Need help? 
                        </p>
                        
                        {/* Triangle pointer targeting the button */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-6px',
                            right: '16px',
                            width: '12px',
                            height: '12px',
                            backgroundColor: 'white',
                            transform: 'rotate(45deg)',
                            borderBottom: '1px solid #f0f0f0',
                            borderRight: '1px solid #f0f0f0'
                        }} />
                        
                        {/* Close button for the popup */}
                        <button 
                            onClick={() => setShowPopup(false)}
                            style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#f5f5f5',
                                border: '1px solid #e0e0e0',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                cursor: 'pointer',
                                color: '#666',
                                transition: 'background 0.2s',
                                padding: 0
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e5e5e5'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Continuous floating animation for the WhatsApp icon */}
            <motion.a 
                href="https://wa.me/917438855060" 
                target="_blank" 
                rel="noopener noreferrer"
                initial={{ scale: 0 }}
                animate={{ scale: 1, y: [0, -6, 0] }}
                whileHover={{ scale: 1.1, y: 0 }}
                transition={{ 
                    y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                    scale: { type: "spring", stiffness: 260, damping: 20 }
                }}
                onClick={() => setShowPopup(false)}
                style={{
                    backgroundColor: '#25D366',
                    color: 'white',
                    borderRadius: '50%',
                    width: '45px',
                    height: '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0px 6px 16px rgba(37,211,102,0.35)',
                    textDecoration: 'none'
                }}
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    fill="currentColor" 
                    viewBox="0 0 16 16"
                >
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
            </motion.a>
        </div>
    );
};

export default FloatingWhatsApp;
