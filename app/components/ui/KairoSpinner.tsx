export default function KairoSpinner() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <style>{`@keyframes ks-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(37,99,235,0.15)', borderTopColor: '#2563eb', animation: 'ks-spin 0.7s linear infinite' }} />
    </div>
  )
}
