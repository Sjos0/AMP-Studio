/**
 * Middleware Supabase para refresh de sessão
 * Responsável por manter a sessão do usuário atualizada
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Não escreva código entre createServerClient e
  // supabase.auth.getUser(). Um simples erro pode fazer com que
  // seja muito difícil depurar problemas com usuários sendo
  // desconectados aleatoriamente.

  // IMPORTANT: Se você remover getUser() e usar server-side rendering
  // com o cliente Supabase, seus usuários podem ser desconectados aleatoriamente.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteção de rotas - redireciona para login se não autenticado
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Você DEVE retornar o objeto supabaseResponse como está.
  // Se você criar um novo objeto Response com NextResponse.next(), certifique-se de:
  // 1. Passar o request nele, assim:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copiar os cookies, assim:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Alterar o objeto myNewResponse conforme necessário, mas evite alterar os cookies!
  // 4. Finalmente:
  //    return myNewResponse
  // Se isso não for feito, você pode estar fazendo com que o browser e o servidor
  // fiquem fora de sincronia e terminem a sessão do usuário prematuramente!

  return supabaseResponse
}
