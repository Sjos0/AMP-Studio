import { LoginForm } from '@/components/LoginForm'

/**
 * Página de Login
 * Permite autenticação com email/senha via Supabase Auth
 * Design com paleta azul e branco seguindo padrão do AMP Studio
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      {/* Logo/Brand */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          AMP Studio
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Seu assistente inteligente
        </p>
      </div>
      
      <LoginForm />
      
      {/* Footer */}
      <p className="mt-8 text-xs text-gray-400 text-center">
        Ao entrar, você concorda com nossos{' '}
        <a href="#" className="underline hover:text-blue-600">
          Termos de Uso
        </a>{' '}
        e{' '}
        <a href="#" className="underline hover:text-blue-600">
          Política de Privacidade
        </a>
      </p>
    </main>
  )
}
