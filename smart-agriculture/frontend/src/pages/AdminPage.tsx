import { useEffect, useState } from 'react'

import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { extractApiError } from '../utils/error'
import type { ApiEnvelope, Crop, Disease, Plant, User } from '../types'

type PlantForm = {
  plant_name: string
  scientific_name: string
  category: string
  description: string
}

type CropForm = {
  crop_name: string
  scientific_name: string
  season: string
  soil_type: string
  water_requirement: string
  description: string
}

type UserForm = {
  full_name: string
  location: string
  role: string
  is_active: boolean
}

const emptyPlantForm: PlantForm = {
  plant_name: '',
  scientific_name: '',
  category: '',
  description: '',
}

const emptyCropForm: CropForm = {
  crop_name: '',
  scientific_name: '',
  season: '',
  soil_type: '',
  water_requirement: '',
  description: '',
}

const emptyUserForm: UserForm = {
  full_name: '',
  location: '',
  role: 'farmer',
  is_active: true,
}

export function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [plants, setPlants] = useState<Plant[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [plantForm, setPlantForm] = useState<PlantForm>(emptyPlantForm)
  const [cropForm, setCropForm] = useState<CropForm>(emptyCropForm)
  const [userForm, setUserForm] = useState<UserForm>(emptyUserForm)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editingPlantId, setEditingPlantId] = useState<number | null>(null)
  const [editingCropId, setEditingCropId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  const loadAdminData = async () => {
    try {
      const [usersRes, plantsRes, cropsRes, diseasesRes] = await Promise.all([
        api.get<ApiEnvelope<User[]>>('/admin/users'),
        api.get<ApiEnvelope<Plant[]>>('/admin/plants'),
        api.get<ApiEnvelope<Crop[]>>('/admin/crops'),
        api.get<ApiEnvelope<Disease[]>>('/admin/diseases'),
      ])

      setUsers(usersRes.data.data)
      setPlants(plantsRes.data.data)
      setCrops(cropsRes.data.data)
      setDiseases(diseasesRes.data.data)
    } catch (err) {
      setError(extractApiError(err))
    }
  }

  useEffect(() => {
    const init = async () => {
      if (user?.role !== 'admin') return

      try {
        await loadAdminData()
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [user])

  const setFeedback = (message: string, isError = false) => {
    setSuccess(isError ? '' : message)
    setError(isError ? message : '')
  }

  const createPlant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const { data } = await api.post<ApiEnvelope<Plant>>('/admin/plants', plantForm)
      setPlants((current) => [data.data, ...current])
      setPlantForm(emptyPlantForm)
      setFeedback('Plant added successfully.')
    } catch (err) {
      setFeedback(extractApiError(err), true)
    }
  }

  const updatePlant = async (plantId: number) => {
    try {
      const payload = {
        plant_name: plantForm.plant_name,
        scientific_name: plantForm.scientific_name,
        category: plantForm.category,
        description: plantForm.description,
      }

      const { data } = await api.put<ApiEnvelope<Plant>>(`/admin/plants/${plantId}`, payload)
      setPlants((current) => current.map((plant) => (plant.id === plantId ? data.data : plant)))
      setEditingPlantId(null)
      setPlantForm(emptyPlantForm)
      setFeedback('Plant updated successfully.')
    } catch (err) {
      setFeedback(extractApiError(err), true)
    }
  }

  const deletePlant = async (plantId: number) => {
    if (!window.confirm('Delete this plant record?')) return

    try {
      await api.delete(`/admin/plants/${plantId}`)
      setPlants((current) => current.filter((plant) => plant.id !== plantId))
      setFeedback('Plant deleted successfully.')
    } catch (err) {
      setFeedback(extractApiError(err), true)
    }
  }

  const createCrop = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const { data } = await api.post<ApiEnvelope<Crop>>('/admin/crops', cropForm)
      setCrops((current) => [data.data, ...current])
      setCropForm(emptyCropForm)
      setFeedback('Crop added successfully.')
    } catch (err) {
      setFeedback(extractApiError(err), true)
    }
  }

  const updateCrop = async (cropId: number) => {
    try {
      const payload = {
        crop_name: cropForm.crop_name,
        scientific_name: cropForm.scientific_name,
        season: cropForm.season,
        soil_type: cropForm.soil_type,
        water_requirement: cropForm.water_requirement,
        description: cropForm.description,
      }

      const { data } = await api.put<ApiEnvelope<Crop>>(`/admin/crops/${cropId}`, payload)
      setCrops((current) => current.map((crop) => (crop.id === cropId ? data.data : crop)))
      setEditingCropId(null)
      setCropForm(emptyCropForm)
      setFeedback('Crop updated successfully.')
    } catch (err) {
      setFeedback(extractApiError(err), true)
    }
  }

  const deleteCrop = async (cropId: number) => {
    if (!window.confirm('Delete this crop record?')) return

    try {
      await api.delete(`/admin/crops/${cropId}`)
      setCrops((current) => current.filter((crop) => crop.id !== cropId))
      setFeedback('Crop deleted successfully.')
    } catch (err) {
      setFeedback(extractApiError(err), true)
    }
  }

  const startPlantEdit = (plant: Plant) => {
    setEditingPlantId(plant.id)
    setPlantForm({
      plant_name: plant.plant_name,
      scientific_name: plant.scientific_name ?? '',
      category: plant.category ?? '',
      description: plant.description ?? '',
    })
  }

  const startCropEdit = (crop: Crop) => {
    setEditingCropId(crop.id)
    setCropForm({
      crop_name: crop.crop_name,
      scientific_name: crop.scientific_name ?? '',
      season: crop.season ?? '',
      soil_type: crop.soil_type ?? '',
      water_requirement: crop.water_requirement ?? '',
      description: crop.description ?? '',
    })
  }

  const startUserEdit = (userEntry: User) => {
    setEditingUserId(Number(userEntry.id))
    setUserForm({
      full_name: userEntry.full_name,
      location: userEntry.location ?? '',
      role: userEntry.role,
      is_active: userEntry.is_active,
    })
  }

  const saveUser = async () => {
    if (editingUserId === null) return

    try {
      const { data } = await api.put<ApiEnvelope<User>>(`/admin/users/${editingUserId}`, userForm)
      setUsers((current) => current.map((entry) => (entry.id === editingUserId ? data.data : entry)))
      setEditingUserId(null)
      setUserForm(emptyUserForm)
      setFeedback('User updated successfully.')
    } catch (err) {
      setFeedback(extractApiError(err), true)
    }
  }

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Delete this user account?')) return

    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers((current) => current.filter((entry) => entry.id !== userId))
      setFeedback('User deleted successfully.')
    } catch (err) {
      setFeedback(extractApiError(err), true)
    }
  }

  if (!user || user.role !== 'admin') {
    return <div className="panel loading-panel">Admin access required.</div>
  }

  if (loading) {
    return <div className="panel loading-panel">Loading admin workspace…</div>
  }

  return (
    <div className="admin-page">
      <section className="panel">
        <div className="panel-header">
          <h3>Admin overview</h3>
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <div className="stats-grid admin-stats">
          <div className="stats-card">
            <p>Users</p>
            <h3>{users.length}</h3>
          </div>
          <div className="stats-card">
            <p>Plants</p>
            <h3>{plants.length}</h3>
          </div>
          <div className="stats-card">
            <p>Crops</p>
            <h3>{crops.length}</h3>
          </div>
          <div className="stats-card">
            <p>Diseases</p>
            <h3>{diseases.length}</h3>
          </div>
        </div>
      </section>

      <section className="panel-grid two-col">
        <div className="panel">
          <div className="panel-header">
            <h3>{editingPlantId ? 'Edit plant' : 'Add plant'}</h3>
          </div>

          <form className="input-grid" onSubmit={(event) => {
            event.preventDefault()
            if (editingPlantId !== null) {
              void updatePlant(editingPlantId)
              return
            }
            void createPlant(event)
          }}>
            <label>
              Plant name
              <input value={plantForm.plant_name} onChange={(event) => setPlantForm({ ...plantForm, plant_name: event.target.value })} required />
            </label>
            <label>
              Scientific name
              <input value={plantForm.scientific_name} onChange={(event) => setPlantForm({ ...plantForm, scientific_name: event.target.value })} />
            </label>
            <label>
              Category
              <input value={plantForm.category} onChange={(event) => setPlantForm({ ...plantForm, category: event.target.value })} />
            </label>
            <label className="full-span">
              Description
              <textarea value={plantForm.description} onChange={(event) => setPlantForm({ ...plantForm, description: event.target.value })} rows={4} />
            </label>
            <div className="button-row full-span">
              <button type="submit" className="primary-link wide">{editingPlantId ? 'Update plant' : 'Save plant'}</button>
              {editingPlantId !== null && (
                <button type="button" className="ghost-link" onClick={() => { setEditingPlantId(null); setPlantForm(emptyPlantForm) }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>{editingCropId ? 'Edit crop' : 'Add crop'}</h3>
          </div>

          <form className="input-grid" onSubmit={(event) => {
            event.preventDefault()
            if (editingCropId !== null) {
              void updateCrop(editingCropId)
              return
            }
            void createCrop(event)
          }}>
            <label>
              Crop name
              <input value={cropForm.crop_name} onChange={(event) => setCropForm({ ...cropForm, crop_name: event.target.value })} required />
            </label>
            <label>
              Scientific name
              <input value={cropForm.scientific_name} onChange={(event) => setCropForm({ ...cropForm, scientific_name: event.target.value })} />
            </label>
            <label>
              Season
              <input value={cropForm.season} onChange={(event) => setCropForm({ ...cropForm, season: event.target.value })} />
            </label>
            <label>
              Soil type
              <input value={cropForm.soil_type} onChange={(event) => setCropForm({ ...cropForm, soil_type: event.target.value })} />
            </label>
            <label>
              Water requirement
              <input value={cropForm.water_requirement} onChange={(event) => setCropForm({ ...cropForm, water_requirement: event.target.value })} />
            </label>
            <label className="full-span">
              Description
              <textarea value={cropForm.description} onChange={(event) => setCropForm({ ...cropForm, description: event.target.value })} rows={4} />
            </label>
            <div className="button-row full-span">
              <button type="submit" className="primary-link wide">{editingCropId ? 'Update crop' : 'Save crop'}</button>
              {editingCropId !== null && (
                <button type="button" className="ghost-link" onClick={() => { setEditingCropId(null); setCropForm(emptyCropForm) }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="panel-grid three-col">
        <div className="panel">
          <div className="panel-header">
            <h3>Users</h3>
          </div>
          <div className="list-stack compact">
            {users.map((entry) => (
              <div key={entry.id} className="list-item">
                <div>
                  <strong>{entry.full_name}</strong>
                  <p>{entry.email}</p>
                </div>
                <div className="list-meta">
                  <span className="chip">{entry.role}</span>
                  <div className="button-row compact-actions">
                    <button type="button" className="ghost-link small-button" onClick={() => startUserEdit(entry)}>Edit</button>
                    <button type="button" className="danger-button small-button" onClick={() => void deleteUser(Number(entry.id))}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editingUserId !== null && (
            <div className="edit-panel">
              <h4>Update selected user</h4>
              <div className="input-grid compact-grid">
                <label>
                  Full name
                  <input value={userForm.full_name} onChange={(event) => setUserForm({ ...userForm, full_name: event.target.value })} />
                </label>
                <label>
                  Location
                  <input value={userForm.location} onChange={(event) => setUserForm({ ...userForm, location: event.target.value })} />
                </label>
                <label>
                  Role
                  <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
                    <option value="farmer">farmer</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
                <label>
                  Active
                  <select value={String(userForm.is_active)} onChange={(event) => setUserForm({ ...userForm, is_active: event.target.value === 'true' })}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </label>
              </div>
              <div className="button-row">
                <button type="button" className="primary-link" onClick={() => void saveUser()}>Save changes</button>
                <button type="button" className="ghost-link" onClick={() => { setEditingUserId(null); setUserForm(emptyUserForm) }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Plants</h3>
          </div>
          <div className="list-stack compact">
            {plants.map((entry) => (
              <div key={entry.id} className="list-item">
                <div>
                  <strong>{entry.plant_name}</strong>
                  <p>{entry.category || 'General crop'}</p>
                </div>
                <div className="button-row compact-actions">
                  <button type="button" className="ghost-link small-button" onClick={() => startPlantEdit(entry)}>Edit</button>
                  <button type="button" className="danger-button small-button" onClick={() => void deletePlant(entry.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Crops</h3>
          </div>
          <div className="list-stack compact">
            {crops.map((entry) => (
              <div key={entry.id} className="list-item">
                <div>
                  <strong>{entry.crop_name}</strong>
                  <p>{entry.season || 'Flexible season'}</p>
                </div>
                <div className="button-row compact-actions">
                  <button type="button" className="ghost-link small-button" onClick={() => startCropEdit(entry)}>Edit</button>
                  <button type="button" className="danger-button small-button" onClick={() => void deleteCrop(entry.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
