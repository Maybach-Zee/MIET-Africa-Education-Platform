import { useAuth } from '../../contexts/AuthContext';
import { Clock, BookOpen, GraduationCap, BarChart3, LogOut, CheckCircle } from 'lucide-react';

const SchoolPendingApproval = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f8] p-6 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-[-160px] right-[-160px] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-violet-300/20 to-indigo-300/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-160px] left-[-160px] w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-emerald-300/15 to-teal-200/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-100/20 blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-2xl">

        {/* Card */}
        <div className="bg-white rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.10)] overflow-hidden border border-white/60">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#5b54d6] via-[#6c63e8] to-[#4f9e8a] px-10 pt-10 pb-12 text-white overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner mb-6">
                <Clock size={38} strokeWidth={1.5} className="text-white" />
              </div>

              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                Under Review
              </div>

              <h1 className="text-[2rem] font-bold tracking-tight leading-tight">
                Registration Pending Approval
              </h1>

              <p className="mt-3 text-white/80 text-sm leading-7 max-w-md">
                Thank you for registering with MIET Africa. Your school application is currently being reviewed by our administration team.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-6">

            {/* User Info Card */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
              <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4">Application Details</p>
              <div className="space-y-3">
                {[
                  { label: 'Full Name', value: user?.full_name },
                  { label: 'School', value: user?.school?.centre_name },
                  { label: 'Status', value: 'Pending Verification', highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className={`text-sm font-semibold ${highlight ? 'text-amber-600 bg-amber-50 px-3 py-0.5 rounded-full border border-amber-100' : 'text-slate-700'}`}>
                      {value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  icon: <BookOpen size={20} strokeWidth={1.5} className="text-violet-500" />,
                  bg: 'bg-violet-50',
                  border: 'border-violet-100',
                  title: 'Literacy Programmes',
                  desc: 'Access learning tools and literacy initiatives designed to improve education outcomes.',
                },
                {
                  icon: <GraduationCap size={20} strokeWidth={1.5} className="text-emerald-600" />,
                  bg: 'bg-emerald-50',
                  border: 'border-emerald-100',
                  title: 'Teacher Development',
                  desc: 'Empower educators with professional development and digital learning resources.',
                },
                {
                  icon: <BarChart3 size={20} strokeWidth={1.5} className="text-indigo-500" />,
                  bg: 'bg-indigo-50',
                  border: 'border-indigo-100',
                  title: 'Impact Reporting',
                  desc: 'Monitor school performance and educational progress through real-time reporting.',
                },
              ].map(({ icon, bg, border, title, desc }) => (
                <div key={title} className={`rounded-2xl border ${border} ${bg} p-4`}>
                  <div className={`w-9 h-9 rounded-xl bg-white border ${border} flex items-center justify-center mb-3 shadow-sm`}>
                    {icon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug">{title}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-5">{desc}</p>
                </div>
              ))}
            </div>

            {/* Footer Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle size={15} className="text-emerald-400" />
                MIET Africa will notify you once your registration is reviewed.
              </div>
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5b54d6] to-[#4f9e8a] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolPendingApproval;