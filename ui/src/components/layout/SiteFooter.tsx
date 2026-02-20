const SiteFooter = () => {
	return (
		<footer className="border-t py-6 bg-background">
			<div className="container mx-auto px-2 flex flex-col items-center justify-between gap-4 md:flex-row">
				<p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
					© {new Date().getFullYear()} Job Application Tracker. All rights reserved.
				</p>
			</div>
		</footer>
	)
}

export default SiteFooter
