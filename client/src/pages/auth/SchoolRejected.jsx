// SchoolRejected.jsx

import { useAuth } from '../../contexts/AuthContext';
import { XCircle, LogOut, MessageSquare, Phone } from 'lucide-react';

const SchoolRejected = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f8] p-6 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-[-160px] right-[-160px] w-[420px] h-[420px] rounded-full bg-rose-200/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-160px] left-[-160px] w-[380px] h-[380px] rounded-full bg-violet-200/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl">

        <div className="bg-white rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.10)] overflow-hidden border border-white/60">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 px-10 pt-10 pb-12 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                <XCircle size={38} strokeWidth={1.5} className="text-white" />
              </div>

              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-200" />
                Application Closed
              </div>

              <h1 className="text-[2rem] font-bold tracking-tight leading-tight">
                Registration Rejected
              </h1>

              <p className="mt-3 text-white/80 text-sm leading-7 max-w-sm">
                Unfortunately, your school registration was not approved at this time.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-4">

            {/* Status block */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
              <p className="text-xs font-bold tracking-widest uppercase text-rose-400 mb-2">Application Status</p>
              <p className="text-sm text-rose-700 leading-6">
                Please contact MIET Africa for further assistance or clarification regarding your application.
              </p>

              {user?.school?.rejection_comment && (
                <div className="mt-4 rounded-xl bg-white border border-rose-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-rose-400" />
                    <p className="text-xs font-bold tracking-widest uppercase text-slate-500">Rejection Reason</p>
                  </div>
                  <p className="text-sm text-slate-600 leading-6">
                    {user.school.rejection_comment}
                  </p>
                </div>
              )}
            </div>

            {/* Contact note */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Phone size={14} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Need Help?</p>
                <p className="text-sm text-slate-500 mt-1 leading-5">
                  Reach out to the MIET Africa support team for guidance on next steps or to appeal the decision.
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#5b54d6] to-[#4f9e8a] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200"
            >
              <LogOut size={15} />
              Logout
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolRejected;