import { useState } from 'react'

import { api } from '../api/client'
import type { DiseasePredictionResult } from '../types'
import { ScanLine, UploadCloud } from 'lucide-react'
import { agricultureImages, imageFallback } from '../assets/images'

export function DiseasePage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<DiseasePredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await api.post('/disease/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(data.data)
    } catch (error) {
      console.error('Failed to predict disease', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack scan-page">
      <section className="page-banner scan-banner"><div><p className="eyebrow">AI PLANT HEALTH</p><h2>See what your leaves are telling you.</h2><p>Upload a clear leaf image and get an actionable health signal in seconds.</p></div><img src={agricultureImages.scan} alt="Healthy crop leaves ready for inspection" onError={(event) => { event.currentTarget.src = imageFallback }} /></section>
    <div className="panel-grid two-col">
      <section className="panel">
        <div className="panel-header">
          <h3>Plant disease scan</h3>
        </div>

          <form className="upload-form" onSubmit={handleSubmit}>
          <label className="upload-box">
            <UploadCloud size={28} /><span>{file ? file.name : 'Drop a leaf image here'}</span><small>PNG, JPG or WEBP up to 5 MB</small>
            <input type="file" accept="image/*" onChange={(event) => { const next = event.target.files?.[0] ?? null; setFile(next); setPreview(next ? URL.createObjectURL(next) : '') }} />
          </label>
          {preview && <img className="scan-preview" src={preview} alt="Selected leaf preview" />}

          <button type="submit" className="primary-link wide" disabled={!file || loading}>
            <ScanLine size={17} /> {loading ? 'Analyzing...' : 'Scan image'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Prediction result</h3>
        </div>

        {result ? (
          <div className="result-box">
            <span className="result-kicker">SCAN COMPLETE</span><h4>{String(result.disease_name || result.prediction || 'Potential issue detected')}</h4>
            {typeof result.confidence === 'number' && <small>Confidence: {result.confidence}</small>}
          </div>
        ) : (
          <p className="empty-state">Upload a crop image to generate a disease prediction.</p>
        )}
      </section>
    </div>
    </div>
  )
}
