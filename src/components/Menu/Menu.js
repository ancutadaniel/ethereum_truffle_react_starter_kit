import { useState } from 'react';
import { Menu, Icon, Button } from 'semantic-ui-react';

import './Menu.css';

const MainMenu = ({ state, loadWeb3 }) => {
  const { web3, balance, account } = state;
  const userBalance = web3?.utils?.fromWei(balance).substring(0, 6);

  const [activeItem, setActiveItem] = useState('starterKit');

  const handleItemClick = (e, { name }) => setActiveItem(name);

  return (
    <>
      <Menu id='main_menu'>
        <Menu.Item
          name='App'
          active={activeItem === 'starterKit'}
          onClick={handleItemClick}
        />
        {account ? (
          <Menu.Item position='right'>
            <p className='account'>
              <Icon name='user' />
              {`${account.slice(0, 5)}...${account.slice(38, 42)}`}
            </p>
            <p className='account'>
              <Icon name='money' />
              Bal: {userBalance} ETH
            </p>
          </Menu.Item>
        ) : (
          <Menu.Item position='right'>
            <Button onClick={loadWeb3} inverted color='purple'>
              Connect Wallet
            </Button>
          </Menu.Item>
        )}
      </Menu>
    </>
  );
};

export default MainMenu;
