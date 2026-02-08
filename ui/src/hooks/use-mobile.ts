import * as React from 'react'

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export type ViewportSize = 'mobile' | 'tablet' | 'desktop'

export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

	React.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
		}
		mql.addEventListener('change', onChange)
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
		return () => mql.removeEventListener('change', onChange)
	}, [])

	return !!isMobile
}

export function useViewportSize(): ViewportSize {
	const [size, setSize] = React.useState<ViewportSize>('desktop')

	React.useEffect(() => {
		const updateSize = () => {
			const width = window.innerWidth
			if (width < MOBILE_BREAKPOINT) {
				setSize('mobile')
			} else if (width < TABLET_BREAKPOINT) {
				setSize('tablet')
			} else {
				setSize('desktop')
			}
		}

		// Set initial value
		updateSize()

		// Listen for resize
		window.addEventListener('resize', updateSize)
		return () => window.removeEventListener('resize', updateSize)
	}, [])

	return size
}
