import { jobParser } from '../services/jobParser'

async function testParser() {
	console.log('🧪 Testing Job Parser\n')
	console.log('='.repeat(60))

	const testUrls = [
		'https://www.linkedin.com/jobs/view/12345',
		'https://www.indeed.com/viewjob?jk=abc123',
		'https://careers.google.com/jobs/results/12345',
		'https://jobs.lever.co/company/job-id',
		'https://apply.workable.com/company/j/job-id',
		'https://example.com/not-a-job', // Should fail
		'https://google.com', // Should fail
	]

	for (const url of testUrls) {
		console.log(`\nTesting: ${url}`)
		console.log('-'.repeat(60))

		try {
			const result = await jobParser.parse(url)

			if (result.success) {
				console.log('✓ Success')
				console.log(`Confidence: ${result.data?.confidence}`)
				console.log('Extracted data:')
				console.log(JSON.stringify(result.data, null, 2))
			} else {
				console.log('✗ Failed')
				console.log(`Error: ${result.error}`)
			}
		} catch (error) {
			console.log('✗ Exception')
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			console.log(`Error: ${errorMessage}`)
		}
	}

	console.log('\n' + '='.repeat(60))
	console.log('✅ Parser tests complete\n')
}

testParser().catch(console.error)
