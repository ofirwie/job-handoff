import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/monday-design-system.css';

export const NavigationDemo: React.FC = () => {
  const navigate = useNavigate();

  const routes = [
    {
      category: 'Monday.com Design System',
      description: 'כל הממשקים עם עיצוב Monday.com מלא',
      items: [
        {
          path: '/main',
          title: 'סקירת חפיפות כללית',
          description: 'דף ראשי עם רשימת חפיפות ו-KPI'
        },
        {
          path: '/employee',
          title: 'ממשק עובד',
          description: '"החפיפה שלי" עם מעקב התקדמות ומטלות'
        },
        {
          path: '/manager',
          title: 'ממשק מנהל',
          description: 'ניהול צוות עם KPI ומעקב אחר חברי הצוות'
        },
        {
          path: '/admin',
          title: 'ממשק מנהל מערכת',
          description: 'ניהול מערכת מלא עם סטטיסטיקות ותבניות'
        }
      ]
    },
    {
      category: 'ממשקים קיימים',
      description: 'הממשקים המקוריים לצורך השוואה',
      items: [
        {
          path: '/classic',
          title: 'דף ראשי קלאסי',
          description: 'הממשק המקורי עם העיצוב הישן'
        },
        {
          path: '/classic/handovers',
          title: 'חפיפות קלאסי',
          description: 'טבלת חפיפות עם נתונים מדומים'
        },
        {
          path: '/classic/templates',
          title: 'תבניות קלאסי',
          description: 'ניהול תבניות עם נתוני אלבעד האמיתיים'
        },
        {
          path: '/apple',
          title: 'Apple Style',
          description: 'עיצוב מינימליסטי בסגנון Apple'
        }
      ]
    },
    {
      category: 'כלי עזר',
      description: 'דפי תמיכה ובדיקות',
      items: [
        {
          path: '/settings',
          title: 'הגדרות',
          description: 'אשף הגדרת Google Integration'
        },
        {
          path: '/debug',
          title: 'Debug Routing',
          description: 'מידע טכני על הניתוב'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--monday-background)' }}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">מערכת חפיפות אלבעד</h1>
          <p className="text-xl text-muted-foreground">עם עיצוב Monday.com מקצועי</p>
          <div className="flex justify-center space-x-4 mt-6">
            <div className="kpi-card" style={{ minWidth: '200px' }}>
              <div className="kpi-card-icon" style={{ backgroundColor: '#0073ea20', color: '#0073ea' }}>
                <span style={{ fontSize: '18px' }}>🎨</span>
              </div>
              <div className="kpi-card-value">4</div>
              <div className="kpi-card-label">ממשקי Monday.com</div>
            </div>
            <div className="kpi-card" style={{ minWidth: '200px' }}>
              <div className="kpi-card-icon" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
                <span style={{ fontSize: '18px' }}>✅</span>
              </div>
              <div className="kpi-card-value">RTL</div>
              <div className="kpi-card-label">תמיכה בעברית</div>
            </div>
            <div className="kpi-card" style={{ minWidth: '200px' }}>
              <div className="kpi-card-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                <span style={{ fontSize: '18px' }}>📱</span>
              </div>
              <div className="kpi-card-value">100%</div>
              <div className="kpi-card-label">Responsive</div>
            </div>
          </div>
        </div>

        {/* Routes Categories */}
        {routes.map((category, categoryIndex) => (
          <div key={categoryIndex} className="monday-card">
            <div className="monday-card-header">
              <h2 className="monday-card-title">{category.category}</h2>
              <p className="monday-card-subtitle">{category.description}</p>
            </div>
            <div className="monday-card-content">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex}
                    className="monday-card"
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--monday-shadow-lg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--monday-shadow-sm)';
                    }}
                  >
                    <div className="monday-card-content">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <span className="text-2xl">→</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center justify-between pt-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.path}
                          </code>
                          <button className="btn-monday btn-monday-primary btn-monday-sm">
                            בקר
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Features Highlight */}
        <div className="monday-card">
          <div className="monday-card-header">
            <h2 className="monday-card-title">תכונות המערכת</h2>
          </div>
          <div className="monday-card-content">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-2">
                <div className="text-3xl">🎨</div>
                <h3 className="font-semibold">עיצוב Monday.com</h3>
                <p className="text-sm text-muted-foreground">עיצוב מקצועי מלא עם כל הרכיבים</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🔄</div>
                <h3 className="font-semibold">עדכונים בזמן אמת</h3>
                <p className="text-sm text-muted-foreground">חיבור לבסיס נתונים עם Supabase</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">👥</div>
                <h3 className="font-semibold">ממשקים לפי תפקיד</h3>
                <p className="text-sm text-muted-foreground">עובד, מנהל, מנהל מערכת</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">📱</div>
                <h3 className="font-semibold">רספונסיבי</h3>
                <p className="text-sm text-muted-foreground">פועל מושלם על כל המכשירים</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🔧</div>
                <h3 className="font-semibold">ניהול מטלות</h3>
                <p className="text-sm text-muted-foreground">מערכת מטלות מתקדמת עם קבצים</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">📊</div>
                <h3 className="font-semibold">דוחות וסטטיסטיקות</h3>
                <p className="text-sm text-muted-foreground">KPI cards ומעקב התקדמות</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="monday-card">
          <div className="monday-card-content">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">מה להתחיל?</h3>
              <p className="text-muted-foreground">
                בחר את הממשק המתאים לך מהרשימה למעלה, או התחל עם הדף הראשי החדש
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  className="btn-monday btn-monday-primary"
                  onClick={() => navigate('/main')}
                >
                  📋 דף ראשי חדש
                </button>
                <button 
                  className="btn-monday btn-monday-secondary"
                  onClick={() => navigate('/employee')}
                >
                  👤 ממשק עובד
                </button>
                <button 
                  className="btn-monday btn-monday-secondary"
                  onClick={() => navigate('/manager')}
                >
                  👨‍💼 ממשק מנהל
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationDemo;