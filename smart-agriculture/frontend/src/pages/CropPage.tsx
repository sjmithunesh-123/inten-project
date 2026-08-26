import { useEffect, useState } from 'react'

import { api } from '../api/client'
import type { ApiEnvelope, Crop, CropRecommendationResult } from '../types'
import { Sprout } from 'lucide-react'
import { agricultureImages, imageFallback } from '../assets/images'

type CropFormState = {
  nitrogen: number
  phosphorus: number
  potassium: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
}

type CropHistoryEntry = CropRecommendationResult & {
  created_at: string
  input: CropFormState
}

const STORAGE_KEY = 'smart-agriculture-crop-history'

const DEFAULT_CROPS: Crop[] = [
  { id: 1, crop_name: 'Rice', scientific_name: 'Oryza sativa', season: 'Kharif', soil_type: 'Loamy', water_requirement: 'High' },
  { id: 2, crop_name: 'Wheat', scientific_name: 'Triticum aestivum', season: 'Rabi', soil_type: 'Well-drained loam', water_requirement: 'Moderate' },
  { id: 3, crop_name: 'Maize', scientific_name: 'Zea mays', season: 'Kharif', soil_type: 'Sandy loam', water_requirement: 'Moderate' },
  { id: 4, crop_name: 'Cotton', scientific_name: 'Gossypium hirsutum', season: 'Kharif', soil_type: 'Black soil', water_requirement: 'Moderate' },
  { id: 5, crop_name: 'Sugarcane', scientific_name: 'Saccharum officinarum', season: 'Year-round', soil_type: 'Loamy', water_requirement: 'High' },
  { id: 6, crop_name: 'Groundnut', scientific_name: 'Arachis hypogaea', season: 'Kharif', soil_type: 'Sandy loam', water_requirement: 'Moderate' },
  { id: 7, crop_name: 'Tomato', scientific_name: 'Solanum lycopersicum', season: 'Rabi', soil_type: 'Well-drained', water_requirement: 'Moderate' },
  { id: 8, crop_name: 'Potato', scientific_name: 'Solanum tuberosum', season: 'Rabi', soil_type: 'Loamy', water_requirement: 'Moderate' },
  { id: 9, crop_name: 'Banana', scientific_name: 'Musa paradisiaca', season: 'Year-round', soil_type: 'Rich loam', water_requirement: 'High' },
  { id: 10, crop_name: 'Coconut', scientific_name: 'Cocos nucifera', season: 'Year-round', soil_type: 'Sandy coastal', water_requirement: 'High' },
]

const INITIAL_FORM: CropFormState = {
  nitrogen: 95,
  phosphorus: 45,
  potassium: 40,
  temperature: 28,
  humidity: 72,
  ph: 6.5,
  rainfall: 140,
}

function clampScore(value: number, min: number, max: number) {
  if (value < min) return (value / min) * 100
  if (value > max) return (max / value) * 100
  return 100
}

function scoreCropProfile(input: CropFormState, crop: Crop) {
  const idealRanges = {
    nitrogen: { min: 50, max: 120 },
    phosphorus: { min: 25, max: 80 },
    potassium: { min: 20, max: 90 },
    temperature: { min: 18, max: 35 },
    humidity: { min: 55, max: 85 },
    ph: { min: 5.5, max: 7.5 },
    rainfall: { min: 80, max: 220 },
  }

  const cropStyle = {
    Rice: { nitrogen: { min: 80, max: 120 }, phosphorus: { min: 30, max: 70 }, potassium: { min: 25, max: 80 }, temperature: { min: 22, max: 32 }, humidity: { min: 70, max: 90 }, ph: { min: 5.5, max: 7 }, rainfall: { min: 120, max: 220 } },
    Wheat: { nitrogen: { min: 60, max: 120 }, phosphorus: { min: 25, max: 60 }, potassium: { min: 20, max: 70 }, temperature: { min: 12, max: 25 }, humidity: { min: 40, max: 70 }, ph: { min: 6, max: 7.5 }, rainfall: { min: 60, max: 150 } },
    Maize: { nitrogen: { min: 70, max: 140 }, phosphorus: { min: 30, max: 80 }, potassium: { min: 30, max: 90 }, temperature: { min: 20, max: 30 }, humidity: { min: 50, max: 75 }, ph: { min: 5.8, max: 7.5 }, rainfall: { min: 80, max: 200 } },
    Cotton: { nitrogen: { min: 50, max: 100 }, phosphorus: { min: 25, max: 70 }, potassium: { min: 25, max: 80 }, temperature: { min: 24, max: 32 }, humidity: { min: 45, max: 70 }, ph: { min: 5.8, max: 7.2 }, rainfall: { min: 60, max: 130 } },
    Sugarcane: { nitrogen: { min: 90, max: 140 }, phosphorus: { min: 35, max: 80 }, potassium: { min: 50, max: 100 }, temperature: { min: 22, max: 35 }, humidity: { min: 65, max: 85 }, ph: { min: 6, max: 7.5 }, rainfall: { min: 120, max: 250 } },
    Groundnut: { nitrogen: { min: 40, max: 90 }, phosphorus: { min: 25, max: 65 }, potassium: { min: 25, max: 80 }, temperature: { min: 20, max: 30 }, humidity: { min: 50, max: 80 }, ph: { min: 5.8, max: 7 }, rainfall: { min: 50, max: 150 } },
    Tomato: { nitrogen: { min: 60, max: 120 }, phosphorus: { min: 30, max: 80 }, potassium: { min: 30, max: 90 }, temperature: { min: 18, max: 27 }, humidity: { min: 50, max: 75 }, ph: { min: 6, max: 7 }, rainfall: { min: 80, max: 180 } },
    Potato: { nitrogen: { min: 70, max: 130 }, phosphorus: { min: 25, max: 75 }, potassium: { min: 30, max: 90 }, temperature: { min: 12, max: 22 }, humidity: { min: 55, max: 75 }, ph: { min: 5.5, max: 6.5 }, rainfall: { min: 50, max: 130 } },
    Banana: { nitrogen: { min: 90, max: 150 }, phosphorus: { min: 35, max: 90 }, potassium: { min: 50, max: 120 }, temperature: { min: 24, max: 30 }, humidity: { min: 75, max: 90 }, ph: { min: 6, max: 7.5 }, rainfall: { min: 150, max: 300 } },
    Coconut: { nitrogen: { min: 50, max: 110 }, phosphorus: { min: 25, max: 80 }, potassium: { min: 40, max: 100 }, temperature: { min: 25, max: 35 }, humidity: { min: 70, max: 95 }, ph: { min: 6, max: 8 }, rainfall: { min: 180, max: 300 } },
  }

  const cropProfile = cropStyle[crop.crop_name as keyof typeof cropStyle] ?? idealRanges

  const fields = [
    ['nitrogen', input.nitrogen, cropProfile.nitrogen],
    ['phosphorus', input.phosphorus, cropProfile.phosphorus],
    ['potassium', input.potassium, cropProfile.potassium],
    ['temperature', input.temperature, cropProfile.temperature],
    ['humidity', input.humidity, cropProfile.humidity],
    ['ph', input.ph, cropProfile.ph],
    ['rainfall', input.rainfall, cropProfile.rainfall],
  ] as const

  const totalScore = fields.reduce((score, [key, value, range]) => {
    const min = range.min
    const max = range.max
    const closeness = clampScore(value, min, max)
    const fieldWeight = key === 'humidity' || key === 'rainfall' ? 1.25 : 1
    return score + closeness * fieldWeight
  }, 0)

  return totalScore / fields.length
}

function generateRecommendation(input: CropFormState) {
  const candidates = DEFAULT_CROPS.map((crop) => {
    const score = scoreCropProfile(input, crop)
    return { ...crop, score }
  }).sort((a, b) => b.score - a.score)

  const best = candidates[0]
  const confidence = Math.min(99, Math.max(60, Math.round(best.score)))

  return {
    recommendation: `${best.crop_name} is the best fit based on the farm profile.`,
    crop_name: best.crop_name,
    predicted_crop: best.crop_name,
    confidence,
    reason: `This profile aligns closely with ${best.crop_name} requirements for nutrients, moisture, and temperature.`,
  }
}

export function CropPage() {
  const [crops, setCrops] = useState<Crop[]>(DEFAULT_CROPS)
  const [result, setResult] = useState<CropRecommendationResult | null>(null)
  const [history, setHistory] = useState<CropHistoryEntry[]>([])
  const [form, setForm] = useState<CropFormState>(INITIAL_FORM)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadCrops = async () => {
      try {
        const { data } = await api.get<ApiEnvelope<Crop[]>>('/crops')
        if (Array.isArray(data?.data) && data.data.length > 0) {
          setCrops(data.data)
        }
      } catch (error) {
        console.warn('Using local crop library fallback.', error)
      }
    }

    void loadCrops()
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored) as CropHistoryEntry[]
      if (Array.isArray(parsed)) {
        setHistory(parsed)
      }
    } catch (error) {
      console.warn('Unable to read crop history from storage.', error)
    }
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const numericValue = value === '' ? 0 : Number(value)

    setForm((current) => ({ ...current, [name]: numericValue }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const values = Object.values(form)
    if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
      setError('Please enter valid positive values for all soil and climate fields.')
      return
    }

    setError('')
    setIsSubmitting(true)

    const recommendation = generateRecommendation(form)
    const entry: CropHistoryEntry = {
      ...recommendation,
      created_at: new Date().toISOString(),
      input: form,
    }

    setResult(recommendation)
    setHistory((current) => {
      const next = [entry, ...current].slice(0, 5)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })

    setIsSubmitting(false)
  }

  return (
    <div className="page-stack crop-page">
      <section className="page-banner recommendation-banner"><div><p className="eyebrow">CROP INTELLIGENCE</p><h2>Plant with a little more certainty.</h2><p>Compare your field conditions with crop profiles and find a better-fit choice.</p></div><img src={agricultureImages.recommendation} alt="Healthy crop rows in a modern farm" onError={(event) => { event.currentTarget.src = imageFallback }} /></section>
    <div className="panel-grid two-col">
      <section className="panel">
          <div className="panel-header" id="library">
          <h3><Sprout size={18} /> Crop library</h3>
        </div>
        <div className="list-stack">
          {crops.map((crop) => (
            <div key={crop.id} className="list-item crop-list-item">
              <img src={agricultureImages.crops[crop.crop_name] ?? agricultureImages.crops.Rice} alt={`${crop.crop_name} crop`} onError={(event) => { event.currentTarget.src = imageFallback }} />
              <div>
                <strong>{crop.crop_name}</strong>
                <p>{crop.scientific_name || 'No scientific name available'}</p>
              </div>
              <span>{crop.season || 'Season flexible'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Recommendation engine</h3>
        </div>

        <form className="input-grid" onSubmit={handleSubmit}>
          {Object.entries(form).map(([key, value]) => (
            <label key={key}>
              {key}
              <input
                name={key}
                type="number"
                step="any"
                value={value}
                onChange={handleChange}
              />
            </label>
          ))}

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-link wide" disabled={isSubmitting}>
            {isSubmitting ? 'Calculating...' : 'Get recommendation'}
          </button>
        </form>

        {result && (
          <div className="result-box">
            <h4>Recommended crop</h4>
            <p>{String(result.crop_name || result.predicted_crop || result.recommendation || 'Recommendation ready')}</p>
            <small>Confidence: {result.confidence}%</small>
            {result.reason && <p>{String(result.reason ?? '')}</p>}
          </div>
        )}

        <div className="list-stack" style={{ marginTop: '1rem' }}>
          <h4>Recent history</h4>
          {history.length === 0 ? (
            <p>No recent recommendations yet.</p>
          ) : (
            history.map((entry, index) => (
              <div key={`${entry.created_at}-${index}`} className="list-item">
                <div>
                  <strong>{String(entry.crop_name || entry.predicted_crop || 'Crop recommendation')}</strong>
                  <p>{String(entry.reason ?? entry.recommendation ?? '')}</p>
                </div>
                <span>{new Date(entry.created_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
    </div>
  )
}
