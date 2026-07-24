'use client'

import { motion } from 'framer-motion'
import { Check, Lock, MapPin, Star } from 'lucide-react'
import { progressNodes } from '@/app/lib/camino/caminoData'

type NodeStatus = 'completed' | 'current' | 'next' | 'locked'

const NODE_CFG: Record<NodeStatus, {
  circleBg: string; circleColor: string; circleBorder: string; circleShadow: string;
  pillBg: string; pillText: string; label: string; dotColor: string;
}> = {
  completed: {
    circleBg: 'linear-gradient(135deg, #16a34a, #22c55e)',
    circleColor: '#fff', circleBorder: '#4ade80',
    circleShadow: '0 6px 18px rgba(22,163,74,0.28)',
    pillBg: '#dcfce7', pillText: '#166534', label: 'Completado', dotColor: '#4ade80',
  },
  current: {
    circleBg: '#1c1c1c',
    circleColor: '#fff', circleBorder: '#555',
    circleShadow: '0 4px 12px rgba(0,0,0,0.18)',
    pillBg: '#f5f5f5', pillText: '#1c1c1c', label: 'Actual', dotColor: '#1c1c1c',
  },
  next: {
    circleBg: '#fff',
    circleColor: '#1c1c1c', circleBorder: '#e0e0e0',
    circleShadow: '0 2px 8px rgba(0,0,0,0.06)',
    pillBg: '#f1f5f9', pillText: '#475569', label: 'Próximo', dotColor: '#e2e8f0',
  },
  locked: {
    circleBg: '#f8fafc',
    circleColor: '#94a3b8', circleBorder: '#e2e8f0',
    circleShadow: 'none',
    pillBg: '#f1f5f9', pillText: '#9ca3af', label: 'Bloqueado', dotColor: '#e2e8f0',
  },
}

function NodeIcon({ status }: { status: NodeStatus }) {
  const props = { strokeWidth: 2.5 }
  if (status === 'completed') return <Check   size={21} {...props} />
  if (status === 'current')   return <MapPin  size={20} {...props} />
  if (status === 'next')      return <Star    size={19} {...props} />
  return <Lock size={17} {...props} />
}

export default function ProgressPath() {
  return (
    <section
      style={{
        borderRadius: 8, background: '#fff',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        padding: '22px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 4 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Tu ruta de aprendizaje
          </p>
          <h2 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 900, color: '#111827', letterSpacing: '-0.022em' }}>
            Bloques del camino
          </h2>
        </div>
      </div>

      {/* Nodes */}
      <div style={{ position: 'relative' }}>
        {/* Connector track */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: 26, left: 26, right: 26, height: 2, zIndex: 0,
            borderRadius: 99,
            background: 'linear-gradient(90deg, #4ade80 0%, #4ade80 20%, #1c1c1c 40%, #e2e8f0 60%, #e2e8f0 100%)',
          }}
        />

        <div
          className="grid-cols-2 md:grid-cols-4"
          style={{ display: 'grid', gap: 16, position: 'relative', zIndex: 1 }}
        >
          {progressNodes.map((node, i) => {
            const cfg       = NODE_CFG[node.status]
            const isCurrent = node.status === 'current'

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                {/* Circle */}
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: cfg.circleBg,
                    border: `2px solid ${cfg.circleBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.circleColor,
                    boxShadow: cfg.circleShadow,
                  }}>
                    <NodeIcon status={node.status} />
                  </div>

                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      aria-hidden
                      style={{
                        position: 'absolute', inset: -7, borderRadius: '50%',
                        border: '2px solid #3b82f6', pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <h3 style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                  {node.label}
                </h3>
                <p style={{ margin: '3px 0 6px', fontSize: 11, fontWeight: 500, color: '#64748b', lineHeight: 1.4 }}>
                  {node.description}
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '2.5px 10px', borderRadius: 99,
                  fontSize: 9.5, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
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
