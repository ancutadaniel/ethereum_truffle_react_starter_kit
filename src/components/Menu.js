import { useState } from 'react';
import { Menu, Icon } from 'semantic-ui-react';

import './Menu.css';

const MainMenu = ({ state }) => {
  const { web3, balance, account } = state;
  const userBalance = web3?.utils?.fromWei(balance).substring(0, 6);

  const [activeItem, setActiveItem] = useState('starterKit');

  const handleItemClick = (e, { name }) => setActiveItem(name);

  return (
    <Menu id='main_menu'>
      <Menu.Item
        name='Starter Kit'
        active={activeItem === 'starterKit'}
        onClick={handleItemClick}
      />
      <p className='account'>
        <Icon name='user' />
        {account}
      </p>
      <p className='account'>
        <Icon name='money' />
        Balance: {userBalance} ETH
      </p>
    </Menu>
  );
};

export default MainMenu;
