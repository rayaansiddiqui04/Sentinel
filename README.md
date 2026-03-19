# Sentinel

Real-time Chicago crime intelligence platform with predictive risk modeling, AI-powered briefings, and network link analysis.

**Live Demo:** [sentinel-one-xi.vercel.app](https://sentinel-one-xi.vercel.app)

## Overview

Sentinel is a crime intelligence dashboard built on 50,000+ real incidents from the Chicago Police Department API. It combines geospatial visualization, statistical pattern modeling, and AI-powered analysis to transform raw crime data into actionable intelligence.

## Features

- **Interactive Crime Map** — Plot incidents on a dark-themed Chicago map with severity-coded markers, filterable by crime type and severity level
- **Heatmap Mode** — Density overlay showing crime concentration across neighborhoods
- **Historical Risk Forecast** — Scores community areas by crime frequency for the current day-of-week and hour using year-to-date CPD data, overlaying colored risk zones on the map
- **Network Link Analysis** — Identifies clusters of similar crimes occurring within close proximity and timeframe, surfacing potential serial activity
- **AI Incident Briefings** — Generates neighborhood-level tactical intelligence reports powered by natural language AI
- **AI Chatbot** — Ask questions about crime patterns, neighborhoods, and safety insights
- **Analyst View** — Detailed breakdowns of crime data with filtering and sorting
- **Safety Rankings** — Community area rankings by crime volume and severity
- **Live Incident Feed** — Real-time stream of reported incidents

## Tech Stack

- **Frontend:** React (Vite)
- **Mapping:** React-Leaflet with CartoDB Dark Matter tiles
- **AI:** OpenAI API for briefings and chatbot
- **Data:** Chicago Police Department API (~50K incidents, updated with ~7-day reporting lag)
- **Deployment:** Vercel

## Data Source

All incident data is sourced from the Chicago Police Department's public API. The data has an approximate 7-day reporting lag from the time of incident to availability in the API. The Historical Risk Forecast accounts for this by using year-to-date pattern analysis rather than real-time prediction.
```"

