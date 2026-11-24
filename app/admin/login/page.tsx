import { login } from "@/app/actions";
export default function Login({ searchParams }: { searchParams: { error?: string } }) {
  return (<form action={login} className="max-w-sm mx-auto space-y-3 mt-10"><h1 className="text-2xl font-bold">Admin sign in</h1>
    {searchParams.error && <p className="card">{searchParams.error}</p>}
    <input name="email" type="email" required placeholder="Email" className="inp" autoComplete="email" />
    <input name="password" type="password" required placeholder="Password" className="inp" autoComplete="current-password" />
    <button className="btn w-full">Sign in</button></form>);
}
