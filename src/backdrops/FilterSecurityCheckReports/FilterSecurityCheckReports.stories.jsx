import React, { useState } from 'react';
import { Button } from '@USupport-components-library/src';

import { FilterSecurityCheckReports } from './FilterSecurityCheckReports';

export default {
  title: 'Client UI/backdrops/FilterSecurityCheckReports',
  component: FilterSecurityCheckReports,
  argTypes: {},
};

const Template = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button label='Toggle FilterSecurityCheckReports' onClick={handleOpen} />
      <FilterSecurityCheckReports {...props} isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};
