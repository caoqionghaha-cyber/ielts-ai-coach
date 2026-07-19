"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("两次密码不一致"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "注册失败"); }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", username);
      window.location.href = "/";
    } catch (err) { setError(err instanceof Error ? err.message : "注册失败"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="IELTS AI Coach" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#2D3436]">IELTS AI Coach</h1>
          <p className="text-[#B2BEC3] text-sm mt-1">你的AI雅思写作伙伴</p>
        </div>
        <div className="bg-white rounded-[20px] p-8 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
          <h2 className="font-semibold text-[#2D3436] mb-6">创建账号</h2>
          {error && <div className="bg-[#FFF5F5] text-[#FF8A8A] rounded-2xl p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#636E72] mb-1 block">用户名</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 focus:border-[#8FD8B5] transition-all text-sm" placeholder="请输入用户名" required />
            </div>
            <div>
              <label className="text-sm font-medium text-[#636E72] mb-1 block">密码</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 focus:border-[#8FD8B5] transition-all text-sm" placeholder="至少3个字符" required />
            </div>
            <div>
              <label className="text-sm font-medium text-[#636E72] mb-1 block">确认密码</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-3 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 focus:border-[#8FD8B5] transition-all text-sm" placeholder="再次输入密码" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#8FD8B5] text-white py-3 rounded-[16px] font-semibold hover:bg-[#6BBF99] transition-all disabled:opacity-50">{loading ? "注册中..." : "注 册"}</button>
          </form>
          <p className="text-center text-sm text-[#B2BEC3] mt-6">已有账号？<Link href="/login" className="text-[#8FD8B5] hover:text-[#6BBF99] font-medium">登录</Link></p>
        </div>
      </div>
    </div>
  );
}
