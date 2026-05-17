import { useAuth } from '../../contexts/AuthContext';
import { Lock, LogOut, HeadphonesIcon, ShieldAlert } from 'lucide-react';

const SchoolDeactivated = () => {
  const { logout, user } = useAuth();

  const isFacilitator = user?.role === 'FACILITATOR';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f8] p-6 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-[-160px] right-[-160px] w-[420px] h-[420px] rounded-full bg-slate-300/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-160px] left-[-160px] w-[380px] h-[380px] rounded-full bg-violet-200/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl">

        <div className="bg-white rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.10)] overflow-hidden border border-white/60">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 px-10 pt-10 pb-12 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center mb-6">
                <Lock size={36} strokeWidth={1.5} className="text-white" />
              </div>

              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                Access Restricted
              </div>

              <h1 className="text-[2rem] font-bold tracking-tight leading-tight">
                {isFacilitator ? 'Access Restricted' : 'School Deactivated'}
              </h1>

              <p className="mt-3 text-white/70 text-sm leading-7 max-w-sm">
                Access to this platform has been temporarily restricted.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-4">

            {/* Status message */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <ShieldAlert size={15} className="text-slate-500" />
              </div>
              <p className="text-sm text-slate-600 leading-6">
                {isFacilitator
                  ? 'Your facilitator access has been restricted. Please contact your school manager for additional information.'
                  : 'Your school has been temporarily deactivated. Please contact the MIET Africa administration team for assistance.'}
              </p>
            </div>

            {/* Support block */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <HeadphonesIcon size={14} className="text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">MIET Africa Support</p>
                <p className="text-sm text-slate-500 mt-1 leading-5">
                  If you believe this was done in error, please reach out to the MIET Africa support team or your assigned administrator.
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

export default SchoolDeactivated;