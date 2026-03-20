/**
 * Dashboard - EduInsights analytics view.
 * Uses Supabase `students` table to render KPIs and charts described in the PRD.
 */
import {
  BarChartWidget,
  PieChartWidget,
  GroupedBarChartWidget,
  ScatterByCategoryChart,
} from '../components/charts'
import KpiCard from '../components/ui/KpiCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useSupabase } from '../hooks/useSupabase'
import { aggregateByKey } from '../utils/dataTransformers'
import styles from './Dashboard.module.css'

const APP_CONFIG = {
  title: 'Dashboard de Rendimiento',
  tableName: 'students',
}

function formatNumber(value, decimals = 1) {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export default function Dashboard() {
  const { data, loading, error } = useSupabase(APP_CONFIG.tableName)

  const totalStudents = data.length
  const avgMath =
    totalStudents > 0
      ? data.reduce((sum, row) => sum + (row.math_score || 0), 0) / totalStudents
      : 0
  const approvalRate =
    totalStudents > 0
      ? (data.filter((row) => row.pass_math === 1).length / totalStudents) * 100
      : 0

  const withPrep = data.filter((row) => row.test_prep === 'completed')
  const withoutPrep = data.filter((row) => row.test_prep === 'none')
  const avgMathPrep =
    withPrep.length > 0
      ? withPrep.reduce((sum, row) => sum + (row.math_score || 0), 0) / withPrep.length
      : 0
  const avgMathNoPrep =
    withoutPrep.length > 0
      ? withoutPrep.reduce((sum, row) => sum + (row.math_score || 0), 0) / withoutPrep.length
      : 0
  const prepImpact = avgMathPrep - avgMathNoPrep

  const kpis = [
    {
      title: 'Promedio Matemáticas',
      value: formatNumber(avgMath, 1),
      subtitle: 'sobre 100 puntos',
      icon: '📐',
      color: 'primary',
    },
    {
      title: 'Tasa de Aprobación',
      value: `${formatNumber(approvalRate, 1)}%`,
      subtitle: 'estudiantes con score ≥ 60',
      icon: '✅',
      color: approvalRate > 60 ? 'success' : 'danger',
    },
    {
      title: 'Mejora con Prep Course',
      value: `${prepImpact >= 0 ? '+' : ''}${formatNumber(prepImpact, 1)} pts`,
      subtitle: 'vs estudiantes sin preparación',
      icon: '📚',
      color: 'success',
    },
    {
      title: 'Total Estudiantes',
      value: totalStudents.toLocaleString('es-MX'),
      subtitle: 'en el dataset',
      icon: '👥',
      color: 'primary',
    },
  ]

  // Charts data
  const educationPerformance = aggregateByKey(data, 'parental_education', 'math_score', 'avg').sort(
    (a, b) => b.value - a.value,
  )

  const genderAveragesMap = data.reduce(
    (acc, row) => {
      const g = row.gender
      if (!acc[g]) {
        acc[g] = {
          gender: g,
          math_sum: 0,
          reading_sum: 0,
          writing_sum: 0,
          count: 0,
        }
      }
      acc[g].math_sum += row.math_score || 0
      acc[g].reading_sum += row.reading_score || 0
      acc[g].writing_sum += row.writing_score || 0
      acc[g].count += 1
      return acc
    },
    {},
  )

  const genderScores = Object.values(genderAveragesMap).map((row) => ({
    gender: row.gender === 'female' ? 'Female' : 'Male',
    math: row.count ? row.math_sum / row.count : 0,
    reading: row.count ? row.reading_sum / row.count : 0,
    writing: row.count ? row.writing_sum / row.count : 0,
  }))

  const ethnicityCounts = aggregateByKey(data, 'ethnicity', 'math_score', 'count')

  const scatterSource = data.filter(
    (row) =>
      typeof row.reading_score === 'number' &&
      typeof row.writing_score === 'number' &&
      row.test_prep,
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{APP_CONFIG.title}</h1>
        <p className={styles.subtitle}>Análisis general del dataset de 1,000 estudiantes</p>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          No se pudo conectar con la base de datos. Verifica tu configuración.
        </div>
      )}

      {loading ? (
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonBox} />
          <div className={styles.skeletonBox} />
          <div className={styles.skeletonBox} />
          <div className={styles.skeletonBox} />
        </div>
      ) : (
        <div className={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              icon={kpi.icon}
              color={kpi.color}
            />
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <section className={styles.chartsRow}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Rendimiento por Educación Familiar</h2>
                <p className={styles.cardSubtitle}>
                  Promedio de matemáticas por nivel educativo de los padres
                </p>
              </div>
              <BarChartWidget
                data={educationPerformance}
                xKey="name"
                yKey="value"
                color="#4F46E5"
                height={280}
                layout="vertical"
              />
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Comparación de Scores por Materia</h2>
                <p className={styles.cardSubtitle}>
                  Promedio de matemáticas, lectura y escritura por género
                </p>
              </div>
              <GroupedBarChartWidget
                data={genderScores}
                xKey="gender"
                series={[
                  { key: 'math', label: 'Math', color: '#4F46E5' },
                  { key: 'reading', label: 'Reading', color: '#10B981' },
                  { key: 'writing', label: 'Writing', color: '#F59E0B' },
                ]}
              />
            </div>
          </section>

          <section className={styles.chartsRowWideLeft}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Reading vs Writing Score</h2>
                <p className={styles.cardSubtitle}>
                  Coloreado por si completó el curso de preparación
                </p>
              </div>
              <ScatterByCategoryChart
                data={scatterSource}
                xKey="reading_score"
                yKey="writing_score"
                categoryKey="test_prep"
                categories={[
                  { value: 'completed', label: 'Curso completado', color: '#4F46E5' },
                  { value: 'none', label: 'Sin curso', color: '#94A3B8' },
                ]}
              />
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Distribución por Grupo Étnico</h2>
                <p className={styles.cardSubtitle}>
                  Porcentaje de estudiantes por grupo en el dataset
                </p>
              </div>
              <PieChartWidget
                data={ethnicityCounts}
                nameKey="name"
                valueKey="value"
                title={null}
                height={280}
              />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
