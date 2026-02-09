'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

/**
 * Componente de formulário de login
 * Suporta login com email/senha e criação de conta
 * Design com glassmorphism seguindo padrão do projeto
 */
export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          setMessage('Conta criada! Verifique seu email para confirmar.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          router.push('/')
          router.refresh()
        }
      }
    } catch {
      setError('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>{isSignUp ? 'Criar Conta' : 'Entrar'}</CardTitle>
        <CardDescription>
          {isSignUp
            ? 'Crie sua conta para começar'
            : 'Entre com suas credenciais'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              {!isSignUp && (
                <button
                  type="button"
                  className="text-xs text-white/60 hover:text-white/80 underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-md">
              {message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                {isSignUp ? 'Criando conta...' : 'Entrando...'}
              </>
            ) : isSignUp ? (
              'Criar conta'
            ) : (
              'Entrar'
            )}
          </Button>

          <div className="text-center text-sm text-white/60">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
              className="hover:text-white/80 underline-offset-4 hover:underline"
            >
              {isSignUp
                ? 'Já tem uma conta? Entre'
                : 'Não tem uma conta? Crie uma'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
