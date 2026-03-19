import { SEVERITY, WEIGHTS } from '../constants'

export const COMMUNITY_AREAS = {
  "1": "Rogers Park", "2": "West Ridge", "3": "Uptown",
  "4": "Lincoln Square", "5": "North Center", "6": "Lake View",
  "7": "Lincoln Park", "8": "Near North Side", "9": "Edison Park",
  "10": "Norwood Park", "11": "Jefferson Park", "12": "Forest Glen",
  "13": "North Park", "14": "Albany Park", "15": "Portage Park",
  "16": "Irving Park", "17": "Dunning", "18": "Montclare",
  "19": "Belmont Cragin", "20": "Hermosa", "21": "Avondale",
  "22": "Logan Square", "23": "Humboldt Park", "24": "West Town",
  "25": "Austin", "26": "West Garfield Park", "27": "East Garfield Park",
  "28": "Near West Side", "29": "North Lawndale", "30": "South Lawndale",
  "31": "Lower West Side", "32": "Loop", "33": "Near South Side",
  "34": "Armour Square", "35": "Douglas", "36": "Oakland",
  "37": "Fuller Park", "38": "Grand Boulevard", "39": "Kenwood",
  "40": "Washington Park", "41": "Hyde Park", "42": "Woodlawn",
  "43": "South Shore", "44": "Chatham", "45": "Avalon Park",
  "46": "South Chicago", "47": "Burnside", "48": "Calumet Heights",
  "49": "Roseland", "50": "Pullman", "51": "South Deering",
  "52": "East Side", "53": "West Pullman", "54": "Riverdale",
  "55": "Hegewisch", "56": "Garfield Ridge", "57": "Archer Heights",
  "58": "Brighton Park", "59": "McKinley Park", "60": "Bridgeport",
  "61": "New City", "62": "West Elsdon", "63": "Gage Park",
  "64": "Clearing", "65": "West Lawn", "66": "Chicago Lawn",
  "67": "West Englewood", "68": "Englewood", "69": "Greater Grand Crossing",
  "70": "Ashburn", "71": "Auburn Gresham", "72": "Beverly",
  "73": "Washington Heights", "74": "Mount Greenwood", "75": "Morgan Park",
  "76": "O'Hare", "77": "Edgewater",
}

export const formatHourLabel = (hour) => {
  if (hour === 0) return "12am"
  if (hour < 12) return `${hour}am`
  if (hour === 12) return "12pm"
  return `${hour - 12}pm`
}

export const getSeverityLabel = (type) => {
  const score = SEVERITY[type] || 1
  if (score >= 5) return { label: "CRITICAL", color: "#ff2d2d" }
  if (score >= 4) return { label: "HIGH", color: "#ff6b00" }
  if (score >= 3) return { label: "MEDIUM", color: "#f5c400" }
  return { label: "LOW", color: "#4caf50" }
}

export const getSafetyScore = (filtered, allIncidents, neighborhood) => {
  if (!filtered.length) return { score: 100, label: "No Data", color: "#8888aa", advice: "No recent incidents recorded." }
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentHomicides = allIncidents.filter(i =>
    i.community_area === neighborhood &&
    i.primary_type === "HOMICIDE" &&
    i.date && new Date(i.date) > thirtyDaysAgo
  ).length
  const neighborhoodScores = {}
  allIncidents.forEach(i => {
    if (!i.community_area) return
    if (!neighborhoodScores[i.community_area]) neighborhoodScores[i.community_area] = { total: 0, weightedScore: 0 }
    neighborhoodScores[i.community_area].total++
    neighborhoodScores[i.community_area].weightedScore += (WEIGHTS[i.primary_type] || 5)
  })
  const dangerRates = Object.entries(neighborhoodScores)
    .filter(([, n]) => n.total >= 20)
    .map(([id, n]) => ({ id, rate: n.weightedScore / n.total, total: n.total }))
  if (!dangerRates.length) return { score: 50, label: "No Data", color: "#8888aa", advice: "Not enough data." }
  const minRate = Math.min(...dangerRates.map(n => n.rate))
  const maxRate = Math.max(...dangerRates.map(n => n.rate))
  const myData = neighborhoodScores[neighborhood]
  if (!myData || myData.total < 20) return { score: 100, label: "No Data", color: "#8888aa", advice: "Not enough data for this area." }
  const myRate = myData.weightedScore / myData.total
  const normalized = maxRate === minRate ? 0.5 : (myRate - minRate) / (maxRate - minRate)
  const score = Math.round(95 - normalized * 75)
  const homicideWarning = recentHomicides >= 2 ? ` ⚠ ${recentHomicides} homicides recorded in the last 30 days.` : ""
  if (score <= 30) return { score: Math.max(10, score - (recentHomicides >= 2 ? 10 : 0)), label: "Very High Risk", color: "#ff2d2d", advice: `One of Chicago's most dangerous areas. High rates of violent crime. Exercise extreme caution especially at night.${homicideWarning}` }
  if (score <= 45) return { score: Math.max(10, score - (recentHomicides >= 2 ? 10 : 0)), label: "High Risk", color: "#ff4400", advice: `Significantly above average violent crime. Stay in busy areas, avoid walking alone at night.${homicideWarning}` }
  if (score <= 60) return { score: Math.max(10, score - (recentHomicides >= 2 ? 8 : 0)), label: "Use Caution", color: "#ff6b00", advice: `Above average crime activity. Stay alert and aware of your surroundings.${homicideWarning}` }
  if (score <= 75) return { score: Math.max(10, score - (recentHomicides >= 2 ? 5 : 0)), label: "Moderate", color: "#f5c400", advice: `Average crime levels for Chicago. Exercise normal urban awareness.${homicideWarning}` }
  return { score: Math.max(10, score - (recentHomicides >= 2 ? 5 : 0)), label: "Low Risk", color: "#4caf50", advice: `Below average crime activity relative to Chicago. Standard city precautions apply.${homicideWarning}` }
}
