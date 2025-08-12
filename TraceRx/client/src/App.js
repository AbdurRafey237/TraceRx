// Sets up the routing for all pages; is, conceptually, the main function.
import './App.css';
import Home from './Home';
import RegisterRoles from './RegisterRoles';
import CreateBatchOrder from './CreateBatchOrder';
import TrackBatch from './TrackBatch';
import ProcessBatches from './ProcessBatches';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Web3 from "web3";

function App() {
  const [account, setAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return;           // no wallet installed
      try {
        // try silent reconnect first
        const existing = await window.ethereum.request({ method: "eth_accounts" });
        if (existing?.length) {
          setAccount(existing[0]);
          window.web3 = new Web3(window.ethereum);
        } else {
          // not connected → open MetaMask connect dialog
          const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accs[0]);
          window.web3 = new Web3(window.ethereum);
        }
      } catch (e) {
        console.log("Wallet connect rejected or failed:", e);
      }

      // keep in sync
      const onAcc = (accs) => setAccount(accs[0] || "");
      const onChain = () => window.location.reload();
      window.ethereum?.on("accountsChanged", onAcc);
      window.ethereum?.on("chainChanged", onChain);
      return () => {
        window.ethereum?.removeListener("accountsChanged", onAcc);
        window.ethereum?.removeListener("chainChanged", onChain);
      };
    };
  
    init();
  }, []);

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/RegisterRoles" component={RegisterRoles} />
          <Route path="/CreateBatchOrder" component={CreateBatchOrder} />
	  <Route path="/TrackBatch" component={TrackBatch} />
          <Route path="/ProcessBatches" component={ProcessBatches} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
