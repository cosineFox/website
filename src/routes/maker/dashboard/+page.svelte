<script lang="ts">
	let { data } = $props();

	function getVal(param: string): string | number {
		if (!data.weather?.hourly?.[param] || !data.weather?.hourly?.time) return '--';
		try {
			const nowStr = new Date().toISOString().slice(0, 13);
			const index = data.weather.hourly.time.findIndex((t: string) => t.startsWith(nowStr));
			return index !== -1 ? data.weather.hourly[param][index] : '--';
		} catch (e) { return '--'; }
	}

	const current = $derived(data.weather?.current || {});
</script>

<svelte:head>
	<title>Canvas Labworks - Weather Data</title>
</svelte:head>

<div class="page">
	<div class="main-container">
		<!-- Header (Uniform) -->
		<header class="header">
			<h1 class="title">METEOROLOGICAL DATA</h1>
			<p class="subtitle">Environmental Monitoring // Station: Tronoh, MY</p>
		</header>

		<!-- Nav (Uniform) -->
		<nav class="nav">
			<a href="/main" class="nav-link">HOME</a>
			<a href="/imageworks" class="nav-link">IMAGEWORKS</a>
			<a href="/maker" class="nav-link active">MAKER</a>
		</nav>

		<div class="content">
			<div class="breadcrumb-bar">
				<a href="/maker">MAKER</a> / <span>DASHBOARD</span>
			</div>

			{#if data.news && data.news.length > 0}
				<div class="alert-box">
					<!-- svelte-ignore a11y_distracting_elements -->
					<marquee scrollamount="5"><strong>LOG:</strong> {data.news.join(' +++ ')}</marquee>
				</div>
			{/if}

			{#if data.weather && current.time}
				<div class="grid">
					<section class="section">
						<div class="section-header">CURRENT_CONDITIONS</div>
						<div class="section-body">
							<table>
								<tbody>
									<tr><td>Temperature</td><td>{current.temperature_2m ?? '--'}°C</td></tr>
									<tr><td>Feels Like</td><td>{current.apparent_temperature ?? '--'}°C</td></tr>
									<tr><td>Humidity</td><td>{current.relative_humidity_2m ?? '--'}%</td></tr>
									<tr><td>Pressure</td><td>{current.surface_pressure ?? '--'} hPa</td></tr>
									<tr><td>Wind</td><td>{current.wind_speed_10m ?? '--'} km/h</td></tr>
									<tr><td>Gusts</td><td>{current.wind_gusts_10m ?? '--'} km/h</td></tr>
								</tbody>
							</table>
						</div>
					</section>

					<section class="section">
						<div class="section-header">ATMOSPHERE & SOLAR</div>
						<div class="section-body">
							<table>
								<tbody>
									<tr><td>UV Index</td><td>{getVal('uv_index')}</td></tr>
									<tr><td>Visibility</td><td>{getVal('visibility')} m</td></tr>
									<tr><td>Cloud Cover</td><td>{current.cloud_cover ?? '--'}%</td></tr>
									<tr><td>Solar Rad.</td><td>{getVal('shortwave_radiation_instant')} W/m²</td></tr>
								</tbody>
							</table>
						</div>
					</section>

					<section class="section">
						<div class="section-header">AIR_QUALITY</div>
						<div class="section-body">
							<table>
								<tbody>
									<tr><td>US AQI</td><td>{data.air?.current?.us_aqi ?? '--'}</td></tr>
									<tr><td>PM 2.5</td><td>{data.air?.current?.pm2_5 ?? '--'} µg/m³</td></tr>
									<tr><td>PM 10</td><td>{data.air?.current?.pm10 ?? '--'} µg/m³</td></tr>
									<tr><td>Ozone</td><td>{data.air?.current?.ozone ?? '--'} µg/m³</td></tr>
								</tbody>
							</table>
						</div>
					</section>

					<section class="section">
						<div class="section-header">SEISMIC_ACTIVITY</div>
						<div class="section-body">
							{#if data.quakes && data.quakes.length > 0}
								<ul class="quake-list">
									{#each data.quakes as q}
										<li>M{q.properties.mag} - {q.properties.place}</li>
									{/each}
								</ul>
							{:else} <p class="hint">No major recent activity detected.</p> {/if}
						</div>
					</section>
				</div>
			{:else}
				<div class="section">
					<div class="section-header">ERROR</div>
					<div class="section-body center">
						<p class="error blink">UPLINK_FAILURE: UNABLE TO RETRIEVE TELEMETRY</p>
						<p class="hint">API RATE LIMIT OR NETWORK TIMEOUT DETECTED</p>
					</div>
				</div>
			{/if}

			<footer class="footer">
				<p>Telemetry: {data.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : 'Unknown'}</p>
				<p>&copy; 2024 CLEMENT. <a href="/maker" class="return-link">RETURN TO BASE</a></p>
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
	.nav-link { color: #fff; padding: 20px; border-right: 2px solid #fff; font-weight: bold; font-size: 20px; text-transform: uppercase; flex: 1; text-align: center; transition: 0.2s; }
	.nav-link:last-child { border-right: none; }
	.nav-link:hover, .nav-link.active { color: #000 !important; background: #fff !important; }

	.breadcrumb-bar { padding: 15px 25px; font-size: 16px; color: #fff; border-bottom: 1px solid #111; }
	.breadcrumb-bar a:hover { text-decoration: underline; }
	.alert-box { padding: 5px 0; border-bottom: 1px solid #fff; font-size: 18px; color: #fff; }
	.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; }
	.section { background: #000; display: flex; flex-direction: column; outline: 1px solid #fff; }
	.section-header { padding: 12px 15px; font-weight: bold; border-bottom: 1px solid #fff; font-size: 18px; text-transform: uppercase; background: #fff; color: #000; }
	.section-body { padding: 20px; background: #000; flex: 1; }
	table { width: 100%; border-collapse: collapse; }
	td { padding: 12px 0; border-bottom: 1px dotted #333; font-size: 18px; color: #fff; }
	td:first-child { font-weight: bold; color: #fff; width: 60%; }
	td:last-child { text-align: right; color: #fff; font-family: monospace; }
	.quake-list { list-style: none; padding: 0; }
	.quake-list li { margin-bottom: 12px; font-size: 18px; color: #fff; }
	.error { color: #f33; font-weight: bold; }
	.hint { color: #fff; font-size: 16px; margin-top: 10px; }
	.footer { padding: 20px; text-align: center; font-size: 16px; color: #fff; border-top: 1px solid #fff; }
	.return-link { color: #fff; text-decoration: underline; font-weight: bold; }
	.blink { animation: blink 1s step-end infinite; }
	@keyframes blink { 50% { opacity: 0; } }
	/* Tablet */
	@media (max-width: 768px) {
		.grid { grid-template-columns: 1fr; }
		.title { font-size: 32px; }
		.nav-link { font-size: 16px; padding: 15px; }
	}

	/* Mobile */
	@media (max-width: 600px) {
		.page { padding: 10px 0; }
		.main-container { border-width: 1px; }
		.header { padding: 20px 15px; }
		.title { font-size: 24px; letter-spacing: 2px; }
		.subtitle { font-size: 14px; margin-top: 8px; }
		.nav-link { padding: 12px 8px; font-size: 14px; }
		.breadcrumb-bar { padding: 10px 15px; font-size: 14px; }
		.alert-box { font-size: 14px; }
		.section-header { padding: 10px 12px; font-size: 14px; }
		.section-body { padding: 15px; }
		td { padding: 8px 0; font-size: 14px; }
		td:first-child { width: 50%; }
		.quake-list li { font-size: 14px; margin-bottom: 8px; }
		.hint { font-size: 14px; }
		.footer { padding: 15px; font-size: 14px; }
	}

	/* Small mobile */
	@media (max-width: 400px) {
		.title { font-size: 20px; letter-spacing: 1px; }
		.nav-link { padding: 10px 5px; font-size: 12px; }
		td { font-size: 12px; }
		.quake-list li { font-size: 12px; }
	}
</style>