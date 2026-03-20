/**
 * Predictor - EduInsights ML predictor view.
 * Form to send student features to the ML API and display prediction + history.
 */
import { useState, useEffect, useRef } from 'react'
import { useMLPredict } from '../hooks/useMLPredict'
import styles from './Predictor.module.css'

const MAX_HISTORY = 5

function formatPercent(value) {
  if (!Number.isFinite(value)) return '0%'
  return `${(value * 100).toFixed(0)}%`
}

export default function Predictor() {
  const { predict, result, loading, error, reset } = useMLPredict()
  const [history, setHistory] = useState([])
  const lastInputRef = useRef(null)

  const [gender, setGender] = useState('male')
  const [lunch, setLunch] = useState('standard')
  const [ethnicity, setEthnicity] = useState('group A')
  const [parentalEducation, setParentalEducation] = useState("high school")
  const [testPrep, setTestPrep] = useState(true)
  const [readingScore, setReadingScore] = useState(75)
  const [writingScore, setWritingScore] = useState(80)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      gender,
      ethnicity,
      parental_education: parentalEducation,
      lunch,
      test_prep: testPrep ? 'completed' : 'none',
      reading_score: Number(readingScore),
      writing_score: Number(writingScore),
    }
    lastInputRef.current = payload
    await predict(payload)
  }

  const handleResetForm = () => {
    setGender('male')
    setLunch('standard')
    setEthnicity('group A')
    setParentalEducation('high school')
    setTestPrep(true)
    setReadingScore(75)
    setWritingScore(80)
    reset()
  }

  useEffect(() => {
    if (!result || loading) return
    const input = lastInputRef.current
    if (!input) return
    setHistory((prev) => {
      const entry = {
        input,
        prediction: result.prediction,
        label: result.label,
        confidence: result.confidence,
      }
      return [entry, ...prev].slice(0, MAX_HISTORY)
    })
    lastInputRef.current = null
  }, [result, loading])

  const isPass = result?.prediction === 1 || result?.label === 'Aprueba'
  const confidence = result?.confidence ?? 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Predictor de Rendimiento</h1>
        <p className={styles.subtitle}>
          Ingresa los datos del estudiante para predecir si aprobará matemáticas.
        </p>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          El servicio de predicción no está disponible en este momento: {error.message}
        </div>
      )}

      <section className={styles.layout}>
        {/* Formulario */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Datos del Estudiante</div>
              <div className={styles.cardSubtitle}>Completa el perfil académico del alumno.</div>
            </div>
            <button type="button" className={styles.secondaryLink} onClick={handleResetForm}>
              Limpiar formulario
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>Género</span>
                </div>
                <div className={styles.pillGroup}>
                  <button
                    type="button"
                    className={`${styles.pill} ${gender === 'male' ? styles.pillActive : ''}`}
                    onClick={() => setGender('male')}
                  >
                    Masc.
                  </button>
                  <button
                    type="button"
                    className={`${styles.pill} ${gender === 'female' ? styles.pillActive : ''}`}
                    onClick={() => setGender('female')}
                  >
                    Fem.
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>Almuerzo</span>
                </div>
                <div className={styles.pillGroup}>
                  <button
                    type="button"
                    className={`${styles.pill} ${lunch === 'standard' ? styles.pillActive : ''}`}
                    onClick={() => setLunch('standard')}
                  >
                    Std
                  </button>
                  <button
                    type="button"
                    className={`${styles.pill} ${lunch === 'free/reduced' ? styles.pillActive : ''}`}
                    onClick={() => setLunch('free/reduced')}
                  >
                    Red.
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>Grupo étnico</span>
                </div>
                <select
                  className={styles.select}
                  value={ethnicity}
                  onChange={(e) => setEthnicity(e.target.value)}
                >
                  <option value="group A">Group A</option>
                  <option value="group B">Group B</option>
                  <option value="group C">Group C</option>
                  <option value="group D">Group D</option>
                  <option value="group E">Group E</option>
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>Educación de los padres</span>
                </div>
                <select
                  className={styles.select}
                  value={parentalEducation}
                  onChange={(e) => setParentalEducation(e.target.value)}
                >
                  <option value="some high school">Some high school</option>
                  <option value="high school">High school</option>
                  <option value="some college">Some college</option>
                  <option value="associate's degree">Associate's degree</option>
                  <option value="bachelor's degree">Bachelor's degree</option>
                  <option value="master's degree">Master's degree</option>
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>Curso preparatorio</span>
                  <span className={styles.cardSubtitle}>¿Completó el curso?</span>
                </div>
                <div
                  className={`${styles.toggle} ${testPrep ? styles.toggleOn : ''}`}
                  onClick={() => setTestPrep((v) => !v)}
                >
                  <div className={styles.toggleThumb} />
                </div>
              </div>
            </div>

            <div className={styles.sliderRow} style={{ marginTop: '1.5rem' }}>
              <div className={styles.labelRow}>
                <span className={styles.label}>Score de lectura</span>
                <span>{readingScore}</span>
              </div>
              <div className={styles.sliderInputs}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={readingScore}
                  onChange={(e) => setReadingScore(Number(e.target.value))}
                  className={styles.slider}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={readingScore}
                  onChange={(e) => setReadingScore(Number(e.target.value) || 0)}
                  className={styles.numberInput}
                />
              </div>
            </div>

            <div className={styles.sliderRow} style={{ marginTop: '1rem' }}>
              <div className={styles.labelRow}>
                <span className={styles.label}>Score de escritura</span>
                <span>{writingScore}</span>
              </div>
              <div className={styles.sliderInputs}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={writingScore}
                  onChange={(e) => setWritingScore(Number(e.target.value))}
                  className={styles.slider}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={writingScore}
                  onChange={(e) => setWritingScore(Number(e.target.value) || 0)}
                  className={styles.numberInput}
                />
              </div>
            </div>

            <button type="submit" className={styles.primaryButton} disabled={loading}>
              {loading ? 'Analizando...' : 'Predecir resultado'}
            </button>
          </form>
        </div>

        {/* Resultado + historial */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Resultado de la predicción</div>
              <div className={styles.cardSubtitle}>
                Basado en el perfil académico del estudiante.
              </div>
            </div>
          </div>

          {!result && !loading && (
            <p className={styles.resultText}>
              Completa el formulario y presiona <strong>Predecir resultado</strong> para ver la
              predicción del modelo.
            </p>
          )}

          {loading && <p className={styles.resultText}>Consultando el modelo...</p>}

          {result && !loading && (
            <>
              <div className={styles.resultStatus}>
                {isPass ? 'Predicción finalizada — Aprueba' : 'Predicción finalizada — En riesgo'}
              </div>
              <div className={styles.resultTitle}>{isPass ? 'Aprueba' : 'En riesgo'}</div>
              <p className={styles.resultText}>
                {isPass
                  ? 'Basado en el perfil académico, el modelo predice que este estudiante aprobará matemáticas.'
                  : 'Basado en el perfil académico, el modelo indica que este estudiante podría reprobar matemáticas.'}
              </p>

              <div className={styles.confidenceBarWrapper}>
                <div className={styles.confidenceLabel}>
                  <span>Nivel de confianza</span>
                  <span>{formatPercent(confidence)}</span>
                </div>
                <div className={styles.confidenceTrack}>
                  <div
                    className={styles.confidenceFill}
                    style={{ width: `${Math.min(100, Math.max(0, confidence * 100))}%` }}
                  />
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <div className={styles.cardTitle}>Historial reciente</div>
            {history.length === 0 ? (
              <p className={styles.cardSubtitle}>
                Las últimas predicciones de esta sesión aparecerán aquí.
              </p>
            ) : (
              <ul className={styles.historyList}>
                {history.map((h, index) => (
                  <li key={index} className={styles.historyItem}>
                    <div className={styles.historyMeta}>
                      <span>
                        Lect/Esc: {h.input.reading_score}/{h.input.writing_score}
                      </span>
                      <span className={styles.cardSubtitle}>
                        {h.input.gender}, {h.input.ethnicity}, prep:{' '}
                        {h.input.test_prep === 'completed' ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`${styles.badge} ${
                          h.prediction === 1 ? styles.badgeSuccess : styles.badgeDanger
                        }`}
                      >
                        {h.prediction === 1 ? 'Aprueba' : 'En riesgo'}
                      </span>
                      {h.confidence != null && (
                        <span style={{ marginLeft: 8, fontSize: '0.75rem', color: '#64748b' }}>
                          {formatPercent(h.confidence)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className={styles.infoCard}>
        <div className={styles.infoTitle}>¿Cómo funciona este modelo?</div>
        <p className={styles.infoText}>
          Este predictor usa un modelo de Random Forest entrenado con datos de 1,000 estudiantes.
          Analiza 7 características (género, grupo étnico, educación de los padres, tipo de
          almuerzo, curso preparatorio, lectura y escritura) para estimar la probabilidad de aprobar
          matemáticas (score ≥ 60). Valores de confianza por encima del 75% se consideran
          especialmente confiables.
        </p>
      </section>
    </div>
  )
}

