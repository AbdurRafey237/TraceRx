import React, { useState, useEffect } from 'react';
import Web3 from "web3";
import SupplyChainABI from "./artifacts/PharmaSupplyChain.json";
import { useHistory } from "react-router-dom";
import './RegisterRoles.css';

function AssignRoles() {
  const history = useHistory();

  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [supplyChain, setSupplyChain] = useState(null);
  const [roles, setRoles] = useState({ rms: [], man: [], dis: [], ret: [] });

  const [newRole, setNewRole] = useState({
    address: "",
    name: "",
    place: "",
    type: "rms",
  });

  const roleLabels = {
    rms: "Raw Material Suppliers (RMS)",
    man: "Manufacturers (MAN)",
    dis: "Distributors (DIS)",
    ret: "Retailers (RET)",
  };

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Non-Ethereum browser detected. Consider using MetaMask!");
    }
  };

  const loadBlockchainData = async () => {
    setLoading(true);
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setCurrentAccount(accounts[0]);
    const networkId = await web3.eth.net.getId();
    const networkData = SupplyChainABI.networks[networkId];

    if (networkData) {
      const contract = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
      setSupplyChain(contract);

      const rmsCount = await contract.methods.rmsCtr().call();
      const manCount = await contract.methods.manCtr().call();
      const disCount = await contract.methods.disCtr().call();
      const retCount = await contract.methods.retCtr().call();

      const rms = await Promise.all([...Array(parseInt(rmsCount))].map((_, i) => contract.methods.RMS(i + 1).call()));
      const man = await Promise.all([...Array(parseInt(manCount))].map((_, i) => contract.methods.MAN(i + 1).call()));
      const dis = await Promise.all([...Array(parseInt(disCount))].map((_, i) => contract.methods.DIS(i + 1).call()));
      const ret = await Promise.all([...Array(parseInt(retCount))].map((_, i) => contract.methods.RET(i + 1).call()));

      setRoles({ rms, man, dis, ret });
      setLoading(false);
    } else {
      window.alert('The smart contract is not deployed to the current network');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRole(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    const { address, name, place, type } = newRole;
    try {
      let receipt;
      switch (type) {
        case "rms":
          receipt = await supplyChain.methods.addRMS(address, name, place).send({ from: currentAccount }); break;
        case "man":
          receipt = await supplyChain.methods.addManufacturer(address, name, place).send({ from: currentAccount }); break;
        case "dis":
          receipt = await supplyChain.methods.addDistributor(address, name, place).send({ from: currentAccount }); break;
        case "ret":
          receipt = await supplyChain.methods.addRetailer(address, name, place).send({ from: currentAccount }); break;
        default:
          alert("The selected role is invalid."); return;
      }
      if (receipt) loadBlockchainData();
    } catch {
      alert("The connected wallet address is not the admin or the wallet address is invalid/off-network.");
    }
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  if (loading) return <h1 className="wait">Loading...</h1>;

  return (
    <div className="assign-roles-page">
      <div className="rx-container">
        {/* Header */}
        <div className="rx-header-row">
          <div className="addr-line">
            <span className="addr-label">Connected Wallet:&nbsp;</span>
            <span className="addr-mono ellipsis" title={currentAccount}>{currentAccount}</span>
            <button
              type="button"
              className="copy-btn"
              onClick={() => copyToClipboard(currentAccount)}
              title="Copy address"
            >
              Copy
            </button>
          </div>
          <button type="button" onClick={() => history.push('/')} className="rx-btn rx-btn-ghost">HOME</button>
        </div>

        {/* Register form */}
        <h4 className="rx-section-title">Register Supply Chain Roles</h4>
        <form onSubmit={handleRoleSubmit} className="rx-card rx-grid role-form">
          <div className="form-group">
            <label className="rx-label" htmlFor="roleType">Role</label>
            <select
              id="roleType"
              className="form-control-sm rx-input"
              name="type"
              onChange={handleInputChange}
              value={newRole.type}
              required
            >
              <option value="rms">Raw Material Supplier</option>
              <option value="man">Manufacturer</option>
              <option value="dis">Distributor</option>
              <option value="ret">Retailer</option>
            </select>
          </div>

          <div className="form-group">
            <label className="rx-label" htmlFor="wallet">Wallet Address (0x…)</label>
            <input
              id="wallet"
              className="form-control-sm rx-input"
              type="text"
              name="address"
              placeholder="0xABC…"
              onChange={handleInputChange}
              value={newRole.address}
              required
            />
          </div>

          <div className="form-group">
            <label className="rx-label" htmlFor="contactName">Contact / Entity Name</label>
            <input
              id="contactName"
              className="form-control-sm rx-input"
              type="text"
              name="name"
              placeholder="e.g., Abbott Islamabad"
              onChange={handleInputChange}
              value={newRole.name}
              required
            />
          </div>

          <div className="form-group">
            <label className="rx-label" htmlFor="location">Facility / City</label>
            <input
              id="location"
              className="form-control-sm rx-input"
              type="text"
              name="place"
              placeholder="City or Facility"
              onChange={handleInputChange}
              value={newRole.place}
              required
            />
          </div>

          <div className="form-actions">
            <button className="rx-btn rx-btn-primary">Register</button>
          </div>
        </form>

        {/* Registered roles */}
        <h4 className="rx-section-title">Registered Roles</h4>
        {["rms", "man", "dis", "ret"].map((roleType) => (
          <div key={roleType} className="rx-role-block">
            <div className="rx-subheader">
              <span className="rx-subheader-accent" />
              <h5 className="rx-subheader-text">{roleLabels[roleType]}</h5>
            </div>

            <div className="rx-table">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Reg. ID</th>
                    <th>Name</th>
                    <th>Facility / City</th>
                    <th>Wallet Address</th>
                  </tr>
                </thead>
                <tbody>
                  {roles[roleType].map((role, index) => (
                    <tr key={index}>
                      <td className="id-col">{role.id}</td>
                      <td>{role.name}</td>
                      <td>{role.place}</td>
                      <td className="addr-cell">
                        <span className="addr-mono ellipsis" title={role.addr}>{role.addr}</span>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(role.addr)}
                          aria-label="Copy address"
                          title="Copy address"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssignRoles;
