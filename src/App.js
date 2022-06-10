import React, { useCallback, useEffect, useReducer } from 'react';
import { reducer } from './redux_hooks/redux';
import { defaultState } from './redux_hooks/state';
import * as ACTIONS from './redux_hooks/constants';
import getWeb3 from './utils/getWeb3';

import NewContract from '../src/build/abi/NewContract.json';
import MainMenu from './components/Menu/Menu';

import { Container, Card, Dimmer, Loader } from 'semantic-ui-react';
import Error from './components/Error/Error';

const App = () => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { errors, loading, reloadData, wrongNetwork, account } = state;
  const {
    SET_WEB3,
    SET_ERROR,
    SET_LOADING,
    ACCOUNT_CHANGE,
    NETWORK_CHANGE,
    TOGGLE_NETWORK,
  } = ACTIONS;

  const loadWeb3 = useCallback(async () => {
    try {
      const web3 = await getWeb3();
      if (web3) {
        const [owner] = await web3.eth.getAccounts();
        // get networks id of deployed contract
        const getNetworkId = await web3.eth.net.getId();
        // get contract data on this network
        const newData = await NewContract.networks[getNetworkId];
        // check contract deployed networks
        if (newData) {
          // get contract deployed address
          const contractAddress = newData.address;
          // create a new instance of the contract - on that specific address
          const contractData = await new web3.eth.Contract(
            NewContract.abi,
            contractAddress
          );
          // Other contract details
          const getBalance = await web3.eth.getBalance(owner);

          dispatch({
            type: SET_WEB3,
            value: {
              web3,
              contract: contractData,
              account: owner,
              loading: false,
              balance: getBalance,
            },
          });

          // listen to account change - recommended by metamask
          window.ethereum.on('accountsChanged', async (acc) => {
            dispatch({ type: SET_LOADING });
            const [newAddress] = acc;
            try {
              if (Object.keys(web3).length !== 0 && contractData) {
                const getNewBalance = await web3.eth.getBalance(newAddress);

                dispatch({
                  type: ACCOUNT_CHANGE,
                  value: {
                    balance: getNewBalance,
                    account: newAddress,
                  },
                });
              }
            } catch (error) {
              dispatch({ type: SET_ERROR, value: error });
            }
          });

          // listen to chain change - recommended by metamask
          window.ethereum.on('chainChanged', async (chainId) => {
            dispatch({ type: SET_LOADING });
            try {
              let networkId = parseInt(chainId, 16);
              networkId !== 4 && dispatch({ type: TOGGLE_NETWORK });

              if (networkId === 4) {
                const [owner] = await web3.eth.getAccounts();
                const getNetBalance = await web3.eth.getBalance(owner);

                dispatch({
                  type: NETWORK_CHANGE,
                  value: {
                    accountNet: owner,
                    balanceNet: getNetBalance,
                    networkId,
                    loading: false,
                  },
                });
              }
            } catch (error) {
              dispatch({ type: SET_ERROR, value: error });
            }
          });
        } else {
          alert('Smart contract not deployed to selected network');
        }
      }
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  }, [
    SET_WEB3,
    SET_ERROR,
    ACCOUNT_CHANGE,
    NETWORK_CHANGE,
    TOGGLE_NETWORK,
    SET_LOADING,
  ]);

  useEffect(() => {
    reloadData && loadWeb3();
  }, [reloadData, loadWeb3]);

  return (
    <div className='App'>
      <MainMenu state={state} loadWeb3={loadWeb3} />
      {!account ? (
        <Container>
          <Card centered style={{ marginTop: '40vh', height: '80px' }}>
            <Dimmer active={loading} inverted>
              <Loader size='small'>Please connect your wallet...</Loader>
            </Dimmer>
          </Card>
        </Container>
      ) : (
        <Container>
          <p>Content here</p>
        </Container>
      )}
      <Error errors={errors} wrongNetwork={wrongNetwork} dispatch={dispatch} />
    </div>
  );
};

export default App;
