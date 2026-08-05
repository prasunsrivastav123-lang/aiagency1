// app/dashboard/calling/layout.js
//
// Layout shell for the Calling module. Only wraps the page in the dark,
// purple-toned background used across the dashboard's premium surfaces —
// no logic, no data fetching.

export const metadata = {
  title: 'Calling · AgencyOS AI',
}

export default function CallingLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[#0A0A12] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[32rem] w-[32rem] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-700/15 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[24rem] w-[24rem] rounded-full bg-indigo-700/10 blur-[120px]" />
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}
