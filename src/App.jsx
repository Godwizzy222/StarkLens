import { useState } from 'react'
import './App.css'

const TABS = ['Wallet Tracker', 'Swap', 'DeFi Apps', 'Protocol Stats']

const DEFI_APPS = [
  { name: 'JediSwap', category: 'DEX', description: 'Leading AMM on Starknet', url: 'https://jediswap.xyz' },
  { name: 'AVNU', category: 'DEX Aggregator', description: 'Best swap rates on Starknet', url: 'https://avnu.fi' },
  { name: 'Ekubo', category: 'DEX', description: 'Concentrated liquidity AMM', url: 'https://ekubo.org' },
  { name: 'Vesu', category: 'Lending', description: 'Borrow and lend on Starknet', url: 'https://vesu.io' },
  { name: 'Nostra', category: 'Lending', description: 'Multi-layer money market', url: 'https://nostra.finance' },
  { name: 'LayerSwap', category: 'Bridge', description: 'Bridge assets to Starknet fast', url: 'https://layerswap.io' },
  { name: 'Orbiter Finance', category: 'Bridge', description: 'Cross-rollup bridge', url: 'https://orbiter.finance' },
  { name: 'Endur', category: 'Staking', description: 'Liquid staking on Starknet', url: 'https://endur.fi' },
]

const BADGE_COLORS = {
  'DEX': { bg: '#1a2f1a', color: '#4ade80' },
  'DEX Aggregator': { bg: '#1a2a3f', color: '#60a5fa' },
  'Lending': { bg: '#2f1a2f', color: '#c084fc' },
  'Bridge': { bg: '#2f2a1a', color: '#fbbf24' },
  'Staking': { bg: '#1a2f2f', color: '#2dd4bf' },
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Wallet Tracker')
  const [address, setAddress] = useState('')
  const [walletData, setWalletData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [protocols, setProtocols] = useState([])
  const [protocolsLoading, setProtocolsLoading] = useState(false)
  const [swapFrom, setSwapFrom] = useState('ETH')
  const [swapTo, setSwapTo] = useState('USDC')
  const [swapAmount, setSwapAmount] = useState('')

 const fetchWallet = async () => {
  if (!address.trim()) return
  setLoading(true)
  setError('')
  setWalletData(null)
  try {
    const res = await fetch(
      `https://api.mobula.io/api/1/wallet/portfolio?wallet=${address.trim()}`,
      { headers: { Authorization: import.meta.env.VITE_MOBULA_API_KEY } }
    )
    const data = await res.json()
    if (data.data) {
      const starknetAssets = data.data.assets?.filter(asset =>
        asset.asset?.blockchains?.some(b =>
          b.toLowerCase().includes('starknet') ||
          b.toLowerCase().includes('stark')
        )
      )
      setWalletData({
        ...data.data,
        assets: starknetAssets?.length > 0 ? starknetAssets : data.data.assets
      })
    } else {
      setError('No data found for this address.')
    }
  } catch {
    setError('Failed to fetch wallet data. Check your API key.')
  }
  setLoading(false)
}

  const fetchProtocols = async () => {
    setProtocolsLoading(true)
    try {
      const res = await fetch('https://api.llama.fi/protocols')
      const data = await res.json()
      const starknet = data
        .filter(p => p.chains && p.chains.includes('Starknet'))
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, 12)
      setProtocols(starknet)
    } catch {
      setProtocols([])
    }
    setProtocolsLoading(false)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    if (tab === 'Protocol Stats' && protocols.length === 0) {
      fetchProtocols()
    }
  }

  const formatUSD = (n) => {
    if (!n) return '$0'
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
    return `$${n.toFixed(2)}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>

      {/* NAV */}
      <nav style={{
        background: '#0d0d15',
        borderBottom: '1px solid #1e1e2e',
        padding: '0 2rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>
            Stark<span style={{ color: '#f97316' }}>Lens</span>
          </span>
          <span style={{
            fontSize: '10px',
            background: '#1a1a2e',
            border: '1px solid #f97316',
            color: '#f97316',
            padding: '2px 8px',
            borderRadius: '20px',
            fontWeight: '500'
          }}>MAINNET</span>
        </div>
        <button style={{
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          color: '#fff',
          border: 'none',
          padding: '8px 20px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          Connect Wallet
        </button>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '3rem 1rem 2rem' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '12px' }}>
          Your Starknet <span style={{ color: '#f97316' }}>Universe</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
          Track wallets, swap tokens, explore DeFi apps and monitor protocol stats — all in one place.
        </p>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '0 1rem 2rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: activeTab === tab ? '1px solid #f97316' : '1px solid #1e1e2e',
              background: activeTab === tab ? 'rgba(249,115,22,0.15)' : '#0d0d15',
              color: activeTab === tab ? '#f97316' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>

        {/* WALLET TRACKER */}
        {activeTab === 'Wallet Tracker' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem' }}>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchWallet()}
                placeholder="Paste any Starknet wallet address..."
                style={{
                  flex: 1,
                  background: '#0d0d15',
                  border: '1px solid #1e1e2e',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={fetchWallet}
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Loading...' : 'Track'}
              </button>
            </div>

            {error && (
              <div style={{ background: '#1f0a0a', border: '1px solid #7f1d1d', borderRadius: '10px', padding: '1rem', color: '#f87171', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {walletData && (
              <div>
                {/* STATS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
                  {[
                    { label: 'Total Value', value: formatUSD(walletData.total_wallet_balance) },
                    { label: 'Assets', value: walletData.assets?.length || 0 },
                    { label: '24h Change', value: walletData.total_realized_pnl_1d ? formatUSD(walletData.total_realized_pnl_1d) : 'N/A' },
                  ].map(stat => (
                    <div key={stat.label} style={{
                      background: '#0d0d15',
                      border: '1px solid #1e1e2e',
                      borderRadius: '12px',
                      padding: '1.2rem 1.4rem'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* ASSETS */}
                <div style={{ background: '#0d0d15', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #1e1e2e' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>Token Holdings</span>
                  </div>
                  {walletData.assets?.slice(0, 10).map((asset, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.4rem',
                      borderBottom: '1px solid #1e1e2e'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {asset.asset?.logo && <img src={asset.asset.logo} width={32} height={32} style={{ borderRadius: '50%' }} alt="" />}
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '14px' }}>{asset.asset?.symbol || 'Unknown'}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{asset.asset?.name}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{formatUSD(asset.estimated_balance)}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{parseFloat(asset.token_balance || 0).toFixed(4)} {asset.asset?.symbol}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!walletData && !loading && !error && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <p>Enter a Starknet wallet address to see its full portfolio</p>
              </div>
            )}
          </div>
        )}

        {/* SWAP */}
        {activeTab === 'Swap' && (
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ background: '#0d0d15', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>Swap Tokens</span>
                <span style={{ fontSize: '12px', background: '#1a2f1a', color: '#4ade80', padding: '4px 10px', borderRadius: '20px' }}>0 Gas Fees</span>
              </div>

              {/* FROM */}
              <div style={{ background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '1rem', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>From</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={swapAmount}
                    onChange={e => setSwapAmount(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', fontWeight: '700', outline: 'none', width: '60%' }}
                  />
                  <select
                    value={swapFrom}
                    onChange={e => setSwapFrom(e.target.value)}
                    style={{ background: '#1e1e2e', border: '1px solid #2e2e3e', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}
                  >
                    {['ETH', 'USDC', 'USDT', 'STRK', 'DAI', 'WBTC'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* ARROW */}
              <div style={{ textAlign: 'center', margin: '4px 0' }}>
                <button
                  onClick={() => { const tmp = swapFrom; setSwapFrom(swapTo); setSwapTo(tmp) }}
                  style={{ background: '#1e1e2e', border: '1px solid #2e2e3e', color: '#f97316', width: '36px', height: '36px', borderRadius: '50%', fontSize: '16px' }}
                >⇅</button>
              </div>

              {/* TO */}
              <div style={{ background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>To</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#6b7280' }}>0.00</span>
                  <select
                    value={swapTo}
                    onChange={e => setSwapTo(e.target.value)}
                    style={{ background: '#1e1e2e', border: '1px solid #2e2e3e', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}
                  >
                    {['USDC', 'ETH', 'USDT', 'STRK', 'DAI', 'WBTC'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ background: '#0a0a0f', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '13px', color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                <span>Gas Fee</span>
                <span style={{ color: '#4ade80', fontWeight: '600' }}>$0.00 (Gasless)</span>
              </div>

              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700'
              }}>
                Connect Wallet to Swap
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
                Powered by Starkzap SDK — Gasless swaps on Starknet
              </p>
            </div>
          </div>
        )}

        {/* DEFI APPS */}
        {activeTab === 'DeFi Apps' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {DEFI_APPS.map(app => (
              <a key={app.name} href={app.url} target="_blank" rel="noreferrer" style={{
                background: '#0d0d15',
                border: '1px solid #1e1e2e',
                borderRadius: '12px',
                padding: '1.2rem 1.4rem',
                display: 'block',
                transition: 'border-color 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '600', fontSize: '15px' }}>{app.name}</span>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: BADGE_COLORS[app.category]?.bg || '#1e1e2e',
                    color: BADGE_COLORS[app.category]?.color || '#fff',
                    fontWeight: '500'
                  }}>{app.category}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{app.description}</p>
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#f97316' }}>Visit app →</div>
              </a>
            ))}
          </div>
        )}

        {/* PROTOCOL STATS */}
        {activeTab === 'Protocol Stats' && (
          <div>
            {protocolsLoading && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>Loading Starknet protocols...</div>
            )}
            {!protocolsLoading && protocols.length > 0 && (
              <div style={{ background: '#0d0d15', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600' }}>Starknet Protocols</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>via DeFiLlama</span>
                </div>
                {protocols.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.4rem',
                    borderBottom: '1px solid #1e1e2e'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {p.logo && <img src={p.logo} width={32} height={32} style={{ borderRadius: '50%' }} alt="" />}
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.category}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#4ade80' }}>{formatUSD(p.tvl)}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>TVL</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
