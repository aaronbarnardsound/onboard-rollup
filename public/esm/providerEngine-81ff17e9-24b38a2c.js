import './main-17127497.js';
import './events-767f970f.js';
import './buffer-es6-e564b388.js';
import './__node-resolve:empty-4a191708.js';
import './index-870d59f6.js';
import { h as hookedWallet, r as rpc, w as web3ProviderEngine, s as subscriptions, f as filters } from './filters-2e74b111.js';
import './parse-f0306b8f.js';

function createProvider(config) {
  var getAccounts = config.getAccounts,
      signTransaction = config.signTransaction,
      rpcUrl = config.rpcUrl,
      processMessage = config.processMessage,
      processPersonalMessage = config.processPersonalMessage,
      signMessage = config.signMessage,
      signPersonalMessage = config.signPersonalMessage;
  var idMgmt = getAccounts && new hookedWallet({
    getAccounts: getAccounts,
    signTransaction: signTransaction,
    processMessage: processMessage,
    processPersonalMessage: processPersonalMessage,
    signMessage: signMessage,
    signPersonalMessage: signPersonalMessage
  });
  var rpcSubProvider = new rpc({
    rpcUrl: rpcUrl.includes('http') ? rpcUrl : "https://".concat(rpcUrl)
  });
  var provider = new web3ProviderEngine();
  provider.addProvider(new subscriptions());
  provider.addProvider(new filters());
  idMgmt && provider.addProvider(idMgmt);
  provider.addProvider(rpcSubProvider);
  provider.start();
  return provider;
}

export default createProvider;
