import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { safeLocalStorage } from '@/lib/utils'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'theme-preference'

function getSystemTheme(): 'light' | 'dark' {
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
	const root = document.documentElement
	const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

	if (effectiveTheme === 'dark') {
		root.classList.add('dark')
	} else {
		root.classList.remove('dark')
	}
}

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(() => {
		const saved = safeLocalStorage.getItem(THEME_KEY)
		return (saved as Theme) || 'system'
	})

	// Apply theme on mount and when it changes
	useEffect(() => {
		applyTheme(theme)
		safeLocalStorage.setItem(THEME_KEY, theme)
	}, [theme])

	// Listen for system theme changes when in 'system' mode
	useEffect(() => {
		if (theme !== 'system') return

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = () => applyTheme('system')

		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [theme])

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="icon" aria-label="Toggle theme">
						<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					</Button>
				}
			/>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme('light')}>
					<Sun className="h-4 w-4 mr-2" />
					Light
					{theme === 'light' && <span className="ml-auto text-primary">✓</span>}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					<Moon className="h-4 w-4 mr-2" />
					Dark
					{theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					<Monitor className="h-4 w-4 mr-2" />
					System
					{theme === 'system' && <span className="ml-auto text-primary">✓</span>}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default ThemeToggle
