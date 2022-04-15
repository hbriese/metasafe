module.exports = {
  client: {
    service: {
      name: 'uniswap',
      url: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph',
    },
    includes: ['../**/*.ts'],
    tagName: 'uniswapGql',
    addTypename: true,
  },
};