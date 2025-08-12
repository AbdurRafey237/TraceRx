// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// Supply chain demo; simple role gating, linear lookups.
contract PharmaSupplyChain {
    // owner address
    address public Owner;

    // set on deployment; deployer becomes owner.
    constructor() public {
        Owner = msg.sender;
    }

    // guard for privileged actions
    modifier onlyByOwner() {
        require(msg.sender == Owner, "Owner only.");
        _;
    }

    // stage flow
    enum STAGE {
        Init,
        RawMaterialSupply,
        Manufacture,
        Distribution,
        Retail,
        sold
    }

    // counters for entities
    uint256 public medicineCtr = 0;
    uint256 public rmsCtr = 0;
    uint256 public manCtr = 0;
    uint256 public disCtr = 0;
    uint256 public retCtr = 0;

    // batch record
    struct medicine {
        uint256 id;
        string name;
        string description;
        uint256 RMSid;
        uint256 MANid;
        uint256 DISid;
        uint256 RETid;
        STAGE stage;
    }

    // id => medicine
    mapping(uint256 => medicine) public MedicineStock;

    // human-readable stage; helpful for UIs.
    function showStage(uint256 _medicineID) public view returns (string memory) {
        require(medicineCtr > 0, "No medicines yet.");
        if (MedicineStock[_medicineID].stage == STAGE.Init) return "Medicine Ordered";
        else if (MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply) return "Raw Material Supply Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Manufacture) return "Manufacturing Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Distribution) return "Distribution Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Retail) return "Retail Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.sold) return "Medicine Sold";
    }

    // supplier profile
    struct rawMaterialSupplier {
        address addr;
        uint256 id;
        string name;
        string place;
    }
    // supplier registry
    mapping(uint256 => rawMaterialSupplier) public RMS;

    // manufacturer profile
    struct manufacturer {
        address addr;
        uint256 id;
        string name;
        string place;
    }
    // manufacturer registry
    mapping(uint256 => manufacturer) public MAN;

    // distributor profile
    struct distributor {
        address addr;
        uint256 id;
        string name;
        string place;
    }
    // distributor registry
    mapping(uint256 => distributor) public DIS;

    // retailer profile
    struct retailer {
        address addr;
        uint256 id;
        string name;
        string place;
    }
    // retailer registry
    mapping(uint256 => retailer) public RET;

    // register supplier
    function addRMS(address _address, string memory _name, string memory _place) public onlyByOwner() {
        rmsCtr++;
        RMS[rmsCtr] = rawMaterialSupplier(_address, rmsCtr, _name, _place);
    }

    // register manufacturer
    function addManufacturer(address _address, string memory _name, string memory _place) public onlyByOwner() {
        manCtr++;
        MAN[manCtr] = manufacturer(_address, manCtr, _name, _place);
    }

    // register distributor
    function addDistributor(address _address, string memory _name, string memory _place) public onlyByOwner() {
        disCtr++;
        DIS[disCtr] = distributor(_address, disCtr, _name, _place);
    }

    // register retailer
    function addRetailer(address _address, string memory _name, string memory _place) public onlyByOwner() {
        retCtr++;
        RET[retCtr] = retailer(_address, retCtr, _name, _place);
    }

    // supplier -> manufacturer; first hop
    function RMSsupply(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid medicine ID.");
        uint256 _id = findRMS(msg.sender);
        require(_id > 0, "Caller not a registered supplier.");
        require(MedicineStock[_medicineID].stage == STAGE.Init, "Batch not at order stage.");
        MedicineStock[_medicineID].RMSid = _id;
        MedicineStock[_medicineID].stage = STAGE.RawMaterialSupply;
    }

    // lookup supplier; linear scan for demo
    function findRMS(address _address) private view returns (uint256) {
        require(rmsCtr > 0, "No suppliers registered.");
        for (uint256 i = 1; i <= rmsCtr; i++) {
            if (RMS[i].addr == _address) return RMS[i].id;
        }
        return 0;
    }

    // manufacture step
    function Manufacturing(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid medicine ID.");
        uint256 _id = findMAN(msg.sender);
        require(_id > 0, "Caller not a registered manufacturer.");
        require(MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply, "Batch not at supply stage.");
        MedicineStock[_medicineID].MANid = _id;
        MedicineStock[_medicineID].stage = STAGE.Manufacture;
    }

    // lookup manufacturer
    function findMAN(address _address) private view returns (uint256) {
        require(manCtr > 0, "No manufacturers registered.");
        for (uint256 i = 1; i <= manCtr; i++) {
            if (MAN[i].addr == _address) return MAN[i].id;
        }
        return 0;
    }

    // move to distributor
    function Distribute(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid medicine ID.");
        uint256 _id = findDIS(msg.sender);
        require(_id > 0, "Caller not a registered distributor.");
        require(MedicineStock[_medicineID].stage == STAGE.Manufacture, "Batch not at manufacturing stage.");
        MedicineStock[_medicineID].DISid = _id;
        MedicineStock[_medicineID].stage = STAGE.Distribution;
    }

    // lookup distributor
    function findDIS(address _address) private view returns (uint256) {
        require(disCtr > 0, "No distributors registered.");
        for (uint256 i = 1; i <= disCtr; i++) {
            if (DIS[i].addr == _address) return DIS[i].id;
        }
        return 0;
    }

    // distributor -> retailer; last hop before sale
    function Retail(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid medicine ID.");
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Caller not a registered retailer.");
        require(MedicineStock[_medicineID].stage == STAGE.Distribution, "Batch not at distribution stage.");
        MedicineStock[_medicineID].RETid = _id;
        MedicineStock[_medicineID].stage = STAGE.Retail;
    }

    // lookup retailer
    function findRET(address _address) private view returns (uint256) {
        require(retCtr > 0, "No retailers registered.");
        for (uint256 i = 1; i <= retCtr; i++) {
            if (RET[i].addr == _address) return RET[i].id;
        }
        return 0;
    }

    // mark as sold
    function sold(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid medicine ID.");
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Caller not a registered retailer.");
        require(_id == MedicineStock[_medicineID].RETid, "Only the assigned retailer can sell.");
        require(MedicineStock[_medicineID].stage == STAGE.Retail, "Batch not at retail stage.");
        MedicineStock[_medicineID].stage = STAGE.sold;
    }

    // create new batch; owner-gated
    function addMedicine(string memory _name, string memory _description) public onlyByOwner() {
        require((rmsCtr > 0) && (manCtr > 0) && (disCtr > 0) && (retCtr > 0), "Register all roles first.");
        medicineCtr++;
        MedicineStock[medicineCtr] = medicine(
            medicineCtr,
            _name,
            _description,
            0,
            0,
            0,
            0,
            STAGE.Init
        );
    }
}

