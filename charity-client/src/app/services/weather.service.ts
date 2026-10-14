import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Open-Meteo: free weather API, no API key required.
// https://open-meteo.com/en/docs
@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}

  // Current weather for Sydney (default event location)
  getSydneyWeather(): Observable<any> {
    const url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=-33.8688&longitude=151.2093'
      + '&current=temperature_2m,weather_code,wind_speed_10m'
      + '&timezone=Australia%2FSydney';
    return this.http.get<any>(url);
  }

  // Map WMO weather code to human text
  codeToText(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code <= 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Fog';
    if (code >= 51 && code <= 57) return 'Drizzle';
    if (code >= 61 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Unknown';
  }
}
//（注：内容由AI生成）
