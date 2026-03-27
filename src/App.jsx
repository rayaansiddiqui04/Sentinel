import { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { SEVERITY, WEIGHTS, DOW_LABELS, DOW_NAMES, LINK_COLORS } from './constants'
import { COMMUNITY_AREAS, formatHourLabel, getSeverityLabel, getSafetyScore } from './utils'
import OverviewTab from './components/OverviewTab'
import AnalystTab from './components/AnalystTab'
import RankingsTab from './components/RankingsTab'
import CompareTab from './components/CompareTab'
import MapTab from './components/MapTab'
import LiveFeed from './components/LiveFeed'
import ChatBot from './components/ChatBot'
import AIBriefing from './components/AIBriefing'

export default function App() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [pulse, setPulse] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [feedLimit, setFeedLimit] = useState(50)
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiOpen, setAiOpen] = useState(true)
  const [mapSeverityFilter, setMapSeverityFilter] = useState(["CRITICAL","HIGH","MEDIUM","LOW"])
  const [compareA, setCompareA] = useState("")
  const [compareB, setCompareB] = useState("")
  const [mapMarkerLimit, setMapMarkerLimit] = useState(100)
  const [mapCustomLimit, setMapCustomLimit] = useState("")
  const [mapViewMode, setMapViewMode] = useState("live")
  const [aiMessages, setAiMessages] = useState([])
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [briefingArea, setBriefingArea] = useState("")
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [briefingResponse, setBriefingResponse] = useState("")
  const [briefingStats, setBriefingStats] = useState(null)
  const [briefingError, setBriefingError] = useState("")

  const fetchData = () => {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const dateStr = sixMonthsAgo.toISOString().split('T')[0]
    fetch(`https://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=50000&$order=date%20DESC&$where=date%20>%20'${dateStr}T00:00:00.000'`)
      .then(r => r.json())
      .then(data => {
        setIncidents(data)
        setLoading(false)
        setLastUpdated(new Date())
        setPulse(true)
        setTimeout(() => setPulse(false), 1000)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const aiAutoCloseTimer = useRef(null)

  useEffect(() => {
    aiAutoCloseTimer.current = setTimeout(() => setAiOpen(false), 10000)
    return () => clearTimeout(aiAutoCloseTimer.current)
  }, [])

  const matchesCurrentControls = (incident) => {
    if (typeFilter !== "ALL" && incident.primary_type !== typeFilter) return false
    if (searchQuery !== "" && (!incident.block || !incident.block.toLowerCase().includes(searchQuery.toLowerCase()))) return false
    if (!startDate && !endDate) return true
    if (!incident.date) return false
    const incidentDate = new Date(incident.date)
    if (startDate && incidentDate < startDate) return false
    if (endDate && incidentDate > endDate) return false
    return true
  }

  const filtered = incidents
    .filter(i => neighborhoodFilter === "ALL" || i.community_area === neighborhoodFilter)
    .filter(matchesCurrentControls)

  const total = filtered.length
  const critical = filtered.filter(i => (SEVERITY[i.primary_type] || 1) >= 4)
  const arrests = filtered.filter(i => i.arrest === "true" || i.arrest === true)
  const arrestRate = total > 0 ? Math.round((arrests.length / total) * 100) : 0
  const safety = getSafetyScore(filtered, incidents, neighborhoodFilter)

  const neighborhoodCounts = {}
  filtered.forEach(i => {
    if (i.community_area) neighborhoodCounts[i.community_area] = (neighborhoodCounts[i.community_area] || 0) + 1
  })
  const topNeighborhood = Object.entries(neighborhoodCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  const typeCounts = {}
  filtered.forEach(i => {
    if (i.primary_type) typeCounts[i.primary_type] = (typeCounts[i.primary_type] || 0) + 1
  })
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  const hourCounts = Array(24).fill(0)
  filtered.forEach(i => {
    if (i.date) hourCounts[new Date(i.date).getHours()]++
  })

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
  const peakHourLabel = formatHourLabel(peakHour)

  const allNeighborhoods = [...new Set(incidents.map(i => i.community_area).filter(Boolean))]
    .map(n => ({ id: String(n), name: COMMUNITY_AREAS[String(n)] || `AREA ${n}` }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const allTypes = [...new Set(incidents.map(i => i.primary_type).filter(Boolean))].sort()

  const maxHour = Math.max(...hourCounts)
  const maxType = Math.max(...(Object.values(typeCounts).length ? Object.values(typeCounts) : [1]))
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const selectedNeighborhoodName = neighborhoodFilter === "ALL" ? "All of Chicago" : (COMMUNITY_AREAS[neighborhoodFilter] || neighborhoodFilter)

  const dowCounts = Array(7).fill(0)
  filtered.forEach(i => { if (i.date) dowCounts[new Date(i.date).getDay()]++ })
  const maxDow = Math.max(...dowCounts)

  const weekTrend = (() => {
    const weeks = []
    for (let w = 7; w >= 0; w--) {
      const start = new Date(); start.setDate(start.getDate() - (w + 1) * 7); start.setHours(0,0,0,0)
      const end = new Date(); end.setDate(end.getDate() - w * 7); end.setHours(0,0,0,0)
      const count = filtered.filter(i => { if (!i.date) return false; const d = new Date(i.date); return d >= start && d < end }).length
      const label = `${start.getMonth()+1}/${start.getDate()}`
      weeks.push({ label, count })
    }
    return weeks
  })()
  const maxWeek = Math.max(...weekTrend.map(w => w.count), 1)
  const prevWeek = weekTrend[weekTrend.length - 2]?.count || 0
  const curWeek = weekTrend[weekTrend.length - 1]?.count || 0
  const weekChange = prevWeek > 0 ? Math.round(((curWeek - prevWeek) / prevWeek) * 100) : 0

  const riskForecast = (() => {
    const now = new Date()
    const currentDow = now.getDay()
    const currentHour = now.getHours()
    const dowLabel = DOW_NAMES[currentDow]
    const hourLabel = currentHour === 0 ? "12am" : currentHour < 12 ? `${currentHour}am` : currentHour === 12 ? "12pm" : `${currentHour - 12}pm`

    const areaCounts = {}
    const areaCentroids = {}

    incidents.forEach(i => {
      if (!i.date || !i.community_area || !i.latitude || !i.longitude) return
      if (neighborhoodFilter !== "ALL" && i.community_area !== neighborhoodFilter) return
      const area = i.community_area
      const lat = parseFloat(i.latitude)
      const lng = parseFloat(i.longitude)
      if (isNaN(lat) || isNaN(lng)) return

      if (!areaCentroids[area]) areaCentroids[area] = { latSum: 0, lngSum: 0, count: 0 }
      areaCentroids[area].latSum += lat
      areaCentroids[area].lngSum += lng
      areaCentroids[area].count++

      if (new Date(i.date).getDay() === currentDow && new Date(i.date).getHours() === currentHour) {
        areaCounts[area] = (areaCounts[area] || 0) + 1
      }
    })

    if (neighborhoodFilter !== "ALL") {
      const count = areaCounts[neighborhoodFilter] || 0
      const c = areaCentroids[neighborhoodFilter]
      const noData = count < 3
      if (!c) return { areas: [], dowLabel, hourLabel, noData: true }
      const color = count >= 10 ? "#ff2d2d" : count >= 5 ? "#ff6b00" : "#f5c400"
      const tier = count >= 10 ? "HIGH RISK" : count >= 5 ? "ELEVATED" : "MODERATE"
      return {
        areas: noData ? [] : [{ area: neighborhoodFilter, name: COMMUNITY_AREAS[neighborhoodFilter] || neighborhoodFilter, count, lat: c.latSum / c.count, lng: c.lngSum / c.count, color, tier }],
        dowLabel, hourLabel, noData,
      }
    }

    const scored = Object.entries(areaCounts)
      .map(([area, count]) => {
        const c = areaCentroids[area]
        if (!c || c.count === 0) return null
        return { area, name: COMMUNITY_AREAS[area] || `Area ${area}`, count, lat: c.latSum / c.count, lng: c.lngSum / c.count }
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
      .map((item, i) => ({ ...item, color: i < 5 ? "#ff2d2d" : i < 10 ? "#ff6b00" : "#f5c400", tier: i < 5 ? "HIGH RISK" : i < 10 ? "ELEVATED" : "MODERATE" }))

    return { areas: scored, dowLabel, hourLabel, noData: false }
  })()

  const linkClusters = (() => {
    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 3958.8
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    }

    const pts = filtered
      .filter(i => i.latitude && i.longitude && i.date && i.primary_type)
      .slice(0, 5000)
      .map(i => ({ ...i, _lat: parseFloat(i.latitude), _lng: parseFloat(i.longitude), _ts: new Date(i.date).getTime() }))
      .filter(i => !isNaN(i._lat) && !isNaN(i._lng))
      .sort((a, b) => b._ts - a._ts)

    const THREE_HOURS = 3 * 60 * 60 * 1000
    const used = new Set()
    const rawClusters = []

    for (let i = 0; i < pts.length; i++) {
      if (used.has(i)) continue
      const anchor = pts[i]
      const members = [i]
      for (let j = i + 1; j < pts.length; j++) {
        if (Math.abs(anchor._ts - pts[j]._ts) > THREE_HOURS) continue
        if (pts[j].primary_type !== anchor.primary_type) continue
        if (haversine(anchor._lat, anchor._lng, pts[j]._lat, pts[j]._lng) <= 0.5) {
          members.push(j)
        }
      }
      if (members.length >= 3) {
        members.forEach(idx => used.add(idx))
        rawClusters.push(members.map(idx => pts[idx]))
      }
    }

    return rawClusters
      .sort((a, b) => b.length - a.length)
      .slice(0, 15)
      .map((clusterIncidents, colorIdx) => {
        const color = LINK_COLORS[colorIdx % LINK_COLORS.length]
        const times = clusterIncidents.map(i => i._ts)
        const minTime = new Date(Math.min(...times))
        const maxTime = new Date(Math.max(...times))
        const areas = [...new Set(clusterIncidents.map(i => COMMUNITY_AREAS[i.community_area] || i.community_area).filter(Boolean))]
        const centLat = clusterIncidents.reduce((s, i) => s + i._lat, 0) / clusterIncidents.length
        const centLng = clusterIncidents.reduce((s, i) => s + i._lng, 0) / clusterIncidents.length
        const radiusMi = Math.max(...clusterIncidents.map(i => haversine(centLat, centLng, i._lat, i._lng)))
        const spanMin = Math.round((maxTime - minTime) / 60000)
        const spanLabel = spanMin < 60 ? `${spanMin}m` : `${Math.round(spanMin/60)}h ${spanMin%60}m`
        return { incidents: clusterIncidents, color, type: clusterIncidents[0].primary_type, areas, minTime, maxTime, spanLabel, radiusMi: radiusMi.toFixed(2) }
      })
  })()

  const trendAlerts = (() => {
    const alerts = []
    const thisWeekStart = new Date(); thisWeekStart.setDate(thisWeekStart.getDate() - 14); thisWeekStart.setHours(0,0,0,0)
    const thisWeekEnd = new Date(); thisWeekEnd.setDate(thisWeekEnd.getDate() - 7); thisWeekEnd.setHours(0,0,0,0)
    const prevWeekStart = new Date(); prevWeekStart.setDate(prevWeekStart.getDate() - 21); prevWeekStart.setHours(0,0,0,0)

    const thisWeekDays = 7
    const prevWeekDays = 7

    const thisWeekByType = {}
    const prevWeekByType = {}
    const thisWeekByArea = {}
    const prevWeekByArea = {}
    incidents.forEach(i => {
      if (!i.date) return
      const d = new Date(i.date)
      if (d >= thisWeekStart && d < thisWeekEnd) {
        if (i.primary_type) thisWeekByType[i.primary_type] = (thisWeekByType[i.primary_type] || 0) + 1
        if (i.community_area) thisWeekByArea[i.community_area] = (thisWeekByArea[i.community_area] || 0) + 1
      } else if (d >= prevWeekStart && d < thisWeekStart) {
        if (i.primary_type) prevWeekByType[i.primary_type] = (prevWeekByType[i.primary_type] || 0) + 1
        if (i.community_area) prevWeekByArea[i.community_area] = (prevWeekByArea[i.community_area] || 0) + 1
      }
    })

    Object.entries(thisWeekByType).forEach(([type, count]) => {
      const prev = prevWeekByType[type] || 0
      if (prev < 5) return
      const thisRate = count / thisWeekDays
      const prevRate = prev / prevWeekDays
      const pct = Math.round(((thisRate - prevRate) / prevRate) * 100)
      const thisPerWeek = Math.round(thisRate * 7)
      if (pct >= 30) alerts.push({ text: `${type} up ${pct}% last week vs prior week (${prev} → ${thisPerWeek})`, color: "#ff2d2d", icon: "▲" })
      else if (pct <= -30 && count >= 3) alerts.push({ text: `${type} down ${Math.abs(pct)}% last week vs prior week (${prev} → ${thisPerWeek})`, color: "#4caf50", icon: "▼" })
    })

    Object.entries(thisWeekByArea).forEach(([area, count]) => {
      const prev = prevWeekByArea[area] || 0
      if (prev < 10) return
      const name = COMMUNITY_AREAS[area] || area
      const thisRate = count / thisWeekDays
      const prevRate = prev / prevWeekDays
      const pct = Math.round(((thisRate - prevRate) / prevRate) * 100)
      const thisPerWeek = Math.round(thisRate * 7)
      if (pct >= 30) alerts.push({ text: `${name} up ${pct}% last week vs prior week (${prev} → ${thisPerWeek})`, color: "#ff6b00", icon: "▲" })
      else if (pct <= -30 && count >= 5) alerts.push({ text: `${name} down ${Math.abs(pct)}% last week vs prior week (${prev} → ${thisPerWeek})`, color: "#4caf50", icon: "▼" })
    })

    if (weekChange >= 15) alerts.unshift({ text: `Overall incidents up ${weekChange}% last week vs prior week`, color: "#ff2d2d", icon: "▲" })
    else if (weekChange <= -15) alerts.unshift({ text: `Overall incidents down ${Math.abs(weekChange)}% last week vs prior week`, color: "#4caf50", icon: "▼" })

    return alerts.sort((a, b) => {
      const aNum = parseInt(a.text.match(/\d+%/)?.[0]) || 0
      const bNum = parseInt(b.text.match(/\d+%/)?.[0]) || 0
      return bNum - aNum
    }).slice(0, 4)
  })()

  const getNeighborhoodStats = (areaId) => {
    if (!areaId) return null
    const areaIncidents = incidents.filter(i => i.community_area === areaId)
    if (!areaIncidents.length) return null
    const aTotal = areaIncidents.length
    const aArrests = areaIncidents.filter(i => i.arrest === "true" || i.arrest === true).length
    const aArrestRate = Math.round((aArrests / aTotal) * 100)
    const aCritical = areaIncidents.filter(i => (SEVERITY[i.primary_type] || 1) >= 4).length
    const aTypes = {}
    areaIncidents.forEach(i => { if (i.primary_type) aTypes[i.primary_type] = (aTypes[i.primary_type] || 0) + 1 })
    const aTopTypes = Object.entries(aTypes).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const aHours = Array(24).fill(0)
    areaIncidents.forEach(i => { if (i.date) aHours[new Date(i.date).getHours()]++ })
    const aPeakHour = aHours.indexOf(Math.max(...aHours))
    const aPeakLabel = formatHourLabel(aPeakHour)
    const aSafety = getSafetyScore(areaIncidents, incidents, areaId)
    const aMaxType = Math.max(...Object.values(aTypes), 1)
    return { total: aTotal, arrestRate: aArrestRate, critical: aCritical, topTypes: aTopTypes, peakHour: aPeakLabel, safety: aSafety, maxType: aMaxType, name: COMMUNITY_AREAS[areaId] || areaId }
  }

  const briefingNeighborhoods = Object.entries(COMMUNITY_AREAS)
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const getBriefingStats = (areaId) => {
    if (!areaId) return null

    const areaIncidents = incidents
      .filter(matchesCurrentControls)
      .filter(i => i.community_area === areaId)

    const neighborhood = COMMUNITY_AREAS[areaId] || areaId
    const totalIncidents = areaIncidents.length
    if (!totalIncidents) return { neighborhood, communityArea: areaId, totalIncidents: 0 }

    const crimeTypeCounts = {}
    const bHourCounts = Array(24).fill(0)
    const dayCounts = Array(7).fill(0)
    const blockCounts = {}
    const locationCounts = {}
    const monthCounts = {}
    let arrestsCount = 0

    areaIncidents.forEach((incident) => {
      if (incident.primary_type) {
        crimeTypeCounts[incident.primary_type] = (crimeTypeCounts[incident.primary_type] || 0) + 1
      }

      if (incident.arrest === "true" || incident.arrest === true) arrestsCount++

      if (incident.block) {
        blockCounts[incident.block] = (blockCounts[incident.block] || 0) + 1
      }

      if (incident.location_description) {
        locationCounts[incident.location_description] = (locationCounts[incident.location_description] || 0) + 1
      }

      if (incident.date) {
        const date = new Date(incident.date)
        const hour = date.getHours()
        const day = date.getDay()
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        bHourCounts[hour]++
        dayCounts[day]++
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
      }
    })

    const crimeTypeBreakdown = Object.entries(crimeTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        type,
        count,
        sharePct: Math.round((count / totalIncidents) * 100),
      }))

    const busiestHours = bHourCounts
      .map((count, hour) => ({ hour: formatHourLabel(hour), count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const busiestDays = dayCounts
      .map((count, index) => ({ day: DOW_NAMES[index], count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const sortedMonths = Object.entries(monthCounts).sort((a, b) => a[0].localeCompare(b[0]))
    const monthOverMonthTrend = sortedMonths.length >= 2
      ? (() => {
          const [previousMonth, previousCount] = sortedMonths[sortedMonths.length - 2]
          const [currentMonth, currentCount] = sortedMonths[sortedMonths.length - 1]
          const changePct = previousCount > 0 ? Math.round(((currentCount - previousCount) / previousCount) * 100) : null
          return {
            previousMonth,
            previousCount,
            currentMonth,
            currentCount,
            changePct,
            direction: changePct === null ? "flat" : changePct > 0 ? "up" : changePct < 0 ? "down" : "flat",
          }
        })()
      : null

    const topBlock = Object.entries(blockCounts).sort((a, b) => b[1] - a[1])[0]
    const topLocationDescription = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]
    const commonPlace = (() => {
      if (topBlock && topLocationDescription) {
        return topBlock[1] >= topLocationDescription[1]
          ? { kind: "block", value: topBlock[0], count: topBlock[1] }
          : { kind: "location_description", value: topLocationDescription[0], count: topLocationDescription[1] }
      }
      if (topBlock) return { kind: "block", value: topBlock[0], count: topBlock[1] }
      if (topLocationDescription) return { kind: "location_description", value: topLocationDescription[0], count: topLocationDescription[1] }
      return null
    })()

    return {
      neighborhood,
      communityArea: areaId,
      totalIncidents,
      arrestRatePct: Math.round((arrestsCount / totalIncidents) * 100),
      crimeTypeBreakdown,
      busiestHours,
      busiestDays,
      monthOverMonthTrend,
      mostCommonPlace: commonPlace,
      totalArrests: arrestsCount,
      currentDashboardFilters: {
        type: typeFilter,
        startDate: startDate ? startDate.toLocaleDateString() : null,
        endDate: endDate ? endDate.toLocaleDateString() : null,
        blockSearch: searchQuery || null,
      },
    }
  }

  const callAskApi = async (payload) => {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const raw = await response.text()
    let data = {}

    if (raw) {
      try {
        data = JSON.parse(raw)
      } catch {
        throw new Error(raw.slice(0, 200) || "API returned invalid JSON.")
      }
    }

    if (!response.ok) {
      throw new Error(data.error || `API request failed with ${response.status}.`)
    }

    return data
  }

  const chartTitle = startDate || endDate
    ? `${startDate ? startDate.toLocaleDateString() : '...'} → ${endDate ? endDate.toLocaleDateString() : '...'}`
    : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const rankingsData = (() => {
    const nScores = {}
    incidents.forEach(i => {
      if (!i.community_area) return
      if (!nScores[i.community_area]) nScores[i.community_area] = { total: 0, weightedScore: 0, homicides: 0 }
      nScores[i.community_area].total++
      nScores[i.community_area].weightedScore += (WEIGHTS[i.primary_type] || 5)
      if (i.primary_type === "HOMICIDE") nScores[i.community_area].homicides++
    })
    const rates = Object.entries(nScores)
      .filter(([, n]) => n.total >= 20)
      .map(([id, n]) => ({ id, rate: n.weightedScore / n.total, total: n.total, homicides: n.homicides }))
    if (!rates.length) return []
    const minRate = Math.min(...rates.map(n => n.rate))
    const maxRate = Math.max(...rates.map(n => n.rate))
    return rates
      .map(n => {
        const normalized = maxRate === minRate ? 0.5 : (n.rate - minRate) / (maxRate - minRate)
        const score = Math.round(95 - normalized * 75)
        const color = score >= 75 ? "#4caf50" : score >= 60 ? "#f5c400" : score >= 45 ? "#ff6b00" : "#ff2d2d"
        const label = score >= 75 ? "Low Risk" : score >= 60 ? "Moderate" : score >= 45 ? "High Risk" : "Very High Risk"
        return { id: n.id, name: COMMUNITY_AREAS[n.id] || `AREA ${n.id}`, score, color, label, total: n.total, homicides: n.homicides }
      })
      .sort((a, b) => b.score - a.score)
  })()

  const askAI = async () => {
    if (!aiQuestion.trim()) return
    const question = aiQuestion
    setAiQuestion("")
    setAiMessages(prev => [...prev, { role: "user", content: question }])
    setAiLoading(true)

    const crimesByNeighborhood = {}
    incidents.forEach(i => {
      if (i.community_area) {
        const name = COMMUNITY_AREAS[i.community_area] || i.community_area
        if (!crimesByNeighborhood[name]) crimesByNeighborhood[name] = {}
        crimesByNeighborhood[name].total = (crimesByNeighborhood[name].total || 0) + 1
        if (i.primary_type) {
          crimesByNeighborhood[name][i.primary_type] = (crimesByNeighborhood[name][i.primary_type] || 0) + 1
        }
      }
    })

    const neighborhoodDetails = Object.entries(crimesByNeighborhood)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 20)
      .map(([name, crimes]) => {
        const { total: t, ...crimeTypes } = crimes
        const crimeBreakdown = Object.entries(crimeTypes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([type, count]) => `${type}: ${count}`)
          .join(", ")
        return `${name} (${t} total): ${crimeBreakdown}`
      })
      .join("\n")

    const rankingsList = rankingsData
      .map((n, i) => `#${i + 1} ${n.name}: score ${n.score} (${n.label})`)
      .join("\n")

    const homicideList = incidents
      .filter(i => i.primary_type === "HOMICIDE")
      .slice(0, 30)
      .map(i => {
        const name = COMMUNITY_AREAS[i.community_area] || i.community_area
        const block = i.block || "unknown block"
        const date = i.date ? new Date(i.date).toLocaleDateString() : "unknown date"
        return name + " | " + block + " | " + date
      })
      .join("\n")

    const mapVisibleIncidents = filtered
      .filter(i => i.latitude && i.longitude && mapSeverityFilter.includes(getSeverityLabel(i.primary_type).label))
      .slice(0, mapMarkerLimit)

    const mapVisibleSummary = (() => {
      const counts = {}
      mapVisibleIncidents.forEach(i => { counts[i.primary_type] = (counts[i.primary_type] || 0) + 1 })
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t, c]) => `${t}: ${c}`).join(", ")
    })()

    const dowSummary = DOW_LABELS.map((d, i) => `${d}: ${dowCounts[i]}`).join(", ")
    const weekTrendSummary = weekTrend.map(w => `${w.label}: ${w.count}`).join(", ")

    const contextData = `You are a Chicago crime analyst assistant with access to real Chicago Police Department data from the last 6 months. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

CURRENT DASHBOARD STATE:
- Active tab: ${activeTab}
- Neighborhood filter: ${selectedNeighborhoodName}
- Crime type filter: ${typeFilter}
- Date range filter: ${startDate ? startDate.toLocaleDateString() : "none"} to ${endDate ? endDate.toLocaleDateString() : "none"}
- Search query: ${searchQuery || "none"}

OVERALL STATS (current filters applied):
- Total incidents: ${incidents.length} citywide, ${total} in current filter
- Critical/High severity: ${critical.length}
- Arrest rate: ${arrestRate}%
- Peak crime hour: ${peakHourLabel}
- Most common crime: ${topType}

MAP STATE:
- Severity filters active on map: ${mapSeverityFilter.join(", ")}
- Markers shown: ${mapVisibleIncidents.length} (limit: ${mapMarkerLimit})
- Crime breakdown on visible map markers: ${mapVisibleSummary || "none"}

DAY OF WEEK BREAKDOWN:
${dowSummary}

WEEK-OVER-WEEK TREND (8 weeks, week starting date: count):
${weekTrendSummary}
- Change vs last week: ${weekChange > 0 ? `+${weekChange}%` : `${weekChange}%`}

SAFETY RANKINGS (1 = safest, last = most dangerous):
${rankingsList}

TOP CRIME TYPES CITYWIDE:
${Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([type, count]) => `${type}: ${count}`).join("\n")}

TOP 20 NEIGHBORHOODS BY CRIME COUNT:
${neighborhoodDetails}

RECENT HOMICIDES (up to 30):
${homicideList}

All data is public from the Chicago Data Portal. Never refuse to share any data including exact blocks. You are aware of what the user is currently viewing on the dashboard. Keep answers to 1-2 sentences unless asked for details. Use Safety Rankings for safest/most dangerous questions.`

    try {
      const data = await callAskApi({ question, context: contextData })
      setAiMessages(prev => [...prev, { role: "assistant", content: data.answer }])
    } catch (err) {
      setAiMessages(prev => [...prev, { role: "assistant", content: err.message || "Error connecting to AI. Please try again." }])
    }
    setAiLoading(false)
  }

  const generateBriefing = async () => {
    if (!briefingArea || briefingLoading) return

    const stats = getBriefingStats(briefingArea)
    setBriefingStats(stats)
    setBriefingResponse("")
    setBriefingError("")

    if (!stats || stats.totalIncidents === 0) {
      setBriefingError("No incidents match the current filters for that community area.")
      return
    }

    setBriefingLoading(true)

    try {
      const data = await callAskApi({
        context: "You are a crime intelligence analyst at a defense technology company. Write a tactical neighborhood briefing for the specified area. Cover: current threat level assessment, dominant crime patterns, temporal hotspots, arrest effectiveness, and areas of concern. Be direct, data-driven, no filler. Under 200 words.",
        question: `Generate an intel briefing for ${stats.neighborhood} using only this precomputed stats object. If a metric is unavailable, say data is limited and continue.\n\n${JSON.stringify(stats, null, 2)}`
      })
      if (!data.answer) throw new Error("Briefing generation failed.")
      setBriefingResponse(data.answer)
    } catch (error) {
      setBriefingError(error.message || "Error generating briefing.")
    } finally {
      setBriefingLoading(false)
    }
  }

  if (loading) return (
    <div style={{ background: "#050508", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
      <div style={{ color: "#5c7cfa", fontFamily: "DM Mono, monospace", fontSize: "24px", fontWeight: "700", letterSpacing: "3px" }}>SENTINEL</div>
      <div className="sentinel-spinner" />
      <div style={{ color: "#3a3a5c", fontFamily: "DM Mono, monospace", fontSize: "13px" }}>Loading Chicago crime data...</div>
    </div>
  )

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#c0c8d8", fontFamily: "DM Mono, monospace", boxSizing: "border-box", width: "100%" }}>

      <div style={{ background: "#0a0a12", borderBottom: "1px solid #1a1a2e", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "3px", color: "#ffffff" }}>SENTINEL</div>
            <div style={{ color: "#3a3a5c", fontSize: "10px", letterSpacing: "1px" }}>Chicago Crime Intelligence Dashboard</div>
          </div>
          <div style={{ display: "flex", gap: "4px", marginLeft: "24px" }}>
            {[
              { id: "overview", label: "Overview" },
              { id: "analyst", label: "Analyst View" },
              { id: "rankings", label: "Safety Rankings" },
              { id: "compare", label: "Compare" },
              { id: "map", label: "Map" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: activeTab === tab.id ? "#5c7cfa" : "transparent",
                border: `1px solid ${activeTab === tab.id ? "#5c7cfa" : "#1a1a2e"}`,
                color: activeTab === tab.id ? "#ffffff" : "#3a3a5c",
                padding: "6px 16px", fontFamily: "DM Mono, monospace", fontSize: "11px",
                cursor: "pointer", letterSpacing: "1px",
              }}>{tab.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => setBriefingOpen(true)} style={{
            background: "#101726",
            border: "1px solid #5c7cfa55",
            color: "#d8e0ff",
            padding: "8px 14px",
            fontFamily: "DM Mono, monospace",
            fontSize: "10px",
            letterSpacing: "1.5px",
            cursor: "pointer"
          }}>
            INTEL BRIEFING
          </button>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#5c7cfa", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: pulse ? "#4caf50" : "#5c7cfa", boxShadow: pulse ? "0 0 8px #4caf50" : "none", transition: "all 0.3s" }} />
              Chicago Data Portal
            </div>
            <div style={{ color: "#3a3a5c", fontSize: "10px", marginTop: "2px" }}>
              Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "..."} · Auto-refresh 60s
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#080810", borderBottom: "1px solid #1a1a2e", padding: "12px 28px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "4px" }}>NEIGHBORHOOD</div>
          <select value={neighborhoodFilter} onChange={e => setNeighborhoodFilter(e.target.value)}
            style={{ background: "#0a0a12", border: "1px solid #1a1a2e", color: "#c0c8d8", padding: "6px 10px", fontFamily: "monospace", fontSize: "11px" }}>
            <option value="ALL">All Neighborhoods</option>
            {allNeighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
        <div>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "4px" }}>CRIME TYPE</div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ background: "#0a0a12", border: "1px solid #1a1a2e", color: "#c0c8d8", padding: "6px 10px", fontFamily: "monospace", fontSize: "11px" }}>
            <option value="ALL">All Types</option>
            {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "4px" }}>FROM</div>
          <DatePicker selected={startDate} onChange={date => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} placeholderText="Start date" isClearable minDate={new Date('2026-01-01')} maxDate={new Date()} popperProps={{ strategy: "fixed" }} portalId="datepicker-portal"
            customInput={<input style={{ background: "#0a0a12", border: "1px solid #1a1a2e", color: "#c0c8d8", padding: "6px 10px", fontFamily: "monospace", fontSize: "11px", width: "110px", cursor: "pointer" }} />} />
        </div>
        <div>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "4px" }}>TO</div>
          <DatePicker selected={endDate} onChange={date => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate || new Date('2026-01-01')} maxDate={new Date()} placeholderText="End date" isClearable popperProps={{ strategy: "fixed" }} portalId="datepicker-portal"
            customInput={<input style={{ background: "#0a0a12", border: "1px solid #1a1a2e", color: "#c0c8d8", padding: "6px 10px", fontFamily: "monospace", fontSize: "11px", width: "110px", cursor: "pointer" }} />} />
        </div>
        <div>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "4px" }}>SEARCH BLOCK</div>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="e.g. MICHIGAN AVE"
            style={{ background: "#0a0a12", border: "1px solid #1a1a2e", color: "#c0c8d8", padding: "6px 10px", fontFamily: "monospace", fontSize: "11px", width: "160px" }} />
        </div>
        <div style={{ marginLeft: "auto", color: "#3a3a5c", fontSize: "10px", alignSelf: "center" }}>
          Showing <span style={{ color: "#5c7cfa" }}>{total}</span> incidents
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {activeTab === "overview" && (
          <OverviewTab
            neighborhoodFilter={neighborhoodFilter}
            safety={safety}
            selectedNeighborhoodName={selectedNeighborhoodName}
            total={total}
            criticalCount={critical.length}
            arrestRate={arrestRate}
            peakHourLabel={peakHourLabel}
            topNeighborhood={topNeighborhood}
            hourCounts={hourCounts}
            peakHour={peakHour}
            maxHour={maxHour}
            topTypes={topTypes}
            maxType={maxType}
            trendAlerts={trendAlerts}
            chartTitle={chartTitle}
          />
        )}
        {activeTab === "analyst" && (
          <AnalystTab
            total={total}
            criticalCount={critical.length}
            arrestRate={arrestRate}
            topNeighborhood={topNeighborhood}
            weekTrend={weekTrend}
            maxWeek={maxWeek}
            weekChange={weekChange}
            dowCounts={dowCounts}
            maxDow={maxDow}
            neighborhoodCounts={neighborhoodCounts}
            filtered={filtered}
          />
        )}
        {activeTab === "map" && (
          <MapTab
            mapViewMode={mapViewMode}
            setMapViewMode={setMapViewMode}
            mapSeverityFilter={mapSeverityFilter}
            setMapSeverityFilter={setMapSeverityFilter}
            mapMarkerLimit={mapMarkerLimit}
            setMapMarkerLimit={setMapMarkerLimit}
            mapCustomLimit={mapCustomLimit}
            setMapCustomLimit={setMapCustomLimit}
            filtered={filtered}
            riskForecast={riskForecast}
            linkClusters={linkClusters}
            neighborhoodFilter={neighborhoodFilter}
          />
        )}
        {activeTab === "rankings" && (
          <RankingsTab
            rankingsData={rankingsData}
            lastUpdated={lastUpdated}
            setNeighborhoodFilter={setNeighborhoodFilter}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "compare" && (
          <CompareTab
            compareA={compareA}
            setCompareA={setCompareA}
            compareB={compareB}
            setCompareB={setCompareB}
            allNeighborhoods={allNeighborhoods}
            getNeighborhoodStats={getNeighborhoodStats}
          />
        )}
      </div>

      <LiveFeed
        filtered={filtered}
        total={total}
        feedLimit={feedLimit}
        setFeedLimit={setFeedLimit}
      />

      <ChatBot
        aiOpen={aiOpen}
        setAiOpen={setAiOpen}
        aiMessages={aiMessages}
        aiQuestion={aiQuestion}
        setAiQuestion={setAiQuestion}
        aiLoading={aiLoading}
        askAI={askAI}
        aiAutoCloseTimer={aiAutoCloseTimer}
      />

      {briefingOpen && (
        <AIBriefing
          setBriefingOpen={setBriefingOpen}
          briefingArea={briefingArea}
          setBriefingArea={setBriefingArea}
          briefingLoading={briefingLoading}
          briefingStats={briefingStats}
          briefingError={briefingError}
          briefingResponse={briefingResponse}
          briefingNeighborhoods={briefingNeighborhoods}
          generateBriefing={generateBriefing}
        />
      )}

    </div>
  )
}
