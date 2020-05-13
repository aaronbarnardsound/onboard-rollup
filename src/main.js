import Onboard from 'bnc-onboard'

function doSomething() {
  const networkId = 4
  const rpcUrl = 'https://rinkeby.infura.io/v3/d5e29c9b9a9d4116a7348113f57770a8'

  const onboard = Onboard({
    dappId: '12153f55-f29e-4f11-aa07-90f10da5d778',
    networkId,
    // darkMode: true,
    walletSelect: {
      wallets: [
        { walletName: 'metamask' },
        // {
        //   walletName: 'trezor',
        //   appUrl: 'https://reactdemo.blocknative.com',
        //   email: 'aaron@blocknative.com',
        //   rpcUrl
        // },
        // {
        //   walletName: 'ledger',
        //   rpcUrl
        // },
        { walletName: 'dapper' },
        { walletName: 'coinbase' },
        { walletName: 'status' },
        {
          walletName: 'portis',
          apiKey: 'd7d72646-709a-45ab-aa43-8de5307ae0df'
        },
        { walletName: 'authereum' },
        { walletName: 'fortmatic', apiKey: 'pk_test_886ADCAB855632AA' },
        { walletName: 'unilogin' },
        { walletName: 'squarelink', apiKey: '87288b677f8cfb09a986' },
        { walletName: 'trust', rpcUrl },
        {
          walletName: 'walletConnect',
          infuraKey: 'd5e29c9b9a9d4116a7348113f57770a8'
        },
        { walletName: 'opera' },
        { walletName: 'operaTouch' },
        { walletName: 'imToken', rpcUrl }
      ]
    },
    walletCheck: [
      { checkName: 'derivationPath' },
      { checkName: 'connect' },
      { checkName: 'accounts' },
      { checkName: 'network' },
      { checkName: 'balance', minimumBalance: '100000' }
    ]
  })

  onboard.walletSelect().then(onboard.walletCheck)
}

doSomething()
