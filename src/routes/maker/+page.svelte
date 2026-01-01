<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { siteConfig } from '$lib/config';

	interface GitHubRepo {
		name: string;
		html_url: string;
		description: string;
		updated_at: string;
	}

	let repos = $state<GitHubRepo[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const GITHUB_USERNAME = 'cosineFox';

	const projects = [
		{ slug: 'audio-esp-dac', title: 'Audio ESP DAC', description: 'ESP32-based digital-to-analog converter.', status: 'Planned' },
		{ slug: 'computer-museum', title: 'Computer Museum', description: 'Documentation of vintage computing hardware.', status: 'Planned' },
		{ slug: 'yuuna-chan-bot', title: 'Yuuna-chan Bot', description: 'Discord utility bot.', status: 'Planned' },
		{ slug: 'canvas-labworks', title: 'Canvas Labworks', description: 'This website system.', status: 'Planned' },
		{ slug: 'dashboard', title: 'Weather Dashboard', description: 'Meteorological data visualization.', status: 'Live', link: '/maker/dashboard' }
	];

	async function fetchGitHubRepos() {
		loading = true;
		error = null;
		try {
			const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`);
			if (!res.ok) throw new Error(`GitHub Error: ${res.status}`);
			repos = await res.json();
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(() => { if (browser) fetchGitHubRepos(); });
</script>

<svelte:head>
	<title>Canvas Labworks - Maker</title>
</svelte:head>

<div class="page">
	<div class="main-container">
		<header class="header">
			<h1 class="title">MAKER SPACE</h1>
			<p class="subtitle">Hardware, Software & Experiments</p>
		</header>

		<nav class="nav">
			<a href="/main" class="nav-link">HOME</a>
			<a href="/imageworks" class="nav-link">IMAGEWORKS</a>
			<a href="/maker" class="nav-link active">MAKER</a>
		</nav>

		<div class="content">
			<section class="section">
				<div class="section-header">PROJECT_INDEX</div>
				<div class="section-body">
					<ul class="project-list">
						{#each projects as p}
							<li>
								<div class="breadcrumb">maker / {p.slug}</div>
								<div class="project-details">
									{#if p.link}
										<a href={p.link} class="project-link"><strong>{p.title}</strong></a>
									{:else}
										<span class="project-title-static">{p.title}</span>
									{/if}
									<span class="separator">-</span> 
									<span class="desc">{p.description}</span>
									<span class="status" class:live={p.status === 'Live'}>[{p.status.toUpperCase()}]</span>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			</section>

			<section class="section">
				<div class="section-header">SOURCE_CODE (GITHUB)</div>
				<div class="section-body">
					{#if loading} <p class="blink">SCANNING_REPOSITORIES...</p>
					{:else if error}
						<div class="error-box">
							<p>ERROR: {error}</p>
							<a href="https://github.com/{GITHUB_USERNAME}" target="_blank">VIEW ON GITHUB.COM</a>
						</div>
					{:else}
						<ul class="repo-list">
							{#each repos as repo}
								<li>
									<a href={repo.html_url} target="_blank">{repo.name}</a> 
									<span class="repo-desc">{repo.description || 'No description available'}</span>
									<span class="repo-date">{new Date(repo.updated_at).toLocaleDateString()}</span>
								</li>
							{/each}
						</ul>
					{/if}
					<p class="github-link-footer"><a href="https://github.com/{GITHUB_USERNAME}">VIEW ALL ON GITHUB &rarr;</a></p>
				</div>
			</section>

			<footer class="footer">
				<p>&copy; 2024 CLEMENT. <a href="mailto:{siteConfig.email}">CONTACT</a></p>
			</footer>
		</div>
	</div>
</div>

<style>
	.page { min-height: 100vh; background: #000; color: #fff; font-family: 'Courier New', monospace; font-size: 18px; display: flex; flex-direction: column; align-items: center; padding: 20px 0; }
	.main-container { width: 100%; max-width: 1000px; background: #000; border: 2px solid #fff; }
	.header { text-align: center; padding: 30px 20px; border-bottom: 2px solid #fff; }
	.title { font-size: 42px; margin: 0; letter-spacing: 4px; line-height: 1; font-weight: bold; text-transform: uppercase; }
	.subtitle { color: #fff; margin-top: 10px; font-size: 18px; font-style: italic; }
	.nav { display: flex; border-bottom: 2px solid #fff; }
	.nav-link { color: #fff; background: #000; padding: 20px; border-right: 2px solid #fff; font-weight: bold; font-size: 20px; text-transform: uppercase; flex: 1; text-align: center; transition: all 0.2s; }
	.nav-link:last-child { border-right: none; }
	.nav-link:hover, .nav-link.active { color: #000 !important; background: #fff !important; }
	.content { display: grid; grid-template-columns: 1fr; gap: 0; background: #000; }
	.section { background: #000; display: flex; flex-direction: column; margin: 0; outline: 1px solid #fff; }
	.section-header { padding: 12px 15px; font-weight: bold; border-bottom: 1px solid #fff; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; background: #fff; color: #000; }
	.section-body { padding: 20px; background: #000; flex: 1; }
	.project-list { list-style: none; padding: 0; }
	.project-list li { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #333; }
	.project-list li:last-child { border-bottom: none; }
	.breadcrumb { font-size: 16px; color: #fff; margin-bottom: 4px; text-transform: lowercase; }
	.project-details { display: flex; align-items: baseline; gap: 15px; flex-wrap: wrap; }
	.project-link strong { font-size: 24px; color: #fff; text-decoration: underline; }
	.project-link strong:hover { background: #fff; color: #000; }
	.project-title-static { font-size: 24px; font-weight: bold; color: #fff; }
	.desc { color: #fff; line-height: 1.4; }
	.status { font-size: 16px; color: #fff; margin-left: auto; }
	.status.live { font-weight: bold; color: #0f0; }
	.repo-list { list-style: none; padding: 0; }
	.repo-list li { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; padding: 5px 0; border-bottom: 1px solid #111; }
	.repo-list li a { color: #fff; text-decoration: underline; font-weight: bold; }
	.repo-list li a:hover { background: #fff; color: #000; }
	.repo-desc { color: #fff; font-size: 16px; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.repo-date { color: #fff; font-size: 16px; font-family: monospace; }
	.github-link-footer { margin-top: 15px; font-size: 18px; text-align: center; }
	.github-link-footer a { color: #fff; text-decoration: underline; }
	.github-link-footer a:hover { background: #fff; color: #000; }
	.error-box { border: 1px solid #ff3333; padding: 20px; color: #ff3333; text-align: center; }
	.error-box a { color: #fff; margin-top: 10px; display: block; }
	.footer { padding: 20px; text-align: center; font-size: 16px; color: #fff; border-top: 1px solid #fff; }
	.footer a:hover { background: #fff; color: #000; }
	.blink { animation: blink 1s step-end infinite; }
	@keyframes blink { 50% { opacity: 0; } }
	/* Tablet */
	@media (max-width: 768px) {
		.title { font-size: 32px; }
		.nav-link { font-size: 16px; padding: 15px; }
		.project-details { gap: 10px; }
		.project-link strong, .project-title-static { font-size: 20px; }
	}

	/* Mobile */
	@media (max-width: 600px) {
		.page { padding: 10px 0; }
		.main-container { border-width: 1px; }
		.header { padding: 20px 15px; }
		.title { font-size: 24px; letter-spacing: 2px; }
		.subtitle { font-size: 14px; margin-top: 8px; }
		.nav-link { padding: 12px 8px; font-size: 14px; }
		.section-header { padding: 10px 12px; font-size: 14px; }
		.section-body { padding: 15px; }
		.breadcrumb { font-size: 12px; }
		.project-details { flex-direction: column; align-items: flex-start; gap: 5px; }
		.project-link strong, .project-title-static { font-size: 18px; }
		.desc { font-size: 14px; }
		.status { margin-left: 0; font-size: 14px; }
		.separator { display: none; }
		.repo-list li { flex-direction: column; align-items: flex-start; gap: 5px; }
		.repo-desc { white-space: normal; font-size: 14px; }
		.repo-date { font-size: 12px; }
		.github-link-footer { font-size: 14px; }
		.footer { padding: 15px; font-size: 14px; }
	}

	/* Small mobile */
	@media (max-width: 400px) {
		.title { font-size: 20px; letter-spacing: 1px; }
		.nav-link { padding: 10px 5px; font-size: 12px; }
		.project-link strong, .project-title-static { font-size: 16px; }
		.desc { font-size: 12px; }
	}
</style>
