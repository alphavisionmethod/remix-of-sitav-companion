import { corsHeaders } from '@supabase/supabase-js/cors'

const WMO_CODES: Record<number, string> = {
  0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Foggy", 48: "Rime Fog", 51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
  61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
  71: "Light Snow", 73: "Snow", 75: "Heavy Snow", 77: "Snow Grains",
  80: "Light Showers", 81: "Showers", 82: "Heavy Showers",
  85: "Light Snow Showers", 86: "Snow Showers",
  95: "Thunderstorm", 96: "Thunderstorm + Hail", 99: "Heavy Thunderstorm",
};

const WMO_ICONS: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌧️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "❄️", 75: "❄️", 77: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  85: "🌨️", 86: "🌨️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '40.7128');
    const lon = parseFloat(url.searchParams.get('lon') || '-74.006');

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return new Response(JSON.stringify({ error: 'Invalid coordinates' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,weather_code&forecast_days=1&timezone=auto`;

    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Open-Meteo API error [${resp.status}]: ${body}`);
    }

    const data = await resp.json();
    const current = data.current;
    const code = current.weather_code ?? 0;

    // Build hourly forecast (next 12 hours from current hour)
    const nowHour = new Date().getHours();
    const hourly = [];
    for (let i = 0; i < 12 && i + nowHour < (data.hourly?.time?.length ?? 0); i++) {
      const idx = nowHour + i;
      hourly.push({
        time: data.hourly.time[idx],
        temp: data.hourly.temperature_2m[idx],
        code: data.hourly.weather_code[idx],
        icon: WMO_ICONS[data.hourly.weather_code[idx]] ?? "🌡️",
      });
    }

    const result = {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      uvIndex: current.uv_index,
      condition: WMO_CODES[code] ?? "Unknown",
      icon: WMO_ICONS[code] ?? "🌡️",
      code,
      unit: data.current_units?.temperature_2m ?? "°C",
      hourly,
      fetchedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Weather fetch error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
