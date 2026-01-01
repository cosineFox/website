<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { siteConfig } from '$lib/config';
	import { globalState, shouldFetch, updateFetchTime } from '$lib/state.svelte';

	// Asset Imports
	import aliceImg from '$lib/assets/images/badges/alice.WEBP';
	import gamercat from '$lib/assets/images/badges/gamercat.gif';
	import gethtmlnow from '$lib/assets/images/badges/gethtmlnow.gif';
	import gc_japan from '$lib/assets/images/badges/gc_japan.gif';
	import linux from '$lib/assets/images/badges/linux.gif';
	import kemofure from '$lib/assets/images/badges/kemofure.gif';
	import www from '$lib/assets/images/badges/www.gif';
	import zettai from '$lib/assets/images/badges/zettai.gif';
	import logo006 from '$lib/assets/images/badges/logo006.gif';
	import mangamaisanime from '$lib/assets/images/badges/mangamaisanime.gif';
	import netscape from '$lib/assets/images/badges/netscape.gif';
	import blink0 from '$lib/assets/images/badges/blink-0.gif';
	import nc_tribune from '$lib/assets/images/badges/nc_tribune.gif';
	import eva from '$lib/assets/images/badges/eva.gif';
	import anime100 from '$lib/assets/images/badges/anime100.gif';

	import c0 from '$lib/assets/images/counter/c0.gif';
	import c1 from '$lib/assets/images/counter/c1.gif';
	import c2 from '$lib/assets/images/counter/c2.gif';
	import c3 from '$lib/assets/images/counter/c3.gif';
	import c4 from '$lib/assets/images/counter/c4.gif';
	import c5 from '$lib/assets/images/counter/c5.gif';
	import c6 from '$lib/assets/images/counter/c6.gif';
	import c7 from '$lib/assets/images/counter/c7.gif';
	import c8 from '$lib/assets/images/counter/c8.gif';
	import c9 from '$lib/assets/images/counter/c9.gif';

	const digitImages = [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9];

	// Types
	interface BlueskyPost { id: string; text: string; createdAt: string; likes: number; images: string[]; }
	interface SteamGame { appid: number; name: string; playtime_2weeks?: number; playtime_forever: number; img_icon_url: string; }

	// State
	let isLoadingFeed = $state(false);
	let isLoadingSteam = $state(false);

	// Lightbox State
	let lightboxOpen = $state(false);
	let currentImageIndex = $state(0);
	const lightboxImages = $derived(globalState.blueskyPosts.flatMap(p => p.images));

	// Constants
	const BLUESKY_HANDLE = 'cosinefox.bsky.social';
	const STEAM_ID = siteConfig.steamId;
	const STATUS_CAFE_USER = siteConfig.statusCafeUser;

	const socialLinks = [
		{ name: 'GITHUB', url: "https://github.com/cosineFox" },
		{ name: 'BLUESKY', url: `https://bsky.app/profile/${BLUESKY_HANDLE}` },
		{ name: 'INSTAGRAM', url: siteConfig.instagramUrl }
	];

	// Data Fetching
	async function fetchStatus() {
		if (!shouldFetch('status')) return;
		try {
			const res = await fetch(`https://status.cafe/users/${STATUS_CAFE_USER}/status.json`);
			if (res.ok) {
				globalState.status = await res.json();
				const content = globalState.status?.content.toLowerCase() || '';
				if (content.includes('not open for shoots')) globalState.isOpenForShoots = false;
				else if (content.includes('open for shoots')) globalState.isOpenForShoots = true;
				updateFetchTime('status');
			}
		} catch (e) { console.error('Status Error:', e); }
	}

	async function fetchBluesky() {
		if (!shouldFetch('bluesky')) return;
		isLoadingFeed = true;
		try {
			const res = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${BLUESKY_HANDLE}&limit=50`);
			if (!res.ok) throw new Error('API ERROR');
			const data = await res.json();
			const mapPost = (item: any): BlueskyPost => {
				const imageSet = new Set<string>();
				const embed = item.post.embed;
				if (embed?.images) {
					embed.images.forEach((img: any) => { if (img.thumb) imageSet.add(img.thumb); });
				} else if (embed?.$type === 'app.bsky.embed.images#view') {
					embed.images?.forEach((img: any) => { if (img.thumb) imageSet.add(img.thumb); });
				} else if (embed?.$type === 'app.bsky.embed.recordWithMedia#view' && embed.media?.images) {
					embed.media.images.forEach((img: any) => { if (img.thumb) imageSet.add(img.thumb); });
				}
				return { id: item.post.cid, text: item.post.record?.text || '', createdAt: item.post.record?.createdAt, likes: item.post.likeCount || 0, images: Array.from(imageSet) };
			};
			globalState.blueskyPosts = data.feed.slice(0, 10).map(mapPost);
			globalState.techPosts = data.feed.filter((i: any) => i.post.record?.text?.toLowerCase().includes('#tech')).slice(0, 5).map(mapPost);
			updateFetchTime('bluesky');
		} catch (e) { console.error('Bluesky Error:', e); } finally { isLoadingFeed = false; }
	}

	async function fetchSteam() {
		if (!shouldFetch('steam')) return;
		isLoadingSteam = true;
		try {
			const res = await fetch(`/api/steam?steamid=${STEAM_ID}`);
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			globalState.steamGames = data.games || [];
			globalState.steamError = null;
			updateFetchTime('steam');
		} catch (e: any) { globalState.steamError = e.message; } finally { isLoadingSteam = false; }
	}

	async function fetchVisitors() {
		if (!shouldFetch('visitors')) return;
		try {
			const res = await fetch('/api/counter', { method: 'POST' });
			if (res.ok) {
				globalState.visitorCount = (await res.json()).count;
				updateFetchTime('visitors');
			}
		} catch (e) { console.error('Counter Error:', e); }
	}

	// Helpers
	const formatTime = (s: string) => {
		const d = new Date(s), n = new Date(), diff = Math.floor((n.getTime() - d.getTime()) / 1000);
		if (diff < 60) return 'JUST NOW';
		if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
		return `${Math.floor(diff / 86400)}D AGO`;
	};

	const openLB = (url: string) => { currentImageIndex = lightboxImages.indexOf(url); lightboxOpen = true; };
	const closeLB = () => lightboxOpen = false;
	const nextImg = (e?: Event) => { if (e) e.stopPropagation(); currentImageIndex = (currentImageIndex + 1) % lightboxImages.length; };
	const prevImg = (e?: Event) => { if (e) e.stopPropagation(); currentImageIndex = (currentImageIndex - 1 + lightboxImages.length) % lightboxImages.length; };

	onMount(() => {
		if (browser) {
			fetchStatus(); fetchBluesky(); fetchSteam(); fetchVisitors();
			const handleKey = (e: KeyboardEvent) => {
				if (!lightboxOpen) return;
				if (e.key === 'ArrowRight') nextImg();
				if (e.key === 'ArrowLeft') prevImg();
				if (e.key === 'Escape') closeLB();
			};
			window.addEventListener('keydown', handleKey);
			return () => window.removeEventListener('keydown', handleKey);
		}
	});
</script>

<svelte:head>
	<title>Canvas Labworks</title>
</svelte:head>

<div class="page">
	<div class="main-container">
		<!-- Header -->
		<header class="header">
			<h1 class="title">CANVAS LABWORKS</h1>
			<p class="subtitle">Welcome to Clement's Corner of the Web!</p>
		</header>

		<!-- Nav -->
		<nav class="nav">
			<a href="/main" class="nav-link active">HOME</a>
			<a href="/imageworks" class="nav-link">IMAGEWORKS</a>
			<a href="/maker" class="nav-link">MAKER</a>
		</nav>

		<!-- Marquee -->
		<div class="marquee-container">
			<!-- svelte-ignore a11y_distracting_elements -->
			<marquee scrollamount="5">Remember when checking other people's websites was the only way to keep up with their status?</marquee>
		</div>

		<div class="content">
			<section class="section about-section">
				<div class="section-header">ABOUT_ME</div>
				<div class="section-body about">
					<div class="about-left">
						<img src={aliceImg} alt="Clement" class="avatar-img" />
						<span class="filename">alice.webp</span>
						<img src={netscape} alt="netscape" class="badge" />
					</div>
					<div class="about-right">
						<p class="greeting">
							Hello&nbsp;<img src={www} alt="www" class="badge inline-badge" /> !
							<span class="greeting-badges">
							I 	&lt;3
								<img src={linux} alt="linux" class="badge" />
								<img src={nc_tribune} alt="nc_tribune" class="badge" />
								<img src={blink0} alt="blink" class="badge" />
							</span>
						</p>
						<div class="info-list">
							<div><b>EMAIL:</b> <a href="mailto:{siteConfig.email}">{siteConfig.email}</a></div>
						</div>

						<!-- Custom Status Cafe Display -->
						{#if globalState.status}
							<div class="status-box">
								<div class="status-header">
									<a href="https://status.cafe/users/{STATUS_CAFE_USER}" target="_blank">@{globalState.status.author}</a>
									<span class="face">{globalState.status.face}</span>
									<span class="time">{globalState.status.timeAgo}</span>
								</div>
								<div class="status-content">{globalState.status.content}</div>
							</div>
						{/if}

						<div class="about-text">
							<p>MY NAME IS <b>CLEMENT</b> AND I AM AN IT STUDENT AT UNI PETRONAS!</p>
							<p>I LIKE <span class="white">LINUX</span>, <span class="white">IOT</span>, AND MAKING THINGS <span class="blink">BLINK!</span></p>
							<p>LOCATION: MALAYSIA</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section counter-box">
				<div class="section-header">VISITORS</div>
				<div class="section-body center">
					<div class="counter">
						{#each (globalState.visitorCount || 1337).toString().padStart(6, '0').split('') as digit}
							<img src={digitImages[parseInt(digit)]} alt={digit} class="counter-digit" />
						{/each}
					</div>
				</div>
			</section>

			<section class="section links-section">
				<div class="section-header">WEB_RING</div>
				<div class="section-body center">
					<div class="badges">
						{#each [gamercat, gethtmlnow, gc_japan, kemofure, logo006, mangamaisanime, zettai, eva, anime100] as badge}
							<img src={badge} alt="badge" class="badge">
						{/each}
					</div>
					<div class="social-links">
						{#each socialLinks as link} <a href={link.url} target="_blank">[{link.name}]</a> {/each}
					</div>
				</div>
			</section>

			<section class="section feed-section">
				<div class="section-header">BLUESKY_FEED</div>
				<div class="section-body feed-content">
					{#if isLoadingFeed && globalState.blueskyPosts.length === 0} <p class="loading blink">LOADING...</p>
					{:else if globalState.blueskyPosts.length > 0}
						{#each globalState.blueskyPosts as post}
							<div class="post">
								<div class="post-meta">{formatTime(post.createdAt)} | <span class="likes">♥{post.likes}</span></div>
								<p>{post.text}</p>
								{#if post.images.length > 0}
									<div class="post-images">
										{#each post.images as img}
											<button class="img-btn" onclick={() => openLB(img)}>
												<img src={img} alt="post" class="post-img">
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
						<a href="https://bsky.app/profile/{BLUESKY_HANDLE}" target="_blank" class="more-link">&gt;&gt; VIEW_ALL &lt;&lt;</a>
					{:else} <p>NO_POSTS_FOUND</p> {/if}
				</div>
			</section>

			<section class="section steam-section">
				<div class="section-header">RECENTLY_PLAYED</div>
				<div class="section-body">
					{#if isLoadingSteam && globalState.steamGames.length === 0} <p class="loading blink">CONNECTING...</p>
					{:else if globalState.steamGames.length > 0}
						<div class="games-list">
							{#each globalState.steamGames.slice(0, 5) as game}
								<div class="game-row">
									<img src="https://media.steampowered.com/steamcommunity/public/images/apps/{game.appid}/{game.img_icon_url}.jpg" alt={game.name} class="game-icon">
									<span class="game-name">{game.name}</span>
									<span class="game-time">
										{#if game.playtime_2weeks}<span class="online">{Math.floor(game.playtime_2weeks/60)}H</span>{/if}
										<span class="hint">{Math.floor(game.playtime_forever/60)}H</span>
									</span>
								</div>
							{/each}
						</div>
						<a href="https://steamcommunity.com/profiles/{STEAM_ID}" target="_blank" class="more-link">&gt;&gt; PROFILE &lt;&lt;</a>
					{:else if globalState.steamError} <p class="hint">ERROR: {globalState.steamError}</p>
					{:else} <p class="hint">NO_GAMES_FOUND</p> {/if}
				</div>
			</section>

			<section class="section tech-section">
				<div class="section-header">TECH_LOGS</div>
				<div class="section-body feed-content">
					{#if isLoadingFeed && globalState.techPosts.length === 0} <p class="loading blink">SCANNING...</p>
					{:else if globalState.techPosts.length > 0}
						{#each globalState.techPosts as post}
							<div class="post">
								<div class="post-meta">{formatTime(post.createdAt)}</div>
								<p>{post.text}</p>
							</div>
						{/each}
					{:else} <p>NO_LOGS_FOUND</p> {/if}
				</div>
			</section>

			<footer class="footer">
				<p>Inspired by the old web as a protest to new web and clunky designs</p>
				<p class="hint">COPYRIGHT 2024 CLEMENT @ CANVAS_LABWORKS</p>
			</footer>
		</div>
	</div>

	{#if lightboxOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="lightbox" onclick={closeLB} role="dialog">
			<button class="lb-close" onclick={closeLB}>[CLOSE]</button>
			<button class="lb-nav lb-prev" onclick={prevImg}>&lt; PREV</button>
			<img src={lightboxImages[currentImageIndex]} alt="lightbox" class="lb-img" />
			<button class="lb-nav lb-next" onclick={nextImg}>NEXT &gt;</button>
			<div class="lb-counter">IMAGE {currentImageIndex + 1} / {lightboxImages.length}</div>
		</div>
	{/if}
</div>

<style>
	.page { min-height: 100vh; background: #000; color: #fff; font-family: 'Courier New', monospace; font-size: 18px; display: flex; flex-direction: column; align-items: center; padding: 20px 0; }
	.main-container { width: 100%; max-width: 1000px; background: #000; border: 2px solid #fff; }
	.header { text-align: center; padding: 30px 20px; border-bottom: 2px solid #fff; }
	.title { font-size: 42px; margin: 0; letter-spacing: 4px; line-height: 1; font-weight: bold; text-transform: uppercase; }
	.subtitle { color: #fff; margin-top: 10px; font-size: 18px; font-style: italic; }
	.nav { display: flex; border-bottom: 2px solid #fff; }
	.nav-link { color: #fff; padding: 20px; border-right: 2px solid #fff; font-weight: bold; font-size: 20px; text-transform: uppercase; flex: 1; text-align: center; transition: all 0.2s; }
	.nav-link:last-child { border-right: none; }
	.nav-link:hover, .nav-link.active { color: #000 !important; background: #fff !important; }
	.marquee-container { background: #000; color: #fff; padding: 10px 0 0 0; font-weight: bold; border-bottom: 2px solid #fff; font-size: 18px; text-transform: uppercase; }
	.content { display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-flow: dense; gap: 0; background: #000; }
	.section { background: #000; display: flex; flex-direction: column; border: 1px solid #fff; margin-top: -1px; margin-left: -1px; }
	.about-section, .counter-box, .links-section, .footer { grid-column: span 2; }
	.feed-section { grid-row: span 2; }
	.section-header { padding: 12px 15px; font-weight: bold; border-bottom: 1px solid #fff; font-size: 18px; text-transform: uppercase; background: #fff; color: #000; }
	.section-body { padding: 20px; flex: 1; }
	.about { display: grid; grid-template-columns: auto 1fr; gap: 30px; align-items: center; max-width: 900px; margin: 0 auto; }
	.about-left { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
	.avatar-img { width: 180px; height: 180px; border: 2px solid #fff; border-radius: 50%; object-fit: cover; }
	.filename { font-size: 16px; color: #fff; display: block; margin-top: 5px; }
	.greeting { font-size: 28px; font-weight: bold; margin: 0; display: flex; align-items: center; flex-wrap: wrap; }
	.greeting-badges { margin-left: 20px; display: flex; align-items: center; gap: 10px; }
	.info-list { margin: 10px 0 0 0; font-size: 18px; border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 10px 0; display: flex; flex-wrap: wrap; gap: 20px; }
	.info-list a:hover { color: #000; background: #fff; }
	.online { color: #0f0; }
	.about-text p { margin: 8px 0 0 0; line-height: 1.4; color: #fff; }
	.white { color: #fff; font-weight: bold; }
	.status-box { margin: 10px 0; padding: 15px; border: 1px solid #fff; background: #000; text-align: left; }
	.status-header { font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 10px; font-size: 14px; display: flex; gap: 10px; align-items: center; }
	.status-header a { color: #fff; text-decoration: underline; }
	.status-header a:hover { color: #000; background: #fff; }
	.status-header .time { color: #fff; margin-left: auto; font-weight: normal; font-size: 12px; }
	.status-content { color: #fff; font-size: 16px; line-height: 1.4; }
	.feed-content { max-height: 600px; overflow-y: auto; }
	.post { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #333; }
	.post-meta { font-size: 14px; color: #fff; margin-bottom: 0; }
	.likes { color: #f33; font-weight: bold; }
	.post p { margin: 5px 0 0 0; color: #fff; }
	.post-images { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin-top: 10px; }
	.img-btn { background: none; border: none; padding: 0; cursor: pointer; }
	.post-img { width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1; border: 1px solid #333; transition: 0.2s; }
	.post-img:hover { transform: scale(1.05); border-color: #fff; }
	.game-row { display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid #222; }
	.game-icon { width: 48px; height: 48px; }
	.game-name { flex: 1; font-weight: bold; color: #fff; }
	.game-time { font-size: 16px; text-align: right; color: #fff; }
	.badges { display: flex; justify-content: center; flex-wrap: wrap; gap: 5px; margin-bottom: 20px; }
	.badge { scale: 1.2; margin: 5px; image-rendering: pixelated; border: 1px solid #fff; }
	.inline-badge { margin: 0 10px; vertical-align: middle; }
	.social-links { display: flex; border-top: 1px solid #fff; }
	.social-links a { color: #fff; font-weight: bold; padding: 20px; border-right: 1px solid #fff; flex: 1; text-align: center; }
	.social-links a:last-child { border-right: none; }
	.social-links a:hover { color: #000 !important; background: #fff !important; }
	.center { text-align: center; }
	.counter { display: inline-flex; gap: 5px; }
	.counter-digit { height: 80px; image-rendering: pixelated; }
	.footer { text-align: center; font-size: 16px; padding: 30px; border-top: 2px solid #fff; color: #fff; }
	.hint { color: #fff; font-size: 16px; }
	.more-link { display: block; text-align: center; color: #fff; margin-top: 15px; font-weight: bold; text-decoration: underline; }
	.more-link:hover { color: #000; background: #fff; }
	.lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 1000; display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
	.lb-img { max-width: 90%; max-height: 85%; border: 2px solid #fff; cursor: default; }
	.lb-close { position: absolute; top: 20px; right: 20px; background: #fff; color: #000; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; }
	.lb-nav { position: absolute; top: 50%; transform: translateY(-50%); background: #fff; color: #000; border: none; padding: 20px; font-weight: bold; cursor: pointer; z-index: 1001; }
	.lb-prev { left: 20px; } .lb-next { right: 20px; }
	.lb-counter { position: absolute; bottom: 20px; color: #888; font-size: 14px; }
	/* Tablet */
	@media (max-width: 960px) {
		.content { grid-template-columns: 1fr; }
		.about-section, .counter-box, .links-section { grid-column: auto; }
		.feed-section { grid-row: auto; }
		.about { grid-template-columns: 1fr; text-align: center; gap: 15px; }
		.info-list { justify-content: center; }
	}

	/* Mobile */
	@media (max-width: 600px) {
		.page { padding: 10px 0; }
		.main-container { border-width: 1px; }
		.header { padding: 20px 15px; }
		.title { font-size: 24px; letter-spacing: 2px; }
		.subtitle { font-size: 14px; margin-top: 8px; }
		.nav-link { padding: 12px 8px; font-size: 14px; }
		.marquee-container { font-size: 14px; padding: 8px 0 0 0; }
		.section-header { padding: 10px 12px; font-size: 14px; }
		.section-body { padding: 15px; }
		.avatar-img { width: 120px; height: 120px; }
		.filename { font-size: 12px; }
		.greeting { font-size: 20px; justify-content: center; }
		.greeting-badges { margin-left: 10px; gap: 5px; }
		.info-list { font-size: 14px; gap: 10px; padding: 8px 0; }
		.about-text p { font-size: 14px; }
		.status-box { padding: 10px; }
		.status-header { font-size: 12px; gap: 5px; }
		.status-content { font-size: 14px; }
		.badge { scale: 1; margin: 3px; }
		.counter-digit { height: 50px; }
		.social-links a { padding: 12px 8px; font-size: 14px; }
		.post-meta { font-size: 12px; }
		.post p { font-size: 14px; }
		.post-images { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 5px; }
		.game-row { padding: 10px; gap: 10px; }
		.game-icon { width: 36px; height: 36px; }
		.game-name { font-size: 14px; }
		.game-time { font-size: 14px; }
		.footer { padding: 20px 15px; font-size: 14px; }
		.lb-nav { padding: 10px; font-size: 12px; }
		.lb-prev { left: 10px; }
		.lb-next { right: 10px; }
		.lb-close { top: 10px; right: 10px; padding: 8px 12px; font-size: 12px; }
	}

	/* Small mobile */
	@media (max-width: 400px) {
		.title { font-size: 20px; letter-spacing: 1px; }
		.nav-link { padding: 10px 5px; font-size: 12px; }
		.avatar-img { width: 100px; height: 100px; }
		.greeting { font-size: 18px; flex-direction: column; gap: 10px; }
		.greeting-badges { margin-left: 0; }
		.counter-digit { height: 40px; }
		.social-links { flex-direction: column; }
		.social-links a { border-right: none; border-bottom: 1px solid #fff; }
		.social-links a:last-child { border-bottom: none; }
	}
</style>
