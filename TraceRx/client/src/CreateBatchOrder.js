import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/PharmaSupplyChain.json";
import "./CreateBatchOrder.css";

function AddMed() {
  const history = useHistory();

  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState({});
  const [MedName, setMedName] = useState("");
  const [MedDes, setMedDes] = useState("");
  const [MedStage, setMedStage] = useState([]);

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
      window.alert('The smart contract is not deployed to current network');
    }
  };

  const redirect_to_home = () => history.push('/');

  const handlerChangeNameMED = (e) => setMedName(e.target.value);
  const handlerChangeDesMED = (e) => setMedDes(e.target.value);

  const handlerSubmitMED = async (event) => {
    event.preventDefault();
    try {
      const reciept = await SupplyChain.methods.addMedicine(MedName, MedDes)
        .send({ from: currentaccount });
      if (reciept) loadBlockchaindata();
    } catch (err) {
      alert("The connected wallet is not the admin or not all roles have been registered.");
    }
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch (_) {}
  };

  const stageClass = (label = "") => {
    const l = label.toLowerCase();
    if (l.includes("sold")) return "stage-sold";
    if (l.includes("retail")) return "stage-retail";
    if (l.includes("distribut")) return "stage-distributed";
    if (l.includes("manufact")) return "stage-manufactured";
    if (l.includes("supply") || l.includes("raw")) return "stage-supplied";
    if (l.includes("order")) return "stage-ordered";
    return "stage-default";
  };

  if (loader) return <h1 className="wait rx-center">Loading...</h1>;

  return (
    <div className="order-page">
      {/* Header */}
      <div className="rx-header-row">
        <div className="addr-line">
          <span className="addr-label">Connected Wallet:&nbsp;</span>
          <span className="addr-mono ellipsis" title={currentaccount}>{currentaccount}</span>
          <button className="copy-btn" type="button" onClick={() => copyToClipboard(currentaccount)} title="Copy address">Copy</button>
        </div>
        <button type="button" onClick={redirect_to_home} className="rx-btn rx-btn-ghost">HOME</button>
      </div>

      {/* Create order */}
      <h4 className="rx-section-title">Create Medicine Batch Order</h4>
      <form onSubmit={handlerSubmitMED} className="rx-card order-form">
        <div className="form-group">
          <label htmlFor="batchName" className="rx-label">Batch / Product Name</label>
          <input
            id="batchName"
            className="form-control-sm rx-input"
            type="text"
            onChange={handlerChangeNameMED}
            placeholder="e.g., Paracetamol 500mg (Batch A23)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="orderNotes" className="rx-label">Order Notes</label>
          <input
            id="orderNotes"
            className="form-control-sm rx-input"
            type="text"
            onChange={handlerChangeDesMED}
            placeholder="Formulation, strength, or internal reference"
            required
          />
        </div>

        <div className="form-actions">
          <button className="rx-btn rx-btn-primary" type="submit" aria-label="Create medicine batch order">Create Order</button>
        </div>
      </form>

      {/* Orders table */}
      <h4 className="rx-section-title">Orders &amp; Status</h4>
      <div className="rx-table">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Batch / Product</th>
              <th>Notes</th>
              <th>Current Stage</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(MED).map((key) => (
              <tr key={key}>
                <td className="id-col">{MED[key].id}</td>
                <td>{MED[key].name}</td>
                <td>{MED[key].description}</td>
                <td>
                  <span className={`stage-badge ${stageClass(MedStage[key])}`}>
                    {MedStage[key]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {Object.keys(MED).length === 0 && (
        <p className="rx-empty">No orders yet. Create your first medicine batch above.</p>
      )}
    </div>
  );
}

export default AddMed;