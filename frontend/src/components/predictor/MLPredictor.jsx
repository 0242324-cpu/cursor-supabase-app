/**
 * MLPredictor - Generic ML prediction form.
 * Configure the fields array to match your model's input features.
 * Each field maps to one input your ML model expects.
 *
 * Props: fields, onPredict, result, loading, error, onReset
 */
import { useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import styles from './MLPredictor.module.css'

/**
 * @param {Array<{key: string, label: string, type: 'number'|'select', options?: Array<{value: string|number, label: string}>, min?: number, max?: number}>} fields
 * @param {Function} onPredict - (inputData: Object) => Promise
 * @param {Object|null} result - Last prediction result from parent
 * @param {boolean} loading - Loading state from parent
 * @param {Error|null} error - Error state from parent
 * @param {Function} onReset - Callback to reset state
 */
export default function MLPredictor({ fields = [], onPredict, result = null, loading = false, error = null, onReset }) {
  const [formData, setFormData] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onPredict(formData)
  }

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {fields.map((f) => (
          <div key={f.key} className={styles.field}>
            <label htmlFor={f.key}>{f.label}</label>
            {f.type === 'number' && (
              <input
                id={f.key}
                type="number"
                step="any"
                min={f.min}
                max={f.max}
                value={formData[f.key] ?? ''}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, [f.key]: e.target.value ? Number(e.target.value) : '' }))
                }
                className={styles.input}
                required
              />
            )}
            {f.type === 'select' && (
              <select
                id={f.key}
                value={formData[f.key] ?? ''}
                onChange={(e) => setFormData((d) => ({ ...d, [f.key]: e.target.value }))}
                className={styles.input}
              >
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        <div className={styles.actions}>
          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? <LoadingSpinner /> : 'Predict'}
          </button>
          <button type="button" onClick={onReset} className={styles.reset}>
            Reset
          </button>
        </div>
      </form>

      {error && <div className={styles.error}>{error.message || 'Prediction failed'}</div>}

      {result && (
        <div className={styles.result}>
          <h4>Prediction</h4>
          <p className={styles.predValue}>{result.prediction ?? result.label ?? '—'}</p>
          {result.confidence != null && (
            <p className={styles.confidence}>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
          )}
        </div>
      )}
    </div>
  )
}
