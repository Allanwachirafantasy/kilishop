import React from 'react';
import Icon from '@/components/ui/AppIcon';

const trustItems = [
  {
    icon: 'TruckIcon' as const,
    title: 'Fast Delivery',
    desc: 'Same-day delivery in Nairobi. 2-3 days nationwide.',
    color: '#FF6B2B',
  },
  {
    icon: 'ShieldCheckIcon' as const,
    title: '100% Secure',
    desc: 'Your payment and data are fully protected.',
    color: '#22C55E',
  },
  {
    icon: 'ArrowPathIcon' as const,
    title: 'Easy Returns',
    desc: 'Not satisfied? Return within 7 days for free.',
    color: '#3B82F6',
  },
  {
    icon: 'ChatBubbleLeftEllipsisIcon' as const,
    title: '24/7 Support',
    desc: 'Our team is always here to help you.',
    color: '#FFB800',
  },
];

const stats = [
  { value: '2M+', label: 'Happy Customers', icon: '😊' },
  { value: '50K+', label: 'Products Listed', icon: '📦' },
  { value: '99.2%', label: 'Delivery Rate', icon: '🚚' },
  { value: '4.9/5', label: 'Average Rating', icon: '⭐' },
];

const TrustSection: React.FC = () => {
  return (
    <section className="py-12 px-4 sm:px-6 border-t border-kili-border">
      <div className="max-w-7xl mx-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center md:items-start gap-1 p-4 rounded-xl bg-kili-elevated border border-kili-border"
            >
              <span className="text-2xl mb-1" aria-hidden="true">{stat.icon}</span>
              <span className="text-2xl sm:text-3xl font-display font-bold text-kili-fg">
                {stat.value}
              </span>
              <span className="text-xs text-kili-subtle uppercase tracking-wider text-center md:text-left">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Trust features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col sm:flex-row items-start gap-3 p-4 rounded-xl bg-kili-card border border-kili-border hover:border-primary/20 transition-colors"
            >
              <div
                className="p-2 rounded-lg shrink-0"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                <Icon name={item.icon} size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-kili-fg mb-0.5">{item.title}</h3>
                <p className="text-xs text-kili-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;