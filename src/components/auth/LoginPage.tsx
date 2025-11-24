import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, TrendingUp, Shield, BarChart3, DollarSign } from 'lucide-react';

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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a3d2c] via-[#0d4d38] to-[#0a3d2c] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#c8a35f]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#c8a35f]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <img
              src="/bullfinance-removebg-preview.png"
              alt="Bull Finance"
              className="h-30 w-30 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#c8a35f]">BULL FINANCE</h1>
              <p className="text-sm text-gray-300">Gestão Financeira Profissional</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Transforme a gestão<br />
                financeira do seu<br />
                negócio
              </h2>
              <p className="text-lg text-gray-300">
                Controle completo de receitas, despesas e fluxo de caixa em uma única plataforma.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#c8a35f]/20 rounded-lg">
                  <TrendingUp className="text-[#c8a35f]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Análises Avançadas</h3>
                  <p className="text-sm text-gray-400">Relatórios detalhados e insights estratégicos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#c8a35f]/20 rounded-lg">
                  <Shield className="text-[#c8a35f]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">100% Seguro</h3>
                  <p className="text-sm text-gray-400">Dados protegidos e criptografados</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#c8a35f]/20 rounded-lg">
                  <BarChart3 className="text-[#c8a35f]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Dashboards Intuitivos</h3>
                  <p className="text-sm text-gray-400">Visualize seus dados facilmente</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#c8a35f]/20 rounded-lg">
                  <DollarSign className="text-[#c8a35f]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Controle Total</h3>
                  <p className="text-sm text-gray-400">Gerencie todas as finanças em um só lugar</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <p>© 2025 Bull Finance. Todos os direitos reservados.</p>
            <p className="mt-1">
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

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <img
              src="/bullfinance-removebg-preview.png"
              alt="Bull Finance"
              className="h-16 w-16 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-[#0a3d2c]">BULL FINANCE</h1>
            <p className="text-gray-600">Gestão Financeira Profissional</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
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
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c8a35f] focus:border-[#c8a35f] outline-none transition-all"
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c8a35f] focus:border-[#c8a35f] outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-[#c8a35f] focus:ring-[#c8a35f]" />
                    <span className="text-gray-600">Lembrar-me</span>
                  </label>
                  <button type="button" className="text-[#c8a35f] hover:text-[#b8934f] font-medium">
                    Esqueci a senha
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white font-bold py-4 rounded-xl hover:from-[#b8934f] hover:to-[#c4a056] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
            <p>Sistema completo de gestão financeira empresarial</p>
          </div>
        </div>
      </div>
    </div>
  );
}
