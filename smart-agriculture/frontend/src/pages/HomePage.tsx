import { ArrowRight, BarChart3, Camera, Leaf, ShieldCheck, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { agricultureImages, imageFallback } from '../assets/images'

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">SMART AGRICULTURE / FIELD INTELLIGENCE</p>
          <h2>Grow smarter with technology rooted in the field.</h2>
          <p>
            Monitor field health, forecast crop needs, and respond earlier with data-backed
            recommendations for better seasonal outcomes.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-link wide">
              Get started
              <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="ghost-link wide">
              Explore the workspace
            </Link>
          </div>
          <div className="hero-proof"><span className="proof-dot" /> Built for better decisions, season after season</div>
        </div>

        <div className="hero-visual">
          <img src={agricultureImages.hero} alt="Sunlit rows of a thriving agricultural field" onError={(event) => { event.currentTarget.src = imageFallback }} />
          <div className="hero-float-card"><span className="live-dot" /> Field health <strong>Optimized</strong></div>
        </div>
        <div className="hero-metrics">
          <div className="metric-box accent">
            <Leaf size={22} />
            <div>
              <strong>Crop</strong>
              <span>Recommendation engine</span>
            </div>
          </div>
          <div className="metric-box">
            <ShieldCheck size={22} />
            <div>
              <strong>Field</strong>
              <span>Disease detection</span>
            </div>
          </div>
          <div className="metric-box">
            <BarChart3 size={22} />
            <div>
              <strong>Insight</strong>
              <span>Analytics dashboard</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-intro"><p className="eyebrow">One clear view of the farm</p><h3>From soil signals to confident action.</h3></section>
      <section className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon"><Sprout size={22} /></div>
          <h3>Crop planning</h3>
          <p>Match soil, climate, and field conditions to the best crop choices.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Camera size={22} /></div>
          <h3>Plant health</h3>
          <p>Detect early plant disease signals and act before losses escalate.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><BarChart3 size={22} /></div>
          <h3>Farm analytics</h3>
          <p>Follow trends across crop recommendations and prediction activity.</p>
        </div>
      </section>
    </div>
  )
}
