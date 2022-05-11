import * as ACTIONS from './constants';

export const reducer = (state, action) => {
  const { SET_WEB3, SET_ERROR } = ACTIONS;

  switch (action.type) {
    case SET_WEB3:
      const { web3, contract, account, loading } = action.value;
      return {
        ...state,
        contract,
        web3,
        account: account[0],
        loading,
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.value,
      };

    default:
      return {
        ...state,
      };
  }
};
