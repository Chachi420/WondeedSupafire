import { createClient } from './client'

/**
 * Typed RPC invocation for browser components.
 *
 * Works around @supabase/ssr@0.5's rpc generic inference: for functions
 * added after the initial type generation it resolves Args to `undefined`,
 * failing the build even though the runtime call is fine. This helper keeps
 * call sites type-safe. Runtime behavior is identical to supabase.rpc().
 */
export async function rpcCall<T>(
  fn: 'get_leaderboard' | 'get_clipper_season',
  args: Record<string, string>
): Promise<{ data: T | null; error: { message: string } | null }> {
  const supabase = createClient()
  const rpc = supabase.rpc as unknown as (
    f: string,
    a: Record<string, string>
  ) => Promise<{ data: T | null; error: { message: string } | null }>
  return rpc(fn, args)
}
