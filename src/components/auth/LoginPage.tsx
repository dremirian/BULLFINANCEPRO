import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, TrendingUp, Shield, BarChart3, DollarSign, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#c8a35f]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0a3d2c]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#c8a35f]/5 to-[#0a3d2c]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <img
                src="/bullfinance-removebg-preview.png"
                alt="Bull Finance"
                className="h-20 w-20 object-contain drop-shadow-lg"
              />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0a3d2c] to-[#0d4d38] bg-clip-text text-transparent">
                  BULL FINANCE
                </h1>
                <p className="text-sm text-gray-600 font-medium">Gestão Financeira Profissional</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c8a35f]/10 rounded-full">
                <Sparkles className="text-[#c8a35f]" size={16} />
                <span className="text-sm font-semibold text-[#0a3d2c]">Plataforma Completa de Gestão</span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Transforme a gestão<br />
                <span className="bg-gradient-to-r from-[#c8a35f] to-[#d4b066] bg-clip-text text-transparent">
                  financeira
                </span> do seu<br />
                negócio
              </h2>

              <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                Controle completo de receitas, despesas e fluxo de caixa em uma única plataforma inteligente e segura.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto lg:mx-0">
              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-[#c8a35f]/30 transition-all hover:shadow-lg group">
                <div className="p-3 bg-gradient-to-br from-[#c8a35f] to-[#d4b066] rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Análises Avançadas</h3>
                  <p className="text-sm text-gray-600">Relatórios detalhados e insights estratégicos</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-[#c8a35f]/30 transition-all hover:shadow-lg group">
                <div className="p-3 bg-gradient-to-br from-[#0a3d2c] to-[#0d4d38] rounded-xl group-hover:scale-110 transition-transform">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">100% Seguro</h3>
                  <p className="text-sm text-gray-600">Dados protegidos e criptografados</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-[#c8a35f]/30 transition-all hover:shadow-lg group">
                <div className="p-3 bg-gradient-to-br from-[#c8a35f] to-[#d4b066] rounded-xl group-hover:scale-110 transition-transform">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Dashboards Intuitivos</h3>
                  <p className="text-sm text-gray-600">Visualize seus dados facilmente</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-[#c8a35f]/30 transition-all hover:shadow-lg group">
                <div className="p-3 bg-gradient-to-br from-[#0a3d2c] to-[#0d4d38] rounded-xl group-hover:scale-110 transition-transform">
                  <DollarSign className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Controle Total</h3>
                  <p className="text-sm text-gray-600">Gerencie todas as finanças em um só lugar</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 pt-8 border-t border-gray-200">
              <p className="font-medium">© 2025 Bull Finance. Todos os direitos reservados.</p>
              <p className="mt-2">
                Idealizado por{' '}
                <a
                  href="https://www.linkedin.com/in/vanessaazuos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c8a35f] hover:text-[#d4b066] font-semibold transition-colors underline decoration-dotted"
                >
                  Vanessa Dias
                </a>
                {' | '}
                Desenvolvido por{' '}
                <a
                  href="https://www.linkedin.com/in/andressamirian/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c8a35f] hover:text-[#d4b066] font-semibold transition-colors underline decoration-dotted"
                >
                  Andressa Mirian
                </a>
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-200/50 max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Bem-vindo de volta!' : 'Criar conta'}
                </h2>
                <p className="text-gray-600">
                  {isLogin
                    ? 'Entre com suas credenciais para continuar'
                    : 'Preencha os dados para começar'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c8a35f] focus:border-[#c8a35f] outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c8a35f] focus:border-[#c8a35f] outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="rounded border-gray-300 text-[#c8a35f] focus:ring-[#c8a35f] cursor-pointer" />
                      <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Lembrar-me</span>
                    </label>
                    <button type="button" className="text-[#c8a35f] hover:text-[#b8934f] font-semibold transition-colors">
                      Esqueci a senha
                    </button>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0a3d2c] to-[#0d4d38] text-white font-bold py-4 rounded-xl hover:from-[#0d4d38] hover:to-[#0a3d2c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
                  className="text-gray-600 hover:text-[#c8a35f] font-medium transition-colors"
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

            <div className="mt-6 text-center text-sm text-gray-500">
              <p className="font-medium">Sistema completo de gestão financeira empresarial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
