# Functional Specification Document (FSD)

## Product Name
SkyPlanets

## Version
1.2

## Date
2026-05-30

## 1. Purpose
SkyPlanets is a web application that tells a user which planets are currently visible from their location. The app uses location, current time, and astronomical calculations to determine visibility and presents results in simple language.

This document defines the functional requirements, user flows, data requirements, and acceptance criteria for the first production release.

## 2. Goals And Non-Goals

### 2.1 Goals
1. Tell users which planets are visible right now from their current location.
2. Explain when each planet rises, sets, and reaches highest altitude.
3. Show where to look in the sky (direction and altitude).
4. Provide a reliable experience on mobile and desktop browsers.
5. Respect user privacy for location data.

### 2.2 Non-Goals (For v1)
1. Deep-sky object catalogs (galaxies, nebulae, clusters).
2. Telescope control or astrophotography workflows.
3. AR sky overlay using camera.
4. Historical simulation beyond a 7-day planning window.

## 3. Target Users
1. Casual skywatchers who want quick answers.
2. Students and educators needing simple astronomy information.
3. Hobby astronomers planning short observing sessions.

## 4. User Stories
1. As a user, I want to allow location access so the app can personalize planet visibility.
2. As a user, I want to manually set a location if I deny GPS or need another city.
3. As a user, I want to see which planets are visible now so I can start observing immediately.
4. As a user, I want to view visibility conditions (altitude, direction, brightness hint) so I know whether it is worth trying.
5. As a user, I want a timeline for tonight so I can plan the best viewing times.
6. As a user, I want weather/cloudiness context so I understand if visibility is physically possible.

## 5. Scope

### 5.1 In Scope (v1)
1. Browser-based location acquisition (with explicit consent).
2. Manual location search and selection.
3. Current visible planets list for Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune.
4. Per-planet details: azimuth, altitude, rise/set, peak time, apparent magnitude, visibility status.
5. Tonight timeline view (hourly visibility states).
6. Local timezone handling.
7. Basic weather overlay (cloud cover, optional but included if API is available).
8. Accessibility and responsive layout.

### 5.2 Out Of Scope (v1)
1. Account creation and user profiles.
2. Push notifications and alerts.
3. Native mobile apps.
4. Offline ephemeris downloads.

## 6. Assumptions
1. User device clock is reasonably accurate.
2. Internet is available for ephemeris/weather API calls.
3. Third-party astronomy data source offers sufficient precision for consumer use.
4. Horizon obstruction by buildings/mountains is not modeled in v1.

## 7. Functional Requirements

### FR-01 Location Permission And Retrieval
1. The system shall request geolocation permission on first use.
2. The system shall handle states: granted, denied, unavailable, timeout.
3. If granted, the system shall capture latitude and longitude with available accuracy metadata.
4. The system shall not store raw location on the server by default.

### FR-02 Manual Location Input
1. The system shall provide a location search input (city/place).
2. The system shall allow selecting one result and use its coordinates.
3. The system shall display the currently active location in the header.

### FR-03 Time Context
1. The system shall use the user’s local timezone for display.
2. The system shall allow changing observation time from “Now” to a selected time within the next 7 days.
3. The system shall recalculate all visibility data on time change.
4. The system shall provide a continuous (smooth) time scrubber rather than fixed hourly steps, so positions update fluidly as the control is dragged.
5. The system shall provide a one-tap “Now” reset to return to the current time.

### FR-04 Planet Visibility Calculation
1. The system shall calculate topocentric position for each supported planet.
2. The system shall compute altitude and azimuth for current/selected time.
3. The system shall classify visibility state:
	1. Visible: altitude >= 10 degrees and Sun altitude <= -6 degrees.
	2. Low Horizon: 0 degrees <= altitude < 10 degrees and Sun altitude <= -6 degrees.
	3. Not Visible: altitude < 0 degrees or Sun altitude > -6 degrees.
4. The system shall include apparent magnitude where available.

### FR-05 Planet List View
1. The system shall show a list of all supported planets.
2. The system shall sort by visibility state first, then altitude descending.
3. Each list item shall show:
	1. Planet name
	2. Visibility badge
	3. Direction (compass sector)
	4. Altitude
	5. Rise and set times
4. The system shall let users open detailed view for each planet.

### FR-06 Planet Detail View
1. The system shall display:
	1. Current altitude and azimuth
	2. Rise time, set time, and transit (highest point)
	3. Apparent magnitude
	4. Best viewing window for tonight
	5. Human-readable guidance (example: “Look southeast, about 35 degrees above horizon”).
2. The system shall provide a 24-hour mini chart of altitude trend.

### FR-13 Sky Map (Dome View)
1. The system shall render a circular sky map representing the visible sky dome.
2. The projection shall place the zenith (straight up) at the center and the horizon at the outer edge.
3. Distance from center shall represent altitude; angle around the circle shall represent azimuth (compass direction).
4. The system shall mark the cardinal directions (N, E, S, W) and provide altitude reference rings (for example, 30 and 60 degrees).
5. The system shall plot each planet that is above the horizon as a labeled marker, color-coded by planet and ringed by its visibility state.
6. The system shall draw each planet’s projected path across the sky for the surrounding time window, clipping path segments that fall below the horizon.
7. The system shall move planet markers along their paths in response to the time scrubber.
8. The system shall use a dark (night-sky) background within the dome for contrast, while the surrounding interface remains the light Apple-style theme.
9. Selecting a planet marker shall open that planet’s detail view.

### FR-07 Tonight Timeline
1. The system shall show hourly visibility from local sunset to sunrise.
2. The system shall allow selecting a time slot to update all calculations.
3. The system shall visually mark best hour(s) based on max altitude and dark-sky condition.

### FR-08 Weather Context
1. The system shall display cloud cover percentage for current hour.
2. The system shall show a simple observing quality indicator:
	1. Good: cloud cover < 30%
	2. Fair: 30% to 70%
	3. Poor: > 70%
3. If weather data is unavailable, the system shall degrade gracefully and continue astronomical visibility output.

### FR-09 Error Handling
1. The system shall display clear messages for permission denial, API failure, and no location match.
2. The system shall provide user actions in each error state (retry, manual location, refresh).

### FR-10 Accessibility
1. The system shall meet WCAG 2.1 AA for key interactions.
2. All controls shall be keyboard accessible.
3. Charts shall have text equivalents.
4. Color shall not be the only channel for visibility status.

### FR-11 Privacy And Data Handling
1. The system shall request location only when needed.
2. The system shall avoid persistent storage of precise coordinates unless user opts in.
3. The system shall provide a short privacy notice near location request.

### FR-12 Visual Design System (Apple-Inspired)
1. The system shall implement a clean, Apple-inspired interface with a crisp white primary background.
2. The system shall use generous whitespace, clear visual hierarchy, and minimal chrome.
3. The system shall use soft corner radii for cards and controls (target 12 to 16 px range).
4. The system shall use subtle shadows and separators to create depth without heavy borders.
5. The system shall use a neutral color palette with restrained accent colors for state feedback.
6. The system shall use iconography consistent with Apple-like visual language:
	1. Rounded, simple line icons with consistent stroke width.
	2. Icons must be sourced from properly licensed sets (for example, SF Symbols where license permits, or open-source alternatives with similar style).
	3. Planet status icons must be semantically meaningful and paired with text labels.
7. The system shall preserve readability and contrast under bright daylight viewing conditions.
8. The system shall apply motion conservatively:
	1. Short, smooth transitions (150 to 250 ms).
	2. No distracting animations that interfere with scanning data.

## 8. Non-Functional Requirements
1. Performance:
	1. Initial load under 3 seconds on typical 4G mobile.
	2. Recalculation under 500 ms after location/time change.
2. Availability:
	1. 99.5% monthly uptime target for backend API endpoints.
3. Reliability:
	1. Fallback UI when one dependency fails.
4. Security:
	1. HTTPS only.
	2. Input validation and rate limiting on server endpoints.
5. Localization readiness:
	1. Text and date formats designed for future i18n.
6. Design consistency:
	1. All core pages shall follow a shared design token system for color, spacing, radius, elevation, and icon size.
	2. UI implementation shall remain visually consistent between mobile and desktop breakpoints.

## 9. Calculations And Rules
1. Use topocentric coordinates based on observer latitude/longitude.
2. Convert azimuth degrees to 16-point compass labels (N, NNE, NE, ...).
3. Civil twilight threshold for practical visibility: Sun altitude <= -6 degrees.
4. Default visibility cutoff altitude: >= 10 degrees.
5. “Best time tonight” = hour where planet altitude is maximal while Sun altitude <= -6 degrees.

## 10. Data Sources And Dependencies
1. Astronomy ephemeris source (example: astronomy API or internal calculation engine).
2. Geocoding service for manual location search.
3. Weather provider for cloud cover.
4. Timezone lookup utility where required.

## 11. Information Architecture
1. Home Screen
	1. Location summary
	2. Circular sky map (dome view) with planet markers and paths
	3. Continuous time scrubber with “Now” reset
	4. “Visible now” planet cards/list
	5. Quick weather badge
2. Planet Detail Screen
	1. Planet facts and current position
	2. Altitude timeline
	3. Guidance text
3. Settings Panel
	1. Location method (GPS/manual)
	2. Unit preferences (12h/24h time)

## 12. Primary User Flows

### Flow A: First-Time User (Location Granted)
1. User opens app.
2. App asks for location permission.
3. User grants permission.
4. App calculates planet visibility for now.
5. App displays visible planets and details.

### Flow B: Permission Denied
1. User opens app and denies location.
2. App shows “Use manual location” prompt.
3. User searches and selects city.
4. App displays planet visibility for selected location.

### Flow C: Planning Tonight
1. User opens timeline.
2. User taps future hour.
3. App recalculates and updates all planet statuses.
4. User opens one planet detail and checks best viewing window.

## 13. API Contract (Logical)

### GET /api/visibility
Query parameters:
1. lat (float)
2. lon (float)
3. datetime (ISO 8601)

Response (example shape):
1. location: name, lat, lon, timezone
2. sun: altitude, twilightState
3. planets: array of
	1. name
	2. altitudeDeg
	3. azimuthDeg
	4. azimuthLabel
	5. riseTimeLocal
	6. setTimeLocal
	7. transitTimeLocal
	8. magnitude
	9. visibilityState
4. generatedAt

### GET /api/timeline
Query parameters:
1. lat
2. lon
3. date (local date)

Response:
1. hourly points from sunset to sunrise
2. per-planet visibility state per hour

## 14. Edge Cases
1. Polar regions with midnight sun or polar night.
2. Planets with no rise/set event on specific dates at extreme latitudes.
3. User clock skew creating inconsistent results.
4. Weather API timeout.
5. Location search ambiguity (multiple cities with same name).

## 15. Acceptance Criteria
1. Given valid location and current time, app returns statuses for all 7 planets.
2. When user changes location, all visibility values refresh without page reload.
3. When user changes time, list and detail views stay consistent.
4. When geolocation is denied, manual location flow remains fully functional.
5. At least one accessibility audit run passes WCAG 2.1 AA checks for core pages.
6. If weather data fails, astronomical data still displays and includes a non-blocking warning.
7. Core pages use a clean white visual style with consistent card radii, spacing, and subtle elevation.
8. All icons follow a single Apple-like line style and are sourced from licensed icon libraries.
9. In usability review, first-time users can identify visibility status and primary actions within 5 seconds on mobile and desktop.
10. The sky map places the zenith at the center and the horizon at the edge, with correct cardinal directions and visible planets plotted by altitude and azimuth.
11. Dragging the time scrubber smoothly moves planet markers along their paths without perceptible stepping.
12. The sky map uses a dark background while the rest of the interface keeps the light Apple-style theme.

## 16. Analytics Events (Optional For v1)
1. location_permission_prompt_shown
2. location_permission_granted
3. location_permission_denied
4. manual_location_selected
5. planet_detail_opened
6. timeline_hour_selected

## 17. Future Enhancements (Post-v1)
1. Moon phase and illumination.
2. ISS pass predictions.
3. Notification reminders for best viewing windows.
4. AR sky pointer.
5. User-saved favorite locations.

## 18. Risks And Mitigations
1. Risk: Inaccurate third-party ephemeris data.
	Mitigation: Validate against trusted astronomical references and include data provider SLA checks.
2. Risk: Low user trust if “visible” but blocked by clouds.
	Mitigation: Always show weather context with confidence messaging.
3. Risk: Privacy concerns about location use.
	Mitigation: Explicit consent and minimal retention policy.

## 19. Release Checklist
1. Functional QA for all user flows.
2. Cross-browser testing (Safari, Chrome, Firefox, Edge latest).
3. Responsive testing on major mobile breakpoints.
4. Accessibility audit and remediation.
5. Performance benchmark pass.
6. Production monitoring and error tracking enabled.