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
} from 'semantic-ui-react';

const App = () => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { account, contract, errors, loading } = state;
  const { SET_WEB3, SET_ERROR } = ACTIONS;

  const loadWeb3 = useCallback(async () => {
    try {
      const web3 = await getWeb3();
      if (web3) {
        const getAccounts = await web3.eth.getAccounts();
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

          dispatch({
            type: SET_WEB3,
            value: {
              web3: web3,
              contract: contractData,
              account: getAccounts,
              loading: false,
            },
          });
        } else {
          alert('Smart contract not deployed to selected network');
        }
      }
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  }, [SET_WEB3, SET_ERROR]);

  useEffect(() => {
    loadWeb3();
  }, []);

  console.log(state);

  return (
    <div className='App'>
      <MainMenu account={account} />

      <Divider horizontal>§</Divider>
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
      <Divider horizontal>§</Divider>
      <Container>
        {errors && (
          <Message negative>
            <Message.Header>Code: {errors?.code}</Message.Header>
            <p style={{ wordWrap: 'break-word' }}>{errors?.message}</p>
          </Message>
        )}
      </Container>
    </div>
  );
};

export default App;
