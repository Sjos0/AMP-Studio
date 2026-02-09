import { LoginForm } from '@/components/LoginForm'

/**
 * Página de Login
 * Permite autenticação com email/senha via Supabase Auth
 * Design dark mode com glassmorphism seguindo padrão do projeto
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0a]">
      {/* Logo/Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          AMP Studio
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Seu assistente inteligente
        </p>
      </div>
      
      <LoginForm />
      
      {/* Footer */}
      <p className="mt-8 text-xs text-white/40 text-center">
        Ao entrar, você concorda com nossos{' '}
        <a href="#" className="underline hover:text-white/60">
          Termos de Uso
        </a>{' '}
        e{' '}
        <a href="#" className="underline hover:text-white/60">
          Política de Privacidade
        </a>
      </p>
    </main>
  )
}
