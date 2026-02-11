import { Check } from 'lucide-react'
import { CLOSED_STATUSES, PIPELINE_STEPS, STATUS_ACCENT_COLORS } from '@/constants'
import type { ApplicationStatus } from '@/types'

interface StatusTimelineProps {
	status: ApplicationStatus
}

function getStepState(stepIndex: number, currentStepIndex: number): 'completed' | 'current' | 'upcoming' {
	if (stepIndex < currentStepIndex) return 'completed'
	if (stepIndex === currentStepIndex) return 'current'
	return 'upcoming'
}

export function StatusTimeline({ status }: StatusTimelineProps) {
	const accent = STATUS_ACCENT_COLORS[status]

	// Find which pipeline step the current status belongs to
	const currentStepIndex = PIPELINE_STEPS.findIndex((step) => step.statuses.includes(status))

	// For closed statuses, determine how far along the pipeline we got
	const isClosed = CLOSED_STATUSES.includes(status)
	const isPositiveClosed = status === 'Offer Accepted'

	// Get a label for the current status if it's a sub-status
	const statusLabel = status !== PIPELINE_STEPS[currentStepIndex]?.label ? status : undefined

	return (
		<div className="rounded-xl border bg-card p-4 sm:p-5">
			{/* Desktop/Tablet: horizontal timeline */}
			<div className="flex items-center gap-0">
				{PIPELINE_STEPS.map((step, index) => {
					const state = getStepState(index, currentStepIndex)

					return (
						<div key={step.key} className="flex items-center flex-1 last:flex-none">
							{/* Step circle + label */}
							<div className="flex flex-col items-center gap-1.5 relative">
								<div
									className={`
										w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold
										transition-all duration-300 shrink-0
										${
											state === 'completed'
												? `${accent.dot} text-white shadow-sm`
												: state === 'current'
													? `${accent.dot} text-white shadow-md ring-4 ring-offset-2 ring-offset-card ${
															isClosed && !isPositiveClosed
																? 'ring-muted-foreground/20'
																: accent.border.replace('border-', 'ring-')
														}`
													: 'bg-muted text-muted-foreground'
										}
									`}
								>
									{state === 'completed' ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
								</div>

								{/* Label */}
								<span
									className={`text-[11px] sm:text-xs font-medium whitespace-nowrap ${
										state === 'upcoming'
											? 'text-muted-foreground/60'
											: state === 'current'
												? 'text-foreground font-semibold'
												: 'text-muted-foreground'
									}`}
								>
									{step.label}
								</span>

								{/* Sub-status label for current step */}
								{state === 'current' && statusLabel && (
									<span className="text-[10px] sm:text-[11px] text-muted-foreground absolute -bottom-4 whitespace-nowrap">
										{statusLabel}
									</span>
								)}
							</div>

							{/* Connector line */}
							{index < PIPELINE_STEPS.length - 1 && (
								<div className="flex-1 mx-2 sm:mx-3">
									<div
										className={`h-0.5 rounded-full transition-all duration-300 ${
											state === 'completed' ? `${accent.dot} opacity-60` : 'bg-muted'
										}`}
									/>
								</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
