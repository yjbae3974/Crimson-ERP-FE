import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/queries/useLogin';
import { useSignup } from '../../hooks/queries/useSignup';
import { useAuthStore } from '../../store/authStore';

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

    // 로그인 폼 상태
    const [loginId, setLoginId] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // 회원가입 폼 상태
    const [signupUsername, setSignupUsername] = useState('');
    const [signupFullName, setSignupFullName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupContact, setSignupContact] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const loginStore = useAuthStore((state) => state.login);

    const loginMutation = useLogin((userData) => {
        alert('로그인 성공!');

        // API에서 받은 실제 사용자 정보를 저장
        const mappedUserData = {
            id: userData.id,
            username: userData.username,
            role: userData.role === 'MANAGER' ? '대표' : ('일반 사용자' as '대표' | '일반 사용자'),
        };

        loginStore(mappedUserData);
        navigate('/');
    });

    const signupMutation = useSignup(
        () => {
            alert('회원가입 성공! 로그인해주세요.');
            setActiveTab('login'); // 로그인 탭으로 전환
            // 회원가입 폼 초기화
            setSignupUsername('');
            setSignupFullName('');
            setSignupEmail('');
            setSignupContact('');
            setSignupPassword('');
            setConfirmPassword('');
        },
        (msg) => setErrorMessage(msg)
    );

    const handleLogin = () => {
        setErrorMessage(''); // 초기화

        loginMutation.mutate(
            { username: loginId, password: loginPassword },
            {
                onError: (err: any) => {
                    const msg = err?.response?.data?.message ?? '로그인 실패';
                    setErrorMessage(msg);
                },
            }
        );
    };

    // 키보드 접근성 처리
    const handleLoginKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && loginId && loginPassword && !loginMutation.isPending) {
            handleLogin();
        }
    };

    const handleSignupKeyPress = (e: React.KeyboardEvent) => {
        if (
            e.key === 'Enter' &&
            signupUsername &&
            signupFullName &&
            signupEmail &&
            signupContact &&
            signupPassword &&
            confirmPassword &&
            signupPassword === confirmPassword &&
            !signupMutation.isPending
        ) {
            handleSignup();
        }
    };

    const handleSignup = () => {
        setErrorMessage(''); // 초기화

        // 비밀번호 확인 검증
        if (signupPassword !== confirmPassword) {
            setErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 필수 필드 검증
        if (!signupUsername || !signupFullName || !signupEmail || !signupContact || !signupPassword) {
            setErrorMessage('모든 필수 항목을 입력해주세요.');
            return;
        }

        signupMutation.mutate({
            username: signupUsername,
            first_name: signupFullName,
            email: signupEmail,
            contact: signupContact,
            password: signupPassword,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* 헤더 섹션 */}
                <div className="bg-gradient-to-r from-rose-800 to-rose-900 px-8 py-6 text-center">
                    <img
                        src="/images/crimsonlogo.png"
                        alt="크림슨스토어 로고"
                        className="w-24 h-24 mx-auto mb-4 object-cover rounded-full bg-white p-0.5"
                    />
                    <h1 className="text-white text-xl font-bold">크림슨스토어 ERP</h1>
                </div>

                <div className="p-8">
                    {/* 탭 메뉴 */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                            onClick={() => {
                                setActiveTab('login');
                                setErrorMessage('');
                            }}
                            className={`flex-1 py-2.5 text-center font-medium rounded-md transition-all duration-200 ${
                                activeTab === 'login'
                                    ? 'bg-white text-rose-800 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            로그인
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('signup');
                                setErrorMessage('');
                            }}
                            className={`flex-1 py-2.5 text-center font-medium rounded-md transition-all duration-200 ${
                                activeTab === 'signup'
                                    ? 'bg-white text-rose-800 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            회원가입
                        </button>
                    </div>

                    {/* 로그인 폼 */}
                    {activeTab === 'login' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="loginId" className="block text-sm font-medium text-gray-700 mb-2">
                                        아이디
                                    </label>
                                    <input
                                        id="loginId"
                                        type="text"
                                        placeholder="아이디를 입력하세요"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="loginPassword"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        비밀번호
                                    </label>
                                    <input
                                        id="loginPassword"
                                        type="password"
                                        placeholder="비밀번호를 입력하세요"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        onKeyPress={handleLoginKeyPress}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loginMutation.isPending || !loginId || !loginPassword}
                                className="w-full py-3 mt-6 bg-gradient-to-r from-rose-800 to-rose-900 text-white font-medium rounded-lg hover:from-rose-900 hover:to-rose-950 focus:ring-4 focus:ring-rose-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {loginMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        로그인 중...
                                    </div>
                                ) : (
                                    '로그인'
                                )}
                            </button>
                        </div>
                    )}

                    {/* 회원가입 폼 */}
                    {activeTab === 'signup' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="signupUsername"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        사용자 아이디
                                    </label>
                                    <input
                                        id="signupUsername"
                                        type="text"
                                        placeholder="사용자 아이디를 입력하세요"
                                        value={signupUsername}
                                        onChange={(e) => setSignupUsername(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="signupFullName"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        이름
                                    </label>
                                    <input
                                        id="signupFullName"
                                        type="text"
                                        placeholder="이름을 입력하세요"
                                        value={signupFullName}
                                        onChange={(e) => setSignupFullName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="signupEmail"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        이메일
                                    </label>
                                    <input
                                        id="signupEmail"
                                        type="email"
                                        placeholder="이메일 주소를 입력하세요"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="signupContact"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        전화번호
                                    </label>
                                    <input
                                        id="signupContact"
                                        type="text"
                                        placeholder="전화번호를 입력하세요"
                                        value={signupContact}
                                        onChange={(e) => setSignupContact(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="signupPassword"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        비밀번호
                                    </label>
                                    <input
                                        id="signupPassword"
                                        type="password"
                                        placeholder="비밀번호를 입력하세요"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        비밀번호 확인
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="비밀번호를 다시 입력하세요"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onKeyPress={handleSignupKeyPress}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 ${
                                            confirmPassword && signupPassword !== confirmPassword
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-rose-500 focus:border-rose-500'
                                        }`}
                                    />
                                    {confirmPassword && signupPassword !== confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다.</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSignup}
                                disabled={
                                    signupMutation.isPending ||
                                    !signupUsername ||
                                    !signupFullName ||
                                    !signupContact ||
                                    !signupEmail ||
                                    !signupPassword ||
                                    !confirmPassword ||
                                    signupPassword !== confirmPassword
                                }
                                className="w-full py-3 mt-6 bg-gradient-to-r from-rose-800 to-rose-900 text-white font-medium rounded-lg hover:from-rose-900 hover:to-rose-950 focus:ring-4 focus:ring-rose-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {signupMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        회원가입 중...
                                    </div>
                                ) : (
                                    '회원가입'
                                )}
                            </button>
                        </div>
                    )}

                    {/* 에러 메시지 */}
                    {errorMessage && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 푸터 */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">© 2025 크림슨스토어. All Rights Reserved.</p>
            </div>
        </div>
    );
};

export default AuthPage;
