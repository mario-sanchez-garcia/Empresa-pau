'use client'

import { motion } from 'framer-motion'
import { Check, Lock, MapPin, Star } from 'lucide-react'
import { progressNodes } from '@/app/lib/camino/caminoData'

type NodeStatus = 'completed' | 'current' | 'next' | 'locked'

const NODE_CFG: Record<NodeStatus, {
  cardBg: string; cardBorder: string;
  iconBg: string; iconColor: string; iconBorder: string;
  pillBg: string; pillText: string;
  label: string
}> = {
  completed: {
    cardBg: '#f0fdf4', cardBorder: '#86efac',
    iconBg: 'linear-gradient(135deg, #16a34a, #22c55e)', iconColor: '#fff', iconBorder: '#4ade80',
    pillBg: '#dcfce7', pillText: '#166534',
    label: 'Completado',
  },
  current: {
    cardBg: '#eff6ff', cardBorder: '#93c5fd',
    iconBg: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', iconColor: '#fff', iconBorder: '#60a5fa',
    pillBg: '#dbeafe', pillText: '#1e40af',
    label: 'Actual',
  },
  next: {
    cardBg: '#f8fafc', cardBorder: '#e2e8f0',
    iconBg: '#fff', iconColor: '#2563eb', iconBorder: '#dbeafe',
    pillBg: '#f1f5f9', pillText: '#475569',
    label: 'Próximo',
  },
  locked: {
    cardBg: '#f8fafc', cardBorder: '#e2e8f0',
    iconBg: '#f1f5f9', iconColor: '#94a3b8', iconBorder: '#e2e8f0',
    pillBg: '#f1f5f9', pillText: '#9ca3af',
    label: 'Bloqueado',
  },
}

function NodeIcon({ status }: { status: NodeStatus }) {
  const props = { strokeWidth: 2.5 }
  if (status === 'completed') return <Check   size={20} {...props} />
  if (status === 'current')   return <MapPin  size={19} {...props} />
  if (status === 'next')      return <Star    size={18} {...props} />
  return <Lock size={17} {...props} />
}

export default function ProgressPath() {
  return (
    <section style={{
      borderRadius: 20, background: '#fff',
      border: '1.5px solid rgba(219,231,248,0.9)',
      padding: '20px 20px',
      boxShadow: '0 2px 12px rgba(37,99,235,0.06)',
    }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Mini mapa de progreso
        </p>
        <h2 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Bloques del camino
        </h2>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Connector track */}
        <div aria-hidden style={{
          position: 'absolute', top: 27, left: 28, right: 28, height: 2, zIndex: 0,
          borderRadius: 99,
          background: 'linear-gradient(90deg, #4ade80 0%, #93c5fd 28%, #e2e8f0 55%, #e2e8f0 100%)',
        }} />

        <div
          className="grid-cols-2 md:grid-cols-4"
          style={{ display: 'grid', gap: 12, position: 'relative', zIndex: 1 }}
        >
          {progressNodes.map((node, i) => {
            const cfg = NODE_CFG[node.status]
            const isCurrent = node.status === 'current'

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  borderRadius: 16,
                  border: `1.5px solid ${cfg.cardBorder}`,
                  background: cfg.cardBg,
                  padding: '14px 12px',
                }}
              >
                {/* Icon wrapper */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background: cfg.iconBg,
                    border: `1.5px solid ${cfg.iconBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.iconColor,
                    boxShadow: isCurrent ? '0 6px 20px rgba(37,99,235,0.30)' : 'none',
                  }}>
                    <NodeIcon status={node.status} />
                  </div>

                  {/* Pulse ring for current */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.40, 1], opacity: [0.65, 0, 0.65] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      aria-hidden
                      style={{
                        position: 'absolute', inset: -7,
                        borderRadius: 20,
                        border: '2px solid #3b82f6',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>

                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  {node.label}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: 11.5, fontWeight: 500, color: '#64748b', lineHeight: 1.45 }}>
                  {node.description}
                </p>
                <span style={{
                  display: 'inline-block', marginTop: 9,
                  padding: '2.5px 9px', borderRadius: 99,
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase',
                  background: cfg.pillBg, color: cfg.pillText,
                }}>
                  {cfg.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
