import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// For production on Render, you'd use a proper database
// This is a simple file-based counter for development
const COUNTER_FILE = join(process.cwd(), '.visitor-count');

function getCount(): number {
	try {
		if (existsSync(COUNTER_FILE)) {
			const data = readFileSync(COUNTER_FILE, 'utf-8');
			return parseInt(data, 10) || 0;
		}
	} catch {
		// Ignore errors
	}
	return 0;
}

function incrementCount(): number {
	const count = getCount() + 1;
	try {
		writeFileSync(COUNTER_FILE, count.toString());
	} catch {
		// Ignore write errors (read-only filesystem)
	}
	return count;
}

export const GET: RequestHandler = async ({ request }) => {
	// Check if this is a new visit (simple check via header)
	const isNewVisit = request.headers.get('x-increment') === 'true';

	let count: number;
	if (isNewVisit) {
		count = incrementCount();
	} else {
		count = getCount();
	}

	return json({ count }, {
		headers: {
			'Cache-Control': 'no-cache'
		}
	});
};

export const POST: RequestHandler = async () => {
	const count = incrementCount();
	return json({ count });
};
