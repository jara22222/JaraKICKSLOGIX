import LoginForm from "@/modules/auth/components/LoginForm";
import LoginPoster from "@/modules/auth/components/LoginPoster";



export default function Login() {
  return (
    <>
      <div className="grid text-[#001631] w-full grid-cols-1 xl:grid-cols-2 h-screen md:justify-center">
        {/* Patterned bg */}
        <div
          className="absolute inset-0 opacity-[0.03] invert pointer-events-none" // <--- Added here
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        />
        <div className="bg-[#001631] hidden xl:flex flex-col p-10 gap-10 justify-center">
          <LoginPoster />
        </div>
        {/* Log In */}
        <div className="flex flex-col p-5 items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
