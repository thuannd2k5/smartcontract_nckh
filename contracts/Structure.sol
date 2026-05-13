// SPDX-License-Identifier: NONE
pragma solidity ^0.8.19;

library Structure {
    enum State {
        Production,
        PurchasedByAgent,
        SoldByAgent,
        PurchasedByCustomer,
        ShippedByAgent,
        ReceivedByDeliveryHub,
        ShippedByDeliveryHub,
        ReceivedByCustomer
    }

    struct ProductDetails {
        string name;
        string code;
        uint256 price;
        uint256 priceAgent;
        string category;
        string images;
        string description;
        uint256 quantity;
        string nsx;
        string hsd;
        string exp;
    }

    struct FactoryDetails {
        address factory;
        string factoryCode;
    }

    struct AgentDetails {
        address agent;
        string agentCode;
    }

    struct DeliveryHubDetails {
        address deliveryHub;
        string deliveryHubCode;
    }

    struct CustomerDetails {
        address customer;
        string customerCode;
        uint256 feeShip;
        string addressShip;
    }

    struct Product {
        uint256 uid;
        address owner;
        State productState;
        FactoryDetails factoryDetails;
        AgentDetails agentDetails;
        DeliveryHubDetails deliveryHubDetails;
        CustomerDetails customerDetails;
        ProductDetails productDetails;
    }

    enum Roles {
        Factory,
        Agent,
        DeliveryHub,
        Customer
    }
}
