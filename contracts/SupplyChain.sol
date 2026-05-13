// SPDX-License-Identifier: NONE
pragma solidity ^0.8.19;

import "./Structure.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; /*revert when transaction failed */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SupplyChain {
    IERC20 private token;
    uint uid;
    address public admin;

    mapping(uint256 => Structure.Product) products;
    mapping(Structure.Roles => address[]) roles;

    constructor(address _admin, IERC20 _token) {
        admin = _admin;
        token = _token;
        uid = 1;
    }

    event Production(uint uid);
    event PurchasedByAgent(uint256 uid);
    event SoldByAgent(uint256 uid);
    event PurchasedByCustomer(uint256 uid);
    event ShippedByAgent(uint256 uid);
    event ReceivedByDeliveryHub(uint256 uid);
    event ShippedByDeliveryHub(uint256 uid);
    event ReceivedByCustomer(uint256 uid);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Sender is not a admin");
        _;
    }

    /* check sender is a ownerProduct or not*/
    modifier verifyAddress(address _address) {
        require(msg.sender == _address, "Sender is not owner product");
        _;
    }

    modifier production(uint256 _uid) {
        require(products[_uid].productState == Structure.State.Production);
        _;
    }

    modifier purchasedByAgent(uint256 _uid) {
        require(
            products[_uid].productState == Structure.State.PurchasedByAgent
        );
        _;
    }

    modifier soldByAgent(uint256 _uid) {
        require(products[_uid].productState == Structure.State.SoldByAgent);
        _;
    }

    modifier purchasedByCustomer(uint256 _uid) {
        require(
            products[_uid].productState == Structure.State.PurchasedByCustomer
        );
        _;
    }

    modifier shippedByAgent(uint256 _uid) {
        require(products[_uid].productState == Structure.State.ShippedByAgent);
        _;
    }

    modifier receivedByDeliveryHub(uint256 _uid) {
        require(
            products[_uid].productState == Structure.State.ReceivedByDeliveryHub
        );
        _;
    }

    modifier shippedByDeliveryHub(uint256 _uid) {
        require(
            products[_uid].productState == Structure.State.ShippedByDeliveryHub
        );
        _;
    }

    modifier receivedByCustomer(uint256 _uid) {
        require(
            products[_uid].productState == Structure.State.ReceivedByCustomer
        );
        _;
    }

    /* check code of product is exist or not */
    function checkProductCode(string memory _code) public view returns (bool) {
        for (uint256 i = 1; i <= uid; i++) {
            if (
                keccak256(bytes(products[i].productDetails.code)) ==
                keccak256(bytes(_code))
            ) {
                return true;
            }
        }
        return false;
    }

    function addFactory(address _account) public onlyAdmin {
        require(_account != address(0));
        roles[Structure.Roles.Factory].push(_account);
    }

    function isFactory(address _account) public view returns (bool) {
        require(_account != address(0));
        address[] memory factories = roles[Structure.Roles.Factory];
        for (uint256 i = 0; i < factories.length; i++) {
            if (factories[i] == _account) {
                return true;
            }
        }
        return false;
    }

    function addAgent(address _account) public onlyAdmin {
        require(_account != address(0));
        roles[Structure.Roles.Agent].push(_account);
    }

    function isAgent(address _account) public view returns (bool) {
        require(_account != address(0));
        address[] memory agents = roles[Structure.Roles.Agent];
        for (uint256 i = 0; i < agents.length; i++) {
            if (agents[i] == _account) {
                return true;
            }
        }
        return false;
    }

    function addDeliveryHub(address _account) public onlyAdmin {
        require(_account != address(0));
        roles[Structure.Roles.DeliveryHub].push(_account);
    }

    function isDeliveryHub(address _account) public view returns (bool) {
        require(_account != address(0));
        address[] memory deliveryHubs = roles[Structure.Roles.DeliveryHub];
        for (uint256 i = 0; i < deliveryHubs.length; i++) {
            if (deliveryHubs[i] == _account) {
                return true;
            }
        }
        return false;
    }

    function addCustomer(address _account) public {
        require(_account != address(0));
        roles[Structure.Roles.Customer].push(_account);
    }

    function isCustomer(address _account) public view returns (bool) {
        require(_account != address(0));
        address[] memory customers = roles[Structure.Roles.Customer];
        for (uint256 i = 0; i < customers.length; i++) {
            if (customers[i] == _account) {
                return true;
            }
        }
        return false;
    }

    /// @dev Step 1: Harvesred a product
    function productionProduct(
        string memory _name,
        string memory _code,
        uint256 _price,
        string memory _category,
        string memory _images,
        string memory _description,
        uint256 _quantity,
        string memory _nsx,
        string memory _hsd,
        string memory _factoryCode
    ) public {
        require(isFactory(msg.sender), "Sender is not a Factory!");
        Structure.Product memory product;
        product.uid = uid;
        product.owner = msg.sender;
        /* set role for factory */
        product.factoryDetails.factory = msg.sender;
        product.factoryDetails.factoryCode = _factoryCode;
        /* set details for product*/
        product.productDetails.name = _name;
        product.productDetails.code = _code;
        product.productDetails.price = _price;
        product.productDetails.category = _category;
        product.productDetails.images = _images;
        product.productDetails.description = _description;
        product.productDetails.quantity = _quantity;
        product.productDetails.nsx = _nsx;
        product.productDetails.hsd = _hsd;
        /* set state for product */
        product.productState = Structure.State.Production;

        products[uid] = product;
        emit Production(uid);
        uid++;
    }

    /// @dev Step 2: Purchase product from Third Party
    function purchaseByAgent(
        uint256 _uid,
        string memory _agentCode
    ) public production(_uid) {
        require(isAgent(msg.sender), "Sender is not a Agent");
        require(
            token.balanceOf(msg.sender) >= products[_uid].productDetails.price,
            "Insufficient account balance"
        );

        SafeERC20.safeTransferFrom(
            token,
            msg.sender,
            products[_uid].factoryDetails.factory,
            products[_uid].productDetails.price
        );

        products[_uid].owner = msg.sender;
        products[_uid].agentDetails.agent = msg.sender;
        products[_uid].agentDetails.agentCode = _agentCode;
        products[_uid].productState = Structure.State.PurchasedByAgent;

        emit PurchasedByAgent(_uid);
    }

    /// @dev step 3: Third party add attributes for sold product
    function sellByAgent(
        uint256 _uid,
        uint256 _price
    ) public purchasedByAgent(_uid) verifyAddress(products[_uid].owner) {
        require(isAgent(msg.sender), "Sender is not a Agent");
        products[_uid].productDetails.priceAgent = _price;
        products[_uid].productState = Structure.State.SoldByAgent;

        emit SoldByAgent(_uid);
    }

    /// @dev Step 4: Customer buy product of Third Party
    function purchaseByCustomer(
        uint256 _uid,
        uint256 _feeShip,
        string memory _addressShip,
        string memory _customerCode
    ) public soldByAgent(_uid) {
        require(isCustomer(msg.sender), "Sender is not a Customer");
        products[_uid].customerDetails.customer = msg.sender;
        products[_uid].customerDetails.customerCode = _customerCode;
        products[_uid].customerDetails.feeShip = _feeShip;
        products[_uid].customerDetails.addressShip = _addressShip;
        products[_uid].productState = Structure.State.PurchasedByCustomer;

        uint256 totalPrice = products[_uid].productDetails.priceAgent +
            _feeShip;

        SafeERC20.safeTransferFrom(
            token,
            msg.sender,
            address(this),
            totalPrice
        );

        emit PurchasedByCustomer(_uid);
    }

    /// @dev Step 5: Agent shipping product purchased by Customer to Delivery Hub
    function shipByAgent(
        uint256 _uid
    ) public purchasedByCustomer(_uid) verifyAddress(products[_uid].owner) {
        require(isAgent(msg.sender), "Sender is not a Third Party");
        products[_uid].productState = Structure.State.ShippedByAgent;

        emit ShippedByAgent(_uid);
    }

    /// @dev Step 6: Delivery hub receive product of purchased customer from Agent shipped
    function receiveByDeliveryHub(
        uint256 _uid,
        string memory _deliveryHubCode
    ) public shippedByAgent(_uid) {
        require(isDeliveryHub(msg.sender), "Sender is not a Delivery Hub");
        products[_uid].owner = msg.sender;
        products[_uid].deliveryHubDetails.deliveryHub = msg.sender;
        products[_uid].deliveryHubDetails.deliveryHubCode = _deliveryHubCode;
        products[_uid].productState = Structure.State.ReceivedByDeliveryHub;

        emit ReceivedByDeliveryHub(_uid);
    }

    /// @dev Step 7: Delivery hub shipped product to Customer
    function shipByDeliveryHub(
        uint256 _uid
    ) public verifyAddress(products[_uid].owner) receivedByDeliveryHub(_uid) {
        require(isDeliveryHub(msg.sender), "Sender is not a Delivery Hub");
        products[_uid].productState = Structure.State.ShippedByDeliveryHub;

        emit ShippedByDeliveryHub(_uid);
    }

    /// @dev Step 8: Customer receive product from Delivery hub
    function receiveByCustomer(
        uint256 _uid
    )
        public
        shippedByDeliveryHub(_uid)
        verifyAddress(products[_uid].customerDetails.customer)
    {
        require(isCustomer(msg.sender), "Sender is not a customer");
        uint256 amountAgent = products[_uid].productDetails.priceAgent -
            (products[_uid].productDetails.priceAgent / 10);
        SafeERC20.safeTransfer(
            token,
            products[_uid].agentDetails.agent,
            amountAgent
        );
        uint256 amountDeliveryHub = products[_uid].customerDetails.feeShip -
            (products[_uid].customerDetails.feeShip / 10);
        SafeERC20.safeTransfer(
            token,
            products[_uid].deliveryHubDetails.deliveryHub,
            amountDeliveryHub
        );
        products[_uid].owner = msg.sender;
        products[_uid].productState = Structure.State.ReceivedByCustomer;

        emit ReceivedByCustomer(_uid);
    }

    /// @dev Get all product
    function getProducts() public view returns (Structure.Product[] memory) {
        Structure.Product[] memory listProduct = new Structure.Product[](
            uid - 1
        );
        for (uint256 i = 1; i < uid; i++) {
            listProduct[i - 1] = products[i];
        }
        return listProduct;
    }

    ///@dev Get product by code
    function getProductByCode(
        string memory _code
    ) public view returns (Structure.Product memory) {
        require(checkProductCode(_code), "Code product is not exists");
        uint256 idProduct;
        for (uint256 i = 1; i < uid; i++) {
            if (
                keccak256(bytes(products[i].productDetails.code)) ==
                keccak256(bytes(_code))
            ) {
                idProduct = i;
            }
        }

        return products[idProduct];
    }

    function getProductCount() public view returns (uint256) {
        return uid - 1;
    }

    function getProductState(
        uint256 _uid
    ) public view returns (Structure.State) {
        return products[_uid].productState;
    }
}
