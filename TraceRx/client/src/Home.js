import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import './Home.css';

function Home() {
  const history = useHistory();
  const [clicked, setClicked] = useState(false);
  const [account, setAccount] = useState('');

  const logoFiles = ["Pfizer_logo.png", "Johnson&Johnson_logo.png", "Abbott_logo.svg", "Getz_logo.png", "WHO_logo.png"];

  useEffect(() => {
    const loadAccount = async () => {
      try {
        if (window?.ethereum?.request) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setAccount(accounts?.[0] || '');
          window.ethereum.on?.('accountsChanged', (accs) => setAccount(accs?.[0] || ''));
        }
      } catch { /* no-op */ }
    };
    loadAccount();
    return () => {
      try { window.ethereum?.removeListener?.('accountsChanged', () => {}); } catch {}
    };
  }, []);

  const redirectTo = (path) => {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
      history.push(path);
    }, 500);
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const altFromFile = (f) => f.replace(/\.png$/i, '').replace(/[-_]/g, ' ');

  return (
    <div className="home-page">
      <div className="rx-container">
        {/* Header */}
        <div className="rx-header-row">
          <div className="addr-line">
            <span className="addr-label">Connected Wallet:&nbsp;</span>
            <span className="addr-mono ellipsis" title={account || 'Not connected'}>
              {account || 'Not connected'}
            </span>
            {account && (
              <button
                type="button"
                className="copy-btn"
                onClick={() => copyToClipboard(account)}
                title="Copy address"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        {/* Console (top) */}
        <section className="home-section">
          <div className="home-card">
            <h1 className="home-title">TraceRx</h1>
            <p className="home-sub">Pharma Supply Chain Console</p>

            <div className="home-actions">
              <button
                className={`fancyButton rx-btn rx-btn-primary ${clicked ? 'burst' : ''}`}
                onClick={() => redirectTo('/RegisterRoles')}
                aria-label="Open Register Roles"
              >
                Register Roles
              </button>
              <button
                className={`fancyButton rx-btn rx-btn-primary ${clicked ? 'burst' : ''}`}
                onClick={() => redirectTo('/CreateBatchOrder')}
                aria-label="Open Create Batch Order"
              >
                Create Batch Order
              </button>
              <button
                className={`fancyButton rx-btn rx-btn-primary ${clicked ? 'burst' : ''}`}
                onClick={() => redirectTo('/TrackBatch')}
                aria-label="Open Track Batch"
              >
                Track Batch
              </button>
              <button
                className={`fancyButton rx-btn rx-btn-primary ${clicked ? 'burst' : ''}`}
                onClick={() => redirectTo('/ProcessBatches')}
                aria-label="Open Process Batches"
              >
                Process Batches
              </button>
            </div>

            <p className="home-caption">
              Assign your partners supply chain roles. Place and track—in real-time—context-rich medicine batch orders. Hold full-chain control by executing every stage—from Supply to Retail—with verifiable, audit-grade visibility.


            </p>
          </div>
        </section>

        {/* Instructions */}
        <section className="home-section">
          <div className="home-info">
            <h2 className="info-title">How TraceRx Works</h2>
            <ul className="info-list">
              <li><span>1</span> Register partners and assign roles — Register Roles</li>
              <li><span>2</span> Create a batch order (product, qty, notes) — Create Batch Order</li>
              <li><span>3</span> Track the batch by its on-chain ID — Track Batch</li>
              <li><span>4</span> Advance the stage at each handoff (Supply → Manufacture → Distribute → Retail → Sold) — Process Batches</li>
              <li><span>5</span> Explore, audit, or share the trail</li>
            </ul>

            <div className="pill-row">
              <div className="pill">E2E Visibility</div>
              <div className="pill">Tamper-Evident</div>
              <div className="pill">Audit-Ready</div>
            </div>
          </div>
        </section>

        {/* Assurance */}
        <section className="home-section">
          <div className="assurance">
            <div className="assurance-item">
              <div className="assurance-dot dot-green" />
              <div>
                <div className="assurance-title">Immutable Ledger</div>
                <div className="assurance-sub">On-chain traceability for every batch event.</div>
              </div>
            </div>
            <div className="assurance-item">
              <div className="assurance-dot dot-yellow" />
              <div>
                <div className="assurance-title">Serialization-Compatible</div>
                <div className="assurance-sub">Works alongside GS1/GTIN workflows.</div>
              </div>
            </div>
            <div className="assurance-item">
              <div className="assurance-dot dot-red" />
              <div>
                <div className="assurance-title">Controlled Access</div>
                <div className="assurance-sub">Role-based actions for each supply step.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted by (uses /public/logos/*.png) */}
        <section className="home-section">
          <div className="trusted-card">
            <div className="trusted-head">Trusted by Teams Across Pharma & Logistics</div>
            <div className="logo-grid">
              {logoFiles.map((file, idx) => (
                <a className="logo-box" key={idx} href="#" aria-label={altFromFile(file)}>
                  <img className="logo-img" src={`/logos/${file}`} alt={altFromFile(file)} />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="home-section">
          <div className="support-card">
            <div className="support-left">
              <h3 className="support-title">Need help?</h3>
              <p className="support-sub">We’re here for onboarding, troubleshooting, and best practices.</p>
            </div>

            <div className="support-right">
              <a className="support-btn" href="mailto:arafey.bsds23seecs@seecs.edu.pk">
                Email Support
              </a>
              <div className="support-links">
                <a href="#" aria-disabled="true">Docs</a>
                <a href="#" aria-disabled="true">Status</a>
                <a href="#" aria-disabled="true">Community</a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Home;