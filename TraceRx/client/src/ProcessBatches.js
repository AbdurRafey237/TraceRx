import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/PharmaSupplyChain.json";
import './ProcessBatches.css';

function Supply() {
  const history = useHistory();
  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState({});
  const [MedStage, setMedStage] = useState([]);
  const [ID, setID] = useState("");

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
        med[i] = await supplychain.methods.MedicineStock(i + 1).call();
        medStage[i] = await supplychain.methods.showStage(i + 1).call();
      }
      setMED(med);
      setMedStage(medStage);
      setloader(false);
    } else {
      window.alert('The smart contract is not deployed to the current network');
    }
  };

  const redirect_to_home = () => history.push('/');

  const handlerChangeID = (event) => setID(event.target.value);

  const handlerSubmitRMSsupply = async (event) => {
    event.preventDefault();
    try {
      const receipt = await SupplyChain.methods.RMSsupply(ID).send({ from: currentaccount });
      if (receipt) loadBlockchaindata();
    } catch (err) { alert("The connected wallet is not a registered supplier, the batch ID is invalid, or the batch is not at the Order stage."); }
  };

  const handlerSubmitManufacturing = async (event) => {
    event.preventDefault();
    try {
      const receipt = await SupplyChain.methods.Manufacturing(ID).send({ from: currentaccount });
      if (receipt) loadBlockchaindata();
    } catch (err) { alert("The connected wallet is not a registered manufacturer, the batch ID is invalid, or the batch is not at the Raw Material Supply stage."); }
  };

  const handlerSubmitDistribute = async (event) => {
    event.preventDefault();
    try {
      const receipt = await SupplyChain.methods.Distribute(ID).send({ from: currentaccount });
      if (receipt) loadBlockchaindata();
    } catch (err) { alert("The connected wallet is not a registered distributor, the batch ID is invalid, or the batch is not at the Manufacturing stage."); }
  };

  const handlerSubmitRetail = async (event) => {
    event.preventDefault();
    try {
      const receipt = await SupplyChain.methods.Retail(ID).send({ from: currentaccount });
      if (receipt) loadBlockchaindata();
    } catch (err) { alert("The connected wallet is not a registered retailer, the batch ID is invalid, or the batch is not at the Distribution stage."); }
  };

  const handlerSubmitSold = async (event) => {
    event.preventDefault();
    try {
      const receipt = await SupplyChain.methods.sold(ID).send({ from: currentaccount });
      if (receipt) loadBlockchaindata();
    } catch (err) { alert("The connected wallet is not the assigned retailer, the batch ID is invalid, or the batch is not at the Retail stage."); }
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

  if (loader) {
    return <h1 className="wait rx-center">Loading...</h1>;
  }

  return (
    <div className="supply-page">
      {/* Header */}
      <div className="rx-header-row">
        <div className="addr-line">
          <span className="addr-label">Connected Wallet:&nbsp;</span>
          <span className="addr-mono ellipsis" title={currentaccount}>{currentaccount}</span>
          <button className="copy-btn" type="button" onClick={() => copyToClipboard(currentaccount)} title="Copy address">Copy</button>
        </div>
        <button type="button" onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
      </div>

      {/* Title + flow */}
      <h4 className="rx-section-title">Process Medicine Batches</h4>
      <div className="flow-caption">
        <span className="flow-label">Supply Chain Flow</span>
        <p className="flow-string">Medicine Order → Raw Material Supplier → Manufacturer → Distributor → Retailer → Consumer</p>
      </div>

      {/* Table of batches */}
      <div className="rx-table">
        <table className="table table-sm">
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
                <td><span className={`stage-badge ${stageClass(MedStage[key])}`}>{MedStage[key]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Steps */}
      <div className="step-card step-1 rx-card">
        <h5 className="step-title"><span className="step-chip">Step 1</span>Supply Raw Materials <span className="step-note">(Only a registered Raw Material Supplier can perform this step)</span></h5>
        <form onSubmit={handlerSubmitRMSsupply} className="step-grid">
          <div className="form-group">
            <label className="rx-label" htmlFor="id-supply">Batch ID</label>
            <input id="id-supply" className="form-control-sm rx-input" type="text" onChange={handlerChangeID} placeholder="Batch ID (e.g., 1)" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="rx-btn rx-btn-primary btn-supply">Supply</button>
          </div>
        </form>
      </div>

      <div className="step-card step-2 rx-card">
        <h5 className="step-title"><span className="step-chip">Step 2</span>Manufacture <span className="step-note">(Only a registered Manufacturer can perform this step)</span></h5>
        <form onSubmit={handlerSubmitManufacturing} className="step-grid">
          <div className="form-group">
            <label className="rx-label" htmlFor="id-manufacture">Batch ID</label>
            <input id="id-manufacture" className="form-control-sm rx-input" type="text" onChange={handlerChangeID} placeholder="Batch ID (e.g., 1)" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="rx-btn rx-btn-primary btn-manufacture">Manufacture</button>
          </div>
        </form>
      </div>

      <div className="step-card step-3 rx-card">
        <h5 className="step-title"><span className="step-chip">Step 3</span>Distribute <span className="step-note">(Only a registered Distributor can perform this step)</span></h5>
        <form onSubmit={handlerSubmitDistribute} className="step-grid">
          <div className="form-group">
            <label className="rx-label" htmlFor="id-distribute">Batch ID</label>
            <input id="id-distribute" className="form-control-sm rx-input" type="text" onChange={handlerChangeID} placeholder="Batch ID (e.g., 1)" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="rx-btn rx-btn-primary btn-distribute">Distribute</button>
          </div>
        </form>
      </div>

      <div className="step-card step-4 rx-card">
        <h5 className="step-title"><span className="step-chip">Step 4</span>Retail <span className="step-note">(Only a registered Retailer can perform this step)</span></h5>
        <form onSubmit={handlerSubmitRetail} className="step-grid">
          <div className="form-group">
            <label className="rx-label" htmlFor="id-retail">Batch ID</label>
            <input id="id-retail" className="form-control-sm rx-input" type="text" onChange={handlerChangeID} placeholder="Batch ID (e.g., 1)" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="rx-btn rx-btn-primary btn-retail">Retail</button>
          </div>
        </form>
      </div>

      <div className="step-card step-5 rx-card">
        <h5 className="step-title"><span className="step-chip">Step 5</span>Mark as Sold <span className="step-note">(Only a registered Retailer can perform this step)</span></h5>
        <form onSubmit={handlerSubmitSold} className="step-grid">
          <div className="form-group">
            <label className="rx-label" htmlFor="id-sold">Batch ID</label>
            <input id="id-sold" className="form-control-sm rx-input" type="text" onChange={handlerChangeID} placeholder="Batch ID (e.g., 1)" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="rx-btn rx-btn-primary btn-sold">Mark as Sold</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Supply;