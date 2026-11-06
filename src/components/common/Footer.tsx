import React, { useState } from 'react';
import { Search, Shield, Heart, Mail, ExternalLink, Lock } from 'lucide-react';
import { Modal } from './Modal';

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'about' | 'contact' | 'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-white border-t border-[#E8F5EC] mt-20 pt-16 pb-12 text-[#202B25]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#E8F5EC]">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#238B57] flex items-center justify-center text-white shadow-sm">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#202B25] font-heading">
                FindIt
              </span>
            </div>
            <p className="text-sm text-[#78847D] leading-relaxed">
              A modern, minimal platform dedicated to reconnecting lost belongings with the people who matter through secure ownership verification.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#238B57] font-medium bg-[#E8F5EC] px-3 py-1.5 rounded-lg w-fit">
              <Shield className="w-3.5 h-3.5" />
              <span>Verified Ownership First</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78847D] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#lost" className="text-[#202B25] hover:text-[#238B57] transition-colors">
                  Lost Items Directory
                </a>
              </li>
              <li>
                <a href="#found" className="text-[#202B25] hover:text-[#238B57] transition-colors">
                  Found Items Directory
                </a>
              </li>
              <li>
                <a href="#how" className="text-[#202B25] hover:text-[#238B57] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#safety" className="text-[#202B25] hover:text-[#238B57] transition-colors">
                  Safe Handover Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78847D] mb-4">
              Security & Privacy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="text-[#202B25] hover:text-[#238B57] transition-colors text-left"
                >
                  Image Evidence Protection
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="text-[#202B25] hover:text-[#238B57] transition-colors text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="text-[#202B25] hover:text-[#238B57] transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-xs text-[#78847D]">
                  <Lock className="w-3 h-3 text-[#238B57]" />
                  <span>Row Level Security (RLS)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Company / Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78847D] mb-4">
              Connect
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setActiveModal('about')}
                  className="text-[#202B25] hover:text-[#238B57] transition-colors"
                >
                  About FindIt
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('contact')}
                  className="text-[#202B25] hover:text-[#238B57] transition-colors"
                >
                  Contact Support
                </button>
              </li>
              <li>
                <span className="text-[#78847D] text-xs">
                  Available Mon–Fri 9am–6pm EST
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78847D] gap-4">
          <p>© {new Date().getFullYear()} FindIt Technologies. Built for community safety.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-[#202B25]">
              Privacy
            </button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-[#202B25]">
              Terms
            </button>
            <button onClick={() => setActiveModal('contact')} className="hover:text-[#202B25]">
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Modals for Footer links */}
      <Modal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        title="About FindIt"
      >
        <div className="space-y-4 text-sm text-[#202B25] leading-relaxed">
          <p>
            FindIt was created with a single mission: to eliminate the friction and heartbreak of losing everyday personal belongings.
          </p>
          <p>
            Traditional bulletin boards and social media groups expose personal contact numbers and allow anyone to claim items dishonestly. FindIt solves this with our <strong>Proof-of-Ownership Verification System</strong>, letting honest finders inspect claimant evidence privately before agreeing to a safe public handover.
          </p>
          <div className="p-4 rounded-xl bg-[#E8F5EC] border border-[#238B57]/20 flex items-center gap-3">
            <Heart className="w-6 h-6 text-[#238B57] shrink-0" />
            <p className="text-xs text-[#202B25]">
              Every month, thousands of keys, laptops, pets, and wallets find their way back home safely.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title="Contact FindIt Support"
      >
        <div className="space-y-4 text-sm text-[#202B25]">
          <p className="text-[#78847D]">
            Have an inquiry about an item listing, safety concern, or feature suggestion? Reach our community response team:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FBF9] border border-[#E8F5EC]">
              <Mail className="w-5 h-5 text-[#238B57]" />
              <div>
                <p className="font-semibold text-xs text-[#202B25]">Email Support</p>
                <p className="text-xs text-[#78847D]">support@findit-app.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FBF9] border border-[#E8F5EC]">
              <Shield className="w-5 h-5 text-[#238B57]" />
              <div>
                <p className="font-semibold text-xs text-[#202B25]">Safety & Fraud Desk</p>
                <p className="text-xs text-[#78847D]">safety@findit-app.com</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy & Evidence Protection"
      >
        <div className="space-y-3 text-xs text-[#202B25] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p className="font-semibold text-sm">1. Private Ownership Verification</p>
          <p className="text-[#78847D]">
            Evidence images and secret descriptions submitted during the "Claim This Item" process are strictly confidential. Under our Row Level Security (RLS) rules, only the claimant and the specific finder who reported the found item have permission to view them.
          </p>
          <p className="font-semibold text-sm mt-3">2. In-App Safe Messaging</p>
          <p className="text-[#78847D]">
            Your personal telephone number and physical address are never published on listing cards. All coordination occurs through our encrypted one-to-one messaging channel.
          </p>
          <p className="font-semibold text-sm mt-3">3. Data Retention</p>
          <p className="text-[#78847D]">
            Once an item claim has been marked Resolved, you may remove your listing and associated images from our servers at any time.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
      >
        <div className="space-y-3 text-xs text-[#202B25] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p className="font-semibold text-sm">Safe Handover Recommendation</p>
          <p className="text-[#78847D]">
            FindIt strongly recommends meeting in well-lit, public locations (e.g., local police station lobby, public library entrance, university administration office) to execute item returns.
          </p>
          <p className="font-semibold text-sm mt-3">No Fee Extraction</p>
          <p className="text-[#78847D]">
            Finders are prohibited from withholding found property or demanding extortionate fees for the return of legal property. Voluntary rewards offered by owners are subject to private mutual agreement.
          </p>
        </div>
      </Modal>
    </footer>
  );
};

