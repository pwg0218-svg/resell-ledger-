import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

function Login({ onLogin }) {
    const [error, setError] = useState(null);

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // 사용자 이메일 확인 (보안 강화)
            // 본인 이메일만 허용하려면 아래 조건을 수정하세요.
            // if (user.email !== 'pwg0218@gmail.com') {
            //   alert('접근 권한이 없는 계정입니다.');
            //   await auth.signOut();
            //   return;
            // }

            onLogin(user);
        } catch (error) {
            console.error("Login failed", error);
            setError("로그인에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-white p-4">
            <div className="glass-panel p-8 max-w-md w-full flex flex-col items-center gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2" style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        리셀 관리 대장
                    </h1>
                    <p className="text-muted">관리자만 접근할 수 있습니다.</p>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-3 bg-white text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all w-full"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    Google 계정으로 로그인
                </button>

                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
            </div>
        </div>
    );
}

export default Login;
