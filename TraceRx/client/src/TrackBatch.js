import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/PharmaSupplyChain.json";
import { QRCodeCanvas } from 'qrcode.react';
import "./TrackBatch.css";

function Track() {
  const history = useHistory();

  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState();
  const [MedStage, setMedStage] = useState();
  const [ID, setID] = useState();
  const [RMS, setRMS] = useState();
  const [MAN, setMAN] = useState();
  const [DIS, setDIS] = useState();
  const [RET, setRET] = useState();

  const [TrackTillSold, showTrackTillSold] = useState(false);
  const [TrackTillRetail, showTrackTillRetail] = useState(false);
  const [TrackTillDistribution, showTrackTillDistribution] = useState(false);
  const [TrackTillManufacture, showTrackTillManufacture] = useState(false);
  const [TrackTillRMS, showTrackTillRMS] = useState(false);
  const [TrackTillOrdered, showTrackTillOrdered] = useState(false);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  };

  const loadBlockchaindata = async () => {
    setloader(true);
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    setCurrentaccount(account);
    const networkId = await web3.eth.net.getId();
    const networkData = SupplyChainABI.networks[networkId];
    if (networkData) {
      const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
      setSupplyChain(supplychain);

      const medCtr = await supplychain.methods.medicineCtr().call();
      const med = {};
      const medStage = [];
      for (let i = 0; i < medCtr; i++) {
        med[i + 1] = await supplychain.methods.MedicineStock(i + 1).call();
        medStage[i + 1] = await supplychain.methods.showStage(i + 1).call();
      }
      setMED(med);
      setMedStage(medStage);

      const rmsCtr = await supplychain.methods.rmsCtr().call();
      const rms = {};
      for (let i = 0; i < rmsCtr; i++) rms[i + 1] = await supplychain.methods.RMS(i + 1).call();
      setRMS(rms);

      const manCtr = await supplychain.methods.manCtr().call();
      const man = {};
      for (let i = 0; i < manCtr; i++) man[i + 1] = await supplychain.methods.MAN(i + 1).call();
      setMAN(man);

      const disCtr = await supplychain.methods.disCtr().call();
      const dis = {};
      for (let i = 0; i < disCtr; i++) dis[i + 1] = await supplychain.methods.DIS(i + 1).call();
      setDIS(dis);

      const retCtr = await supplychain.methods.retCtr().call();
      const ret = {};
      for (let i = 0; i < retCtr; i++) ret[i + 1] = await supplychain.methods.RET(i + 1).call();
      setRET(ret);

      setloader(false);
    } else {
      window.alert('The smart contract is not deployed to current network');
    }
  };

  const redirect_to_home = () => history.push('/');

  const handlerChangeID = (e) => setID(e.target.value);

  const handlerSubmit = async (event) => {
    event.preventDefault();
    const ctr = await SupplyChain.methods.medicineCtr().call();
    if (!((ID > 0) && (ID <= ctr))) {
      alert("The batch id is invalid.");
    } else {
      // eslint-disable-next-line
      if (MED[ID].stage == 5) showTrackTillSold(true);
      // eslint-disable-next-line
      else if (MED[ID].stage == 4) showTrackTillRetail(true);
      // eslint-disable-next-line
      else if (MED[ID].stage == 3) showTrackTillDistribution(true);
      // eslint-disable-next-line
      else if (MED[ID].stage == 2) showTrackTillManufacture(true);
      // eslint-disable-next-line
      else if (MED[ID].stage == 1) showTrackTillRMS(true);
      // eslint-disable-next-line
      else showTrackTillOrdered(true);
    }
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch (_) {}
  };

  const stageClass = (label = "") => {
    const l = String(label).toLowerCase();
    if (l.includes("sold")) return "stage-sold";
    if (l.includes("retail")) return "stage-retail";
    if (l.includes("distribut")) return "stage-distributed";
    if (l.includes("manufact")) return "stage-manufactured";
    if (l.includes("supply") || l.includes("raw")) return "stage-supplied";
    if (l.includes("order")) return "stage-ordered";
    return "stage-default";
  };

  if (loader) return <h1 className="wait rx-center">Loading...</h1>;

  /* ---------- Stage-specific views ---------- */
  const DetailHeader = () => (
    <div className="rx-header-row">
      <div className="addr-line">
        <span className="addr-label">Connected Wallet:&nbsp;</span>
        <span className="addr-mono ellipsis" title={currentaccount}>{currentaccount}</span>
        <button className="copy-btn" type="button" onClick={() => copyToClipboard(currentaccount)} title="Copy address">Copy</button>
      </div>
      <button type="button" onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
    </div>
  );

  const BatchCard = ({ title }) => (
    <article className="rx-card track-card">
      <h3 className="track-title">{title}</h3>
      <div className="track-kv"><b>Batch ID: </b>{MED[ID].id}</div>
      <div className="track-kv"><b>Batch / Product: </b>{MED[ID].name}</div>
      <div className="track-kv"><b>Notes: </b>{MED[ID].description}</div>
      <div className="track-kv">
        <b>Current Stage: </b>
        <span className={`stage-badge ${stageClass(MedStage[ID])}`}>{MedStage[ID]}</span>
      </div>
    </article>
  );

  const PartyCard = ({ heading, party }) => (
    <article className="rx-card track-card">
      <h4 className="track-subtitle">{heading}</h4>
      <p><b>ID: </b>{party.id}</p>
      <p><b>Name: </b>{party.name}</p>
      <p><b>Location: </b>{party.place}</p>
    </article>
  );

  if (TrackTillSold) {
    return (
      <div className="track-page">
        <DetailHeader />
        <h4 className="rx-section-title">Track Medicine Batches</h4>

        <BatchCard title="Batch Details" />
        <div className="track-flow">
          <PartyCard heading="Raw Materials Supplier" party={RMS[MED[ID].RMSid]} />
          <PartyCard heading="Manufacturer" party={MAN[MED[ID].MANid]} />
          <PartyCard heading="Distributor" party={DIS[MED[ID].DISid]} />
          <PartyCard heading="Retailer" party={RET[MED[ID].RETid]} />
          <article className="rx-card track-card"><h4 className="track-subtitle">Sold</h4></article>
        </div>

        <div className="track-actions">
          <button onClick={() => showTrackTillSold(false)} className="rx-btn rx-btn-primary">Track Another Batch</button>
          <button onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
        </div>
      </div>
    );
  }

  if (TrackTillRetail) {
    return (
      <div className="track-page">
        <DetailHeader />
        <h4 className="rx-section-title">Track Medicine Batches</h4>

        <BatchCard title="Batch Details" />
        <div className="track-flow">
          <PartyCard heading="Raw Materials Supplier" party={RMS[MED[ID].RMSid]} />
          <PartyCard heading="Manufacturer" party={MAN[MED[ID].MANid]} />
          <PartyCard heading="Distributor" party={DIS[MED[ID].DISid]} />
          <PartyCard heading="Retailer" party={RET[MED[ID].RETid]} />
        </div>

        <div className="track-actions">
          <button onClick={() => showTrackTillRetail(false)} className="rx-btn rx-btn-primary">Track Another Batch</button>
          <button onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
        </div>
      </div>
    );
  }

  if (TrackTillDistribution) {
    return (
      <div className="track-page">
        <DetailHeader />
        <h4 className="rx-section-title">Track Medicine Batches</h4>

        <BatchCard title="Batch Details" />
        <div className="track-flow">
          <PartyCard heading="Raw Materials Supplier" party={RMS[MED[ID].RMSid]} />
          <PartyCard heading="Manufacturer" party={MAN[MED[ID].MANid]} />
          <PartyCard heading="Distributor" party={DIS[MED[ID].DISid]} />
        </div>

        <div className="track-actions">
          <button onClick={() => showTrackTillDistribution(false)} className="rx-btn rx-btn-primary">Track Another Batch</button>
          <button onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
        </div>
      </div>
    );
  }

  if (TrackTillManufacture) {
    return (
      <div className="track-page">
        <DetailHeader />
        <h4 className="rx-section-title">Track Medicine Batches</h4>

        <BatchCard title="Batch Details" />
        <div className="track-flow">
          <PartyCard heading="Raw Materials Supplier" party={RMS[MED[ID].RMSid]} />
          <PartyCard heading="Manufacturer" party={MAN[MED[ID].MANid]} />
        </div>

        <div className="track-actions">
          <button onClick={() => showTrackTillManufacture(false)} className="rx-btn rx-btn-primary">Track Another Batch</button>
          <button onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
        </div>
      </div>
    );
  }

  if (TrackTillRMS) {
    return (
      <div className="track-page">
        <DetailHeader />
        <h4 className="rx-section-title">Track Medicine Batches</h4>

        <BatchCard title="Batch Details" />
        <div className="track-flow">
          <PartyCard heading="Raw Materials Supplier" party={RMS[MED[ID].RMSid]} />
        </div>

        <div className="track-actions">
          <button onClick={() => showTrackTillRMS(false)} className="rx-btn rx-btn-primary">Track Another Batch</button>
          <button onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
        </div>
      </div>
    );
  }

  if (TrackTillOrdered) {
    const batchData = {
      id: MED[ID]?.id,
      name: MED[ID]?.name,
      description: MED[ID]?.description,
      currentStage: MedStage[ID]
    };
    const batchDataString = JSON.stringify(batchData);

    return (
      <div className="track-page">
        <DetailHeader />
        <h4 className="rx-section-title">Track Medicine Batches</h4>

        <BatchCard title="Batch Details" />
        <article className="rx-card track-card">
          <h5>Batch Not Yet Processed…</h5>
          <div className="qr-code-container">
            <h4>QR Code</h4>
            <QRCodeCanvas value={batchDataString} />
          </div>
        </article>

        <div className="track-actions">
          <button onClick={() => showTrackTillOrdered(false)} className="rx-btn rx-btn-primary">Track Another Batch</button>
          <button onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
        </div>
      </div>
    );
  }

  /* ---------- Default list + search ---------- */
  return (
    <div className="track-page">
      <div className="rx-header-row">
        <div className="addr-line">
          <span className="addr-label">Connected Wallet:&nbsp;</span>
          <span className="addr-mono ellipsis" title={currentaccount}>{currentaccount}</span>
          <button className="copy-btn" type="button" onClick={() => copyToClipboard(currentaccount)} title="Copy address">Copy</button>
        </div>
        <button type="button" onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
      </div>

      <h4 className="rx-section-title">Track Medicine Batches</h4>

      <div className="rx-card track-form">
        <div className="track-form-grid">
          <div className="form-group">
            <label className="rx-label" htmlFor="batchId">Enter Batch / Order ID</label>
            <input
              id="batchId"
              className="form-control-sm rx-input"
              type="text"
              onChange={e => handlerChangeID(e)}
              placeholder="Batch ID (e.g., 1)"
              required
            />
          </div>
          <div className="form-actions">
            <button className="rx-btn rx-btn-primary" onClick={handlerSubmit}>Track</button>
          </div>
        </div>
        <div className="track-help">Use the on-chain batch ID. Example: 1, 2, 3…</div>
      </div>

      <div className="rx-table">
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Batch / Product</th>
              <th>Notes</th>
              <th>Current Stage</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(MED).map(key => (
              <tr key={key}>
                <td className="id-col">{MED[key].id}</td>
                <td>{MED[key].name}</td>
                <td className="ellipsis">{MED[key].description}</td>
                <td>
                  <span className={`stage-badge ${stageClass(MedStage[key])}`}>{MedStage[key]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.keys(MED).length === 0 && (
        <p className="rx-empty">No batches to display yet. Enter a valid Batch ID above.</p>
      )}
    </div>
  );
}

export default Track;