import { getTranslations } from 'next-intl/server'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  const tl = await getTranslations('Login')

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-feps-paper flex flex-col items-center pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-feps-surface border border-feps-border p-8 md:p-10">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[40px] w-[3px] bg-feps-ink"></div>
              <span className="font-mono text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">
                {tl('pageLabel')}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-normal text-feps-ink leading-tight mb-2">
              {tl('signIn')}
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-feps-ink-secondary">
              {tl('subtitle')}
            </p>
          </div>
          
          <LoginForm />
        </div>
        
        <p className="mt-8 text-center font-mono text-[0.65rem] uppercase tracking-widest text-feps-ink-tertiary">
          &copy; {new Date().getFullYear()} Faculty of Economics and Political Science
        </p>
      </div>
    </div>
  )
}
