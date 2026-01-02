<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { siteConfig } from '$lib/config';
	import { globalState, shouldFetch, updateFetchTime } from '$lib/state.svelte';

	// State
	let loading = $state(false);

	const HANDLE = siteConfig.blueskyHandle;
	const HASHTAG = '#photography';
	const STATUS_CAFE_USER = siteConfig.statusCafeUser;

	async function fetchStatus() {
		if (!shouldFetch('status')) return;
		try {
			const res = await fetch(`https://status.cafe/users/${STATUS_CAFE_USER}/status.json`);
			if (res.ok) {
				const data = await res.json();
				globalState.status = data;
				const content = data.content.toLowerCase();
				if (content.includes('not open for shoots')) globalState.isOpenForShoots = false;
				else if (content.includes('open for shoots')) globalState.isOpenForShoots = true;
				updateFetchTime('status');
			}
		} catch (e) { console.error('Status Error:', e); }
	}

	async function fetchPhotos() {
		if (!shouldFetch('bluesky')) return;
		loading = true;
		try {
			const res = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${HANDLE}&limit=50`);
			if (!res.ok) throw new Error('API ERROR');
			const data = await res.json();
			
			const mapPost = (item: any) => {
				const imageSet = new Set<string>();
				const embed = item.post.embed;
				
				if (embed?.images) {
					embed.images.forEach((img: any) => { if (img.thumb) imageSet.add(img.thumb); });
				} else if (embed?.$type === 'app.bsky.embed.images#view') {
					embed.images?.forEach((img: any) => { if (img.thumb) imageSet.add(img.thumb); });
				} else if (embed?.$type === 'app.bsky.embed.recordWithMedia#view' && embed.media?.images) {
					embed.media.images.forEach((img: any) => { if (img.thumb) imageSet.add(img.thumb); });
				}
				
				return { 
					id: item.post.cid, 
					text: item.post.record?.text || '', 
					createdAt: item.post.record?.createdAt, 
					likes: item.post.likeCount || 0, 
					images: Array.from(imageSet)
				};
			};

			globalState.blueskyPosts = data.feed.map(mapPost);
			updateFetchTime('bluesky');
		} catch (e) { console.error('Archive Error:', e); } finally { loading = false; }
	}

	// Filtered view for Imageworks
	const photos = $derived(globalState.blueskyPosts
		.filter(p => p.text.toLowerCase().includes(HASHTAG))
		.map(p => ({
			id: p.id,
			src: p.images[0], // First image as representative
			alt: p.text.replace(HASHTAG, '').trim(),
			date: new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit' })
		}))
	);

	onMount(() => {
		if (browser) { fetchStatus(); fetchPhotos(); }
	});
</script>

<svelte:head>
	<title>Canvas Labworks - Imageworks</title>
</svelte:head>

<div class="page">
	<div class="main-container">
		<header class="header">
			<h1 class="title">CANVAS IMAGEWORKS</h1>
			<p class="subtitle">A visual journal of captured moments and personal observations.</p>
		</header>

		<nav class="nav">
			<a href="/main" class="nav-link">HOME</a>
			<a href="/imageworks" class="nav-link active">IMAGEWORKS</a>
			<a href="/maker" class="nav-link">MAKER</a>
		</nav>

		<div class="content">
			<div class="booking-notice">
				<div class="booking-row">
					<div class="booking-text">
						{#if globalState.isOpenForShoots}
							{siteConfig.commissionMsg} &rarr; <a href="mailto:{siteConfig.email}" class="highlight-link">ENQUIRE_NOW</a>
						{:else}
							<span class="closed">{siteConfig.closedMsg}</span>
						{/if}
					</div>
				</div>
				<div class="social-row">
					FOLLOW FOR UPDATES: <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" class="highlight-link">{siteConfig.instagram}</a>
				</div>
			</div>

			<main class="gallery">
				{#if (loading && globalState.blueskyPosts.length === 0)} <div class="loader blink">ESTABLISHING_ARCHIVE_UPLINK...</div>
				{:else if photos.length === 0} <div class="empty">NO_ITEMS_FOUND_IN_ARCHIVE</div>
				{:else}
					{#each photos as photo}
						<div class="photo-item">
							{#if photo.src}
								<img src={photo.src} alt={photo.alt} loading="lazy" />
							{/if}
							<div class="overlay">
								<span class="photo-id">IMG_{photo.date}</span>
								<span class="photo-title">{photo.alt || 'ARCHIVE_ITEM'}</span>
							</div>
						</div>
					{/each}
				{/if}
			</main>

			<footer class="footer">
				<p>&copy; 2024 CLEMENT. ALL RIGHTS RESERVED.</p>
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

	.booking-notice { padding: 25px; background: #111; border-bottom: 1px solid #333; text-align: center; }
	.booking-row { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 10px; font-size: 16px; font-weight: bold; color: #fff; }
	.booking-text { text-align: center; }

	.highlight-link {
		color: #000 !important;
		background: #fff !important;
		padding: 2px 8px;
		font-weight: 900;
		text-decoration: none;
		border: 1px solid #fff;
	}
	.highlight-link:hover {
		background: #000 !important;
		color: #fff !important;
	}

	.social-row { font-size: 18px; color: #fff; font-weight: bold; }
	.social-row a:hover { color: #000; background: #fff; }
	.closed { color: #f33; }
	.gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; border-bottom: 1px solid #fff; }
	.photo-item { position: relative; width: 100%; aspect-ratio: 3/4; overflow: hidden; cursor: pointer; border: 1px solid #111; }
	.photo-item img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; display: block; }
	.photo-item:hover img { opacity: 0.7; }
	.overlay { position: absolute; bottom: 0; left: 0; width: 100%; padding: 25px; display: flex; justify-content: space-between; font-size: 16px; opacity: 0; transition: 0.2s ease; background: #fff; color: #000; }
	.photo-item:hover .overlay { opacity: 1; }
	.photo-id { font-family: monospace; font-weight: bold; }
	.photo-title { text-transform: uppercase; font-weight: bold; }
	.loader, .empty { grid-column: 1 / -1; height: 400px; display: flex; align-items: center; justify-content: center; font-size: 18px; letter-spacing: 4px; text-transform: uppercase; color: #fff; }
	.footer { padding: 20px; text-align: center; font-size: 16px; color: #fff; }
	.blink { animation: blink 1s step-end infinite; }
	@keyframes blink { 50% { opacity: 0; } }
	/* Tablet */
	@media (max-width: 768px) {
		.title { font-size: 32px; }
		.subtitle { font-size: 16px; }
		.nav-link { font-size: 16px; padding: 15px; }
		.booking-row { flex-direction: column; gap: 10px; }
	}

	/* Mobile */
	@media (max-width: 600px) {
		.page { padding: 10px 0; }
		.main-container { border-width: 1px; overflow-x: hidden; }
		.header { padding: 20px 15px; }
		.title { font-size: 22px; letter-spacing: 2px; word-break: break-word; }
		.subtitle { font-size: 13px; margin-top: 8px; }
		.nav-link { padding: 12px 8px; font-size: 14px; }
		.booking-notice { padding: 15px; }
		.booking-row { font-size: 14px; }
		.booking-text { word-break: break-word; }
		.social-row { font-size: 14px; }
		.gallery { grid-template-columns: 1fr; }
		.photo-item { aspect-ratio: 4/5; }
		.overlay { padding: 12px; font-size: 11px; flex-direction: column; gap: 4px; align-items: flex-start; }
		.loader, .empty { height: 200px; font-size: 14px; letter-spacing: 2px; }
		.footer { padding: 15px; font-size: 14px; }
	}

	/* Small mobile */
	@media (max-width: 400px) {
		.title { font-size: 18px; letter-spacing: 1px; }
		.subtitle { font-size: 12px; }
		.nav-link { padding: 10px 5px; font-size: 11px; }
		.booking-notice { padding: 10px; }
		.booking-row { font-size: 12px; }
		.social-row { font-size: 12px; }
		.highlight-link { padding: 2px 6px; font-size: 11px; }
		.overlay { padding: 10px; font-size: 10px; }
	}
</style>
