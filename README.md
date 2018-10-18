# HOW DAO WORKS

1) Crowdsale contract transferOnwership of Token contract to DAO contract after ICO

2) Only DAO contract can call function mint in Token contract.

3) Owner DAO contract can call function mint only through DAO contract.

4) address with 51% can change Owner (if tootalSupply < limit, then address balance should be 50B + 0.0000000000000000001 COT)

5) address with 51% can change Owner (if tootalSupply > limit, then address balance should be tootalSupply / 2)

# Install
1) clone repo
2) cd
3) npm i --only=dev

# Test

1) truffle migrate
2) truffle test

# Deploy
0) Set infura_apikey and metamask mnemonic in truffle.js
1) Remove bild folder (if it is created)
2) truffle migrate compile-all --network YOUR NETWORK


# COT Distribution

1) Owner DAO can mint limit tokens (100B)

2) Owner DAO can mint 0.1% tokens from totalSupply() per week also after limit

3) 10B to Team vested (time is setting in the migration)

# Console Video

[Correct mint limit (no more no less) (video)](https://vk.com/videos223443924?z=video223443924_456239565%2Fpl_223443924_-2)

[Correct mint input limit (video)](https://vk.com/videos223443924?z=video223443924_456239559%2Fpl_223443924_-2)

[Correct mint 5% per year (in our case 5 minutes) (video)](https://vk.com/videos223443924?z=video223443924_456239561%2Fpl_223443924_-2)

[Vesting (video)](https://vk.com/videos223443924?z=video223443924_456239556%2Fpl_223443924_-2)

[Allow change owner for pool address (if pool balance > total / 2) (comment) (video)](https://vk.com/videos223443924?z=video223443924_456239566%2Fpl_223443924_-2)

[transferOwnership Token from crowdsale to DAO (video)](https://vk.com/video?z=video223443924_456239580%2Fpl_cat_updates)

