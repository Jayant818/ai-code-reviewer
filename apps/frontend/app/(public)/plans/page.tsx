"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaRocket, FaCrown, FaInfinity, FaShieldAlt, FaHeadset, FaBolt } from "react-icons/fa";
import { useSubscriptionMutation } from "@/features/subscription/useSubscriptionQuery";
import { useRouter } from "next/navigation";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: 'trial' | 'pro';
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ComponentType<any>;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'secondary' | 'primary';
}

const plans: Plan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out our AI code review capabilities',
    icon: FaRocket,
    features: [
      { text: '10 code reviews per month', included: true },
      { text: 'Basic bug detection', included: true },
      { text: 'Security vulnerability scanning', included: true },
      { text: 'Community support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom integrations', included: false },
      { text: 'Team collaboration', included: false },
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'secondary',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$29',
    period: '/month',
    description: 'Unlimited AI reviews with advanced features for professional teams',
    icon: FaCrown,
    popular: true,
    features: [
      { text: 'Unlimited code reviews', included: true },
      { text: 'Advanced bug detection & fixes', included: true },
      { text: 'Security vulnerability scanning', included: true },
      { text: 'Performance optimization tips', included: true },
      { text: 'Advanced analytics & insights', included: true },
      { text: 'Priority support (24/7)', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Team collaboration tools', included: true },
    ],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'primary',
  },
];

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | null>(null);
  
  const { mutate: subscribe, isPending: isSubscribing } = useSubscriptionMutation({
  });

  const handleSelectPlan = (planId: 'free' | 'pro') => {
    setSelectedPlan(planId);
    subscribe({ type: planId });
    // router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl floating" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-gradient">Choose Your Plan</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-foreground-muted max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Start with our free trial or unlock unlimited AI-powered code reviews with Pro. 
            Choose the plan that fits your development workflow.
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-8 text-foreground-subtle text-sm"
          >
            <div className="flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4 text-success" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBolt className="w-4 h-4 text-warning" />
              <span>Instant activation</span>
            </div>
            <div className="flex items-center gap-2">
              <FaHeadset className="w-4 h-4 text-info" />
              <span>24/7 support</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
              className={`relative glass-card rounded-2xl p-8 card-hover ${
                plan.popular ? 'border-gradient glow-effect' : 'border-glass-border'
              }`}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <div className="premium-gradient text-white px-6 py-2 rounded-xl font-bold text-sm">
                    ⭐ Most Popular
                  </div>
                </motion.div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <motion.div 
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    plan.popular ? 'premium-gradient glow-effect' : 'bg-muted'
                  }`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <plan.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-2 text-gradient">{plan.name}</h3>
                <p className="text-foreground-muted mb-4">{plan.description}</p>
                
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-foreground-muted">{plan.period}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + featureIndex * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      feature.included 
                        ? 'bg-success text-white' 
                        : 'bg-muted text-foreground-subtle'
                    }`}>
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span className={feature.included ? 'text-foreground' : 'text-foreground-subtle line-through'}>
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isSubscribing && selectedPlan === plan.id}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.buttonVariant === 'primary'
                    ? 'premium-gradient text-white glow-effect hover:scale-105'
                    : 'glass-card text-foreground border-gradient hover:glow-effect'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubscribing && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  plan.buttonText
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold mb-8 text-gradient">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                q: "What happens after the free trial?",
                a: "Your account will continue with limited features. You can upgrade to Pro anytime to unlock full capabilities."
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee for all Pro subscriptions."
              },
              {
                q: "Is my code data secure?",
                a: "Absolutely. We never store your code and all analysis happens in real-time with enterprise-grade security."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.1, duration: 0.4 }}
                className="glass-card p-6 rounded-xl text-left"
              >
                <h3 className="font-semibold mb-2 text-gradient">{faq.q}</h3>
                <p className="text-foreground-muted text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
