import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ style }) {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="glass-panel"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.2rem',
                border: '1px solid rgba(234, 88, 12, 0.4)',
                background: 'rgba(10, 10, 10, 0.7)',
                color: 'white',
                borderRadius: '50px',
                cursor: 'pointer',
                fontFamily: 'var(--font-main)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                ...style
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <Globe size={18} color="var(--color-primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {language === 'en' ? 'EN / TH' : 'TH / EN'}
            </span>
        </button>
    );
}
