import BN from "bn.js";
import {toWei} from "web3-utils";

export const Web3RpcUrl = Object.freeze({
    1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // //ETH Mainnet
    3: 'http://127.0.0.1:8545', //Kovan
    56: 'https://bsc-dataseed.binance.org/', // //BSC
    97: 'https://data-seed-prebsc-1-s1.binance.org:8545/', // //BSC Testnet
    128: 'https://http-mainnet.hecochain.com', // //Heco
    256: 'https://http-testnet.hecochain.com', // //Heco Testnet
    137: 'https://matic-mainnet.chainstacklabs.com', // //polygon
    80001: 'https://rpc-mumbai.maticvigil.com', // //polygon Testnet
    42161: 'https://arb1.arbitrum.io/rpc', // //arbitrum
    421611: 'https://rinkeby.arbitrum.io/rpc', // //arbitrum Testnet
    51: 'https://apothemxdcpayrpc.blocksscan.io/'
});

export const log4jsConfig = {
    appenders: {out: {type: 'stdout'}},
    categories: {
        default: { appenders: ['out'], level: 'debug' }
    }
}

export const ether = new BN(toWei('1'));
export const zero = new BN('0');
export const GENERIC_ERROR_CODE = 1;
