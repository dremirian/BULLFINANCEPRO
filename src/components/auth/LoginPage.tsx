import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, Shield, BarChart3 } from 'lucide-react';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f1a] via-[#0a3d2c] to-[#08150f] relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c8a35f]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#c8a35f]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0d4d38]/30 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMDAsMTYzLDk1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img
                src="/bullfinance-removebg-preview.png"
                alt="Bull Finance"
                className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#c8a35f] via-[#d4b066] to-[#c8a35f] bg-clip-text text-transparent animate-pulse">
            BULL FINANCE
          </h1>

          <p className="text-gray-400 text-sm sm:text-base md:text-lg font-medium mb-2">
            Gestão Financeira Profissional
          </p>

          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield size={16} className="text-[#c8a35f]" />
              <span>100% Seguro</span>
            </div>
            <div className="h-4 w-px bg-gray-700"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <BarChart3 size={16} className="text-[#c8a35f]" />
              <span>Controle Total</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#c8a35f]/20 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {isLogin ? 'Bem-vindo de volta!' : 'Criar conta'}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                {isLogin
                  ? 'Entre com suas credenciais para continuar'
                  : 'Preencha os dados para começar'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#c8a35f] transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-[#c8a35f] focus:border-[#c8a35f] outline-none transition-all text-white placeholder-gray-500"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#c8a35f] transition-colors" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-[#c8a35f] focus:border-[#c8a35f] outline-none transition-all text-white placeholder-gray-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="rounded border-gray-600 bg-gray-800 text-[#c8a35f] focus:ring-[#c8a35f] cursor-pointer"
                    />
                    <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Lembrar-me</span>
                  </label>
                  <button
                    type="button"
                    className="text-[#c8a35f] hover:text-[#d4b066] font-semibold transition-colors"
                  >
                    Esqueci a senha
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-900/30 border-2 border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#c8a35f] via-[#d4b066] to-[#c8a35f] text-gray-900 font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(200,163,95,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5 hover:scale-[1.02] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-400 hover:text-[#c8a35f] font-medium transition-colors text-sm sm:text-base"
              >
                {isLogin ? (
                  <>
                    Não tem conta? <span className="text-[#c8a35f] font-bold">Cadastre-se</span>
                  </>
                ) : (
                  <>
                    Já tem conta? <span className="text-[#c8a35f] font-bold">Entrar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-8 md:px-10 py-4 bg-gradient-to-r from-[#c8a35f]/10 via-[#d4b066]/10 to-[#c8a35f]/10 border-t border-[#c8a35f]/20">
            <p className="text-center text-xs sm:text-sm text-gray-400">
              Sistema completo de gestão financeira empresarial
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500 space-y-2 px-4">
          <p>© 2025 Bull Finance. Todos os direitos reservados.</p>
          <p>
            Idealizado por{' '}
            <a
              href="https://www.linkedin.com/in/vanessaazuos/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c8a35f] hover:text-[#d4b066] font-semibold transition-colors"
            >
              Vanessa Dias
            </a>
            {' | '}
            Desenvolvido por{' '}
            <a
              href="https://www.linkedin.com/in/andressamirian/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c8a35f] hover:text-[#d4b066] font-semibold transition-colors"
            >
              Andressa Mirian
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
