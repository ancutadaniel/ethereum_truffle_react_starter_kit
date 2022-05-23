import React, { useCallback, useEffect, useReducer } from 'react';
import { reducer } from './redux_hooks/redux';
import { defaultState } from './redux_hooks/state';
import * as ACTIONS from './redux_hooks/constants';
import getWeb3 from './utils/getWeb3';

import NewContract from '../src/build/abi/NewContract.json';
import MainMenu from './components/Menu';

import {
  Container,
  Divider,
  Card,
  Dimmer,
  Loader,
  Message,
  Button,
  Icon,
} from 'semantic-ui-react';

const App = () => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { errors, loading, reloadData, wrongNetwork } = state;
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

          // listen to account change
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

          // listen to chain change
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

  useEffect(() => {
    loadWeb3();
  }, [loadWeb3]);

  // console.log(state);

  return (
    <div className='App'>
      <MainMenu state={state} />
      <Container>
        <Card centered>
          <Dimmer
            active={loading}
            style={{
              width: '320px',
              height: '100px',
            }}
          >
            <Loader />
          </Dimmer>
        </Card>
      </Container>
      <Container>
        {errors && (
          <Message negative>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Message.Header>Code: {errors?.code}</Message.Header>
              <Button
                style={{
                  padding: '0px',
                  background: 'none',
                  color: 'red',
                  marginRight: '0px',
                }}
                onClick={() => dispatch({ type: SET_ERROR, value: null })}
              >
                <Icon name='close' />
              </Button>
            </div>
            <p style={{ wordBreak: 'break-word' }}>{errors?.message}</p>
          </Message>
        )}
        {wrongNetwork && (
          <>
            <Divider horizontal>§</Divider>
            <Message negative>
              <Message.Header>Wrong Network</Message.Header>
              <p>Please select from Metamask - Rinkeby Test Network (id 4)</p>
            </Message>
          </>
        )}
      </Container>
    </div>
  );
};

export default App;
