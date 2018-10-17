# COT-Tokens-DAO1L

1) Owner can mint limit tokens

2) Owner can mint 5% tokens from totalSupply() per year

3) 10B to Team vested (time is setting in the migration)

4) 20B will go to owner wallet for sales manually

5) pool address can changeOwner

[Correct mint limit (no more no less) (video)](https://vk.com/videos223443924?z=video223443924_456239565%2Fpl_223443924_-2)

[Correct mint input limit (video)](https://vk.com/videos223443924?z=video223443924_456239559%2Fpl_223443924_-2)

[Correct mint 5% per year (in our case 5 minutes) (video)](https://vk.com/videos223443924?z=video223443924_456239561%2Fpl_223443924_-2)

[Vesting (video)](https://vk.com/videos223443924?z=video223443924_456239556%2Fpl_223443924_-2)

[Allow change owner for pool address (if pool balance > total / 2) (comment) (video)](https://vk.com/videos223443924?z=video223443924_456239566%2Fpl_223443924_-2)

[transferOwnership Token from crowdsale to DAO (video)](https://vk.com/video?z=video223443924_456239580%2Fpl_cat_updates)


# HOW DAO WORKS

1) Crowdsale contract transferOnwership of Token contract to DAO contract

2) Only DAO can call function mint in Token contract.

3) Owner DAO contract can call function mint through DAO contract.

4) address with 51% can change Owner

# Install
1) clone repo
2) cd
3) npm i --only=dev

# Test

1) truffle migrate
2) truffle test

# Deploy
1) Remove bild folder
2) truffle migrate compile-all --network YOUR NETWORK
