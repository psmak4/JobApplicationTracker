/**
 * Mock HTML fixtures for job parser unit tests
 * These simulate real job posting HTML from various platforms
 */

export const linkedInJobHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Software Engineer at Acme Corp | LinkedIn</title>
	<meta property="og:title" content="Software Engineer at Acme Corp" />
	<meta property="og:site_name" content="LinkedIn" />
	<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "JobPosting",
		"title": "Software Engineer",
		"hiringOrganization": {
			"@type": "Organization",
			"name": "Acme Corp"
		},
		"jobLocation": {
			"@type": "Place",
			"address": {
				"@type": "PostalAddress",
				"addressLocality": "San Francisco",
				"addressRegion": "CA"
			}
		}
	}
	</script>
</head>
<body>
	<div class="top-card-layout__title">Software Engineer</div>
	<div class="topcard__org-name-link">Acme Corp</div>
	<div class="topcard__flavor--bullet">San Francisco, CA</div>
	<div class="show-more-less-html__markup">
		<p>We are looking for a talented Software Engineer to join our team.</p>
		<p>This is a remote position with competitive salary.</p>
	</div>
</body>
</html>
`

export const indeedJobHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Senior Developer - TechStart Inc</title>
	<meta property="og:title" content="Senior Developer" />
</head>
<body>
	<h1 class="jobsearch-JobInfoHeader-title">Senior Developer</h1>
	<div data-company-name="true">TechStart Inc</div>
	<div data-testid="job-location">New York, NY</div>
	<div id="salaryInfoAndJobType">$150,000 - $180,000 a year</div>
	<div class="jobsearch-JobComponent-description">
		<p>Join our growing team as a Senior Developer.</p>
		<p>This is a hybrid position, 3 days in office.</p>
	</div>
</body>
</html>
`

export const glassdoorJobHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Product Manager at StartupXYZ | Glassdoor</title>
	<meta property="og:title" content="Product Manager at StartupXYZ" />
</head>
<body>
	<h1 data-test="job-title">Product Manager</h1>
	<div data-test="employer-name">StartupXYZ</div>
	<div data-test="job-location">Austin, TX</div>
	<div data-test="salary-estimate">$120K - $160K (Glassdoor est.)</div>
	<div class="JobDetails">
		<p>Looking for an experienced Product Manager.</p>
		<p>This is a fully remote position.</p>
	</div>
</body>
</html>
`

export const greenhouseJobHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Backend Engineer - CloudTech</title>
</head>
<body>
	<h1 class="app-title">Backend Engineer</h1>
	<span class="company-name">CloudTech</span>
	<div class="location">Seattle, WA</div>
	<div id="content">
		<p>We're hiring a Backend Engineer!</p>
		<p>On-site position in our Seattle office.</p>
	</div>
</body>
</html>
`

export const leverJobHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Frontend Developer - DesignCo</title>
</head>
<body>
	<div class="main-header-text-logo">DesignCo</div>
	<div class="posting-headline">
		<h2>Frontend Developer</h2>
	</div>
	<div class="posting-categories">
		<div class="posting-category">
			<span>Location:</span>
			<span class="posting-category-value">Remote - US</span>
		</div>
		<div class="posting-category">Remote Friendly</div>
	</div>
	<div class="posting-description">
		<p>Join our design-focused team as a Frontend Developer.</p>
	</div>
</body>
</html>
`

export const workdayJobHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Data Scientist - BigData Inc</title>
</head>
<body>
	<h2 data-automation-id="jobPostingHeader">Data Scientist</h2>
	<div data-automation-id="locations">Boston, MA</div>
	<div class="css-12hm4pa">BigData Inc</div>
	<div class="job-description">
		<p>Seeking a talented Data Scientist.</p>
		<p>Hybrid work arrangement available.</p>
	</div>
</body>
</html>
`

export const genericJobHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Marketing Manager - BrandCo</title>
	<meta property="og:title" content="Marketing Manager at BrandCo" />
	<meta property="og:site_name" content="BrandCo Careers" />
	<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "JobPosting",
		"title": "Marketing Manager",
		"hiringOrganization": {
			"@type": "Organization",
			"name": "BrandCo"
		},
		"jobLocation": {
			"@type": "Place",
			"address": {
				"@type": "PostalAddress",
				"addressLocality": "Chicago",
				"addressRegion": "IL"
			}
		},
		"baseSalary": {
			"@type": "MonetaryAmount",
			"value": {
				"@type": "QuantitativeValue",
				"value": 95000,
				"unitText": "YEAR"
			}
		}
	}
	</script>
</head>
<body>
	<h1 class="job-title">Marketing Manager</h1>
	<div class="company-name">BrandCo</div>
	<div class="location">Chicago, IL</div>
	<div class="salary">$90,000 - $100,000 per year</div>
	<div class="job-description">
		<p>BrandCo is looking for a Marketing Manager.</p>
		<p>This is an on-site position in our Chicago headquarters.</p>
	</div>
</body>
</html>
`

export const minimalJobHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Job Opening</title>
</head>
<body>
	<h1>We're Hiring!</h1>
	<p>Contact us for more details.</p>
</body>
</html>
`

export const schemaWithDirectSalaryValue = `
<!DOCTYPE html>
<html>
<head>
	<title>Engineer at TestCo</title>
	<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "JobPosting",
		"title": "Engineer",
		"hiringOrganization": {
			"@type": "Organization",
			"name": "TestCo"
		},
		"baseSalary": {
			"@type": "MonetaryAmount",
			"value": 120000,
			"unitText": "per year"
		}
	}
	</script>
</head>
<body>
	<h1>Engineer</h1>
</body>
</html>
`
