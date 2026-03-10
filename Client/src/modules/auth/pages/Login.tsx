import LoginForm from "@/modules/auth/components/LoginForm";
import LoginPoster from "@/modules/auth/components/LoginPoster";

export default function Login() {
  return (
    <>
      <div className="relative grid text-[#001631] w-full grid-cols-1 xl:grid-cols-2 min-h-screen md:justify-center bg-slate-50 dark:bg-[#020B1F]">
        {/* Patterned bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative hidden xl:flex flex-col p-10 justify-start">
          <img
            src="/warehouse.jpg"
            alt="Warehouse staff"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#001F3F]/62 shadow-[inset_0_0_220px_rgba(0,31,63,0.75)]" />
          <LoginPoster />
        </div>
        {/* Log In */}
        <div className="relative flex flex-col p-5 items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-2xl p-6 sm:p-8 dark:bg-[#071733]/90 dark:border-white/10">
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
}
