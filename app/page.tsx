"use client";

import drizzleIcon from "@/assets/images/icon-drizzle.webp";
import dropdownIcon from "@/assets/images/icon-dropdown.svg";
import fogIcon from "@/assets/images/icon-fog.webp";
import overcastIcon from "@/assets/images/icon-overcast.webp";
import partlyCloudyIcon from "@/assets/images/icon-partly-cloudy.webp";
import rainIcon from "@/assets/images/icon-rain.webp";
import retryIcon from "@/assets/images/icon-retry.svg";
import searchIcon from "@/assets/images/icon-search.svg";
import snowIcon from "@/assets/images/icon-snow.webp";
import stormIcon from "@/assets/images/icon-storm.webp";
import sunnyIcon from "@/assets/images/icon-sunny.webp";
import unitsIcon from "@/assets/images/icon-units.svg";
import logo from "@/assets/images/logo.svg";
import Image, { StaticImageData } from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

type UnitSystem = "metric" | "imperial";
type TemperatureUnit = "celsius" | "fahrenheit";
type WindUnit = "kmh" | "mph";
type PrecipitationUnit = "mm" | "inch";

type WeatherData = {
  location: string;
  timezone: string;
  current: {
    time: string;
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCode: number;
  };
  daily: {
    time: string[];
    weatherCode: number[];
    maxTemperature: number[];
    minTemperature: number[];
  };
  hourly: {
    time: string[];
    temperature: number[];
    weatherCode: number[];
  };
};

const defaultCity = "Mymensingh";

const WEATHER_ICON_MAP: Record<string, StaticImageData> = {
  sunny: sunnyIcon,
  partlyCloudy: partlyCloudyIcon,
  overcast: overcastIcon,
  fog: fogIcon,
  drizzle: drizzleIcon,
  rain: rainIcon,
  snow: snowIcon,
  storm: stormIcon,
};

const getWeatherIconKey = (code: number): keyof typeof WEATHER_ICON_MAP => {
  if (code === 0) return "sunny";
  if (code === 1 || code === 2) return "partlyCloudy";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "partlyCloudy";
};

const formatHour = (time: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
  }).format(new Date(time));

const formatDay = (time: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(time));

const formatLongDate = (time: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(time));

const getTempSuffix = (temperatureUnit: TemperatureUnit) =>
  temperatureUnit === "celsius" ? "°C" : "°F";

const getWindSuffix = (windUnit: WindUnit) => (windUnit === "kmh" ? "km/h" : "mph");

const getPrecipitationSuffix = (precipitationUnit: PrecipitationUnit) =>
  precipitationUnit === "mm" ? "mm" : "in";

export default function Home() {
  const [query, setQuery] = useState(defaultCity);
  const [submittedCity, setSubmittedCity] = useState(defaultCity);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("celsius");
  const [windUnit, setWindUnit] = useState<WindUnit>("kmh");
  const [precipitationUnit, setPrecipitationUnit] = useState<PrecipitationUnit>("mm");

  useEffect(() => {
    let ignore = false;

    const loadWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const locationResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            submittedCity,
          )}&count=1&language=en&format=json`,
        );

        if (!locationResponse.ok) {
          throw new Error("Could not find that location.");
        }

        const locationPayload = (await locationResponse.json()) as {
          results?: {
            name: string;
            country: string;
            admin1?: string;
            latitude: number;
            longitude: number;
            timezone: string;
          }[];
        };

        const match = locationPayload.results?.[0];

        if (!match) {
          throw new Error("No matching city found.");
        }

        const forecastResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&temperature_unit=${temperatureUnit}&wind_speed_unit=${windUnit}&precipitation_unit=${precipitationUnit}&timezone=auto`,
        );

        if (!forecastResponse.ok) {
          throw new Error("Weather data is unavailable right now.");
        }

        const payload = (await forecastResponse.json()) as {
          current: {
            time: string;
            temperature_2m: number;
            apparent_temperature: number;
            relative_humidity_2m: number;
            wind_speed_10m: number;
            precipitation: number;
            weather_code: number;
          };
          daily: {
            time: string[];
            weather_code: number[];
            temperature_2m_max: number[];
            temperature_2m_min: number[];
          };
          hourly: {
            time: string[];
            temperature_2m: number[];
            weather_code: number[];
          };
          timezone: string;
        };

        if (ignore) return;

        setWeather({
          location: `${match.name}${match.admin1 ? `, ${match.admin1}` : ""}, ${match.country}`,
          timezone: payload.timezone,
          current: {
            time: payload.current.time,
            temperature: payload.current.temperature_2m,
            apparentTemperature: payload.current.apparent_temperature,
            humidity: payload.current.relative_humidity_2m,
            windSpeed: payload.current.wind_speed_10m,
            precipitation: payload.current.precipitation,
            weatherCode: payload.current.weather_code,
          },
          daily: {
            time: payload.daily.time,
            weatherCode: payload.daily.weather_code,
            maxTemperature: payload.daily.temperature_2m_max,
            minTemperature: payload.daily.temperature_2m_min,
          },
          hourly: {
            time: payload.hourly.time,
            temperature: payload.hourly.temperature_2m,
            weatherCode: payload.hourly.weather_code,
          },
        });
        setSelectedDayIndex(0);
      } catch (requestError) {
        if (ignore) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong while loading weather.",
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadWeather();

    return () => {
      ignore = true;
    };
  }, [submittedCity, temperatureUnit, windUnit, precipitationUnit, reloadToken]);

  const hourlyItems = useMemo(() => {
    if (!weather) return [];
    const selectedDay = weather.daily.time[selectedDayIndex];
    if (!selectedDay) return [];

    return weather.hourly.time
      .map((time, index) => ({
        time,
        temperature: weather.hourly.temperature[index],
        weatherCode: weather.hourly.weatherCode[index],
      }))
      .filter((entry) => entry.time.startsWith(selectedDay));
  }, [selectedDayIndex, weather]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSubmittedCity(query.trim());
  };

  const applySystem = (nextSystem: UnitSystem) => {
    setUnitSystem(nextSystem);
    if (nextSystem === "metric") {
      setTemperatureUnit("celsius");
      setWindUnit("kmh");
      setPrecipitationUnit("mm");
      return;
    }
    setTemperatureUnit("fahrenheit");
    setWindUnit("mph");
    setPrecipitationUnit("inch");
  };

  return (
    <div className="weather-shell">
      <main className="weather-card">
        <header className="top-row">
          <Image src={logo} alt="SkyLuxe Weather" className="brand-logo" priority />

          <div className="units-wrap">
            <button
              type="button"
              className="units-trigger"
              onClick={() => setUnitsOpen((value) => !value)}
              aria-expanded={unitsOpen}
              aria-haspopup="dialog"
            >
              <Image src={unitsIcon} alt="" aria-hidden width={16} height={16} />
              Units
              <Image src={dropdownIcon} alt="" aria-hidden width={12} height={12} />
            </button>

            {unitsOpen ? (
              <div className="units-menu">
                <label>
                  System
                  <select
                    value={unitSystem}
                    onChange={(event) => applySystem(event.target.value as UnitSystem)}
                  >
                    <option value="metric">Metric</option>
                    <option value="imperial">Imperial</option>
                  </select>
                </label>

                <label>
                  Temperature
                  <select
                    value={temperatureUnit}
                    onChange={(event) => setTemperatureUnit(event.target.value as TemperatureUnit)}
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </label>

                <label>
                  Wind speed
                  <select
                    value={windUnit}
                    onChange={(event) => setWindUnit(event.target.value as WindUnit)}
                  >
                    <option value="kmh">km/h</option>
                    <option value="mph">mph</option>
                  </select>
                </label>

                <label>
                  Precipitation
                  <select
                    value={precipitationUnit}
                    onChange={(event) =>
                      setPrecipitationUnit(event.target.value as PrecipitationUnit)
                    }
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="inch">Inches (in)</option>
                  </select>
                </label>
              </div>
            ) : null}
          </div>
        </header>

        <h1>How&apos;s the sky looking today?</h1>

        <form className="search-row" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <Image src={searchIcon} alt="" aria-hidden width={18} height={18} />
            <input
              aria-label="Search city"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for a city, e.g., New York"
            />
          </div>
          <button type="submit">Search</button>
        </form>

        {loading ? <div className="state-card">Loading weather...</div> : null}

        {error ? (
          <div className="state-card error-state">
            <p>{error}</p>
            <button type="button" onClick={() => setReloadToken((value) => value + 1)}>
              <Image src={retryIcon} alt="" aria-hidden width={14} height={14} />
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !error && weather ? (
          <section className="dashboard-grid">
            <div className="dashboard-main">
              <article className="current-card">
                <div>
                  <h2>{weather.location}</h2>
                  <p>{formatLongDate(weather.current.time)}</p>
                </div>

                <div className="current-temp">
                  <Image
                    src={WEATHER_ICON_MAP[getWeatherIconKey(weather.current.weatherCode)]}
                    alt="Current weather icon"
                    width={54}
                    height={54}
                  />
                  <strong>
                    {Math.round(weather.current.temperature)}
                    °
                  </strong>
                </div>
              </article>

              <div className="metrics-grid">
                <article>
                  <h3>Feels like</h3>
                  <p>
                    {Math.round(weather.current.apparentTemperature)} {getTempSuffix(temperatureUnit)}
                  </p>
                </article>
                <article>
                  <h3>Humidity</h3>
                  <p>{Math.round(weather.current.humidity)}%</p>
                </article>
                <article>
                  <h3>Wind</h3>
                  <p>
                    {Math.round(weather.current.windSpeed)} {getWindSuffix(windUnit)}
                  </p>
                </article>
                <article>
                  <h3>Precipitation</h3>
                  <p>
                    {weather.current.precipitation.toFixed(1)} {getPrecipitationSuffix(precipitationUnit)}
                  </p>
                </article>
              </div>

              <section className="daily-section">
                <h3>Daily forecast</h3>

                <div className="daily-grid">
                  {weather.daily.time.map((day, index) => (
                    <button
                      type="button"
                      key={day}
                      className={index === selectedDayIndex ? "day-card active" : "day-card"}
                      onClick={() => setSelectedDayIndex(index)}
                    >
                      <span>{formatDay(day)}</span>
                      <Image
                        src={WEATHER_ICON_MAP[getWeatherIconKey(weather.daily.weatherCode[index])]}
                        alt="Forecast icon"
                        width={28}
                        height={28}
                      />
                      <small>
                        {Math.round(weather.daily.maxTemperature[index])}°
                        <em>{Math.round(weather.daily.minTemperature[index])}°</em>
                      </small>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <aside className="hourly-panel">
              <div className="hourly-header">
                <h3>Hourly forecast</h3>
                <label className="day-picker">
                  <span className="visually-hidden">Day</span>
                  <select
                    aria-label="Select forecast day"
                    value={selectedDayIndex}
                    onChange={(event) => setSelectedDayIndex(Number(event.target.value))}
                  >
                    {weather.daily.time.map((day, index) => (
                      <option value={index} key={day}>
                        {new Intl.DateTimeFormat("en-US", {
                          weekday: "long",
                        }).format(new Date(day))}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="hourly-list">
                {hourlyItems.slice(0, 9).map((entry) => (
                  <article key={entry.time}>
                    <Image
                      src={WEATHER_ICON_MAP[getWeatherIconKey(entry.weatherCode)]}
                      alt=""
                      aria-hidden
                      width={22}
                      height={22}
                    />
                    <span>{formatHour(entry.time)}</span>
                    <strong>
                      {Math.round(entry.temperature)}
                      °
                    </strong>
                  </article>
                ))}
              </div>
            </aside>
          </section>
        ) : null}
      </main>
    </div>
  );
}
