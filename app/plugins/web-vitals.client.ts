import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals'

export default defineNuxtPlugin(() => {
  if (process.client) {
    const reportMetric = (metric: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vitals]', metric.name, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta
        })
      }

      if (process.env.NODE_ENV === 'production') {
        // Здесь можно отправлять метрики в аналитику (Google Analytics, etc.)
        // gtag('event', metric.name, { ... })
      }
    }

    onCLS(reportMetric)
    onINP(reportMetric)
    onLCP(reportMetric)
    onTTFB(reportMetric)
  }
})

