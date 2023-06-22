import * as React from 'react';
import PropTypes from 'prop-types';

import { Flex, IconButton, ModalLayout, ModalBody, Typography } from '@strapi/design-system';
import { LinkButton } from '@strapi/design-system/v2';
import { Cross } from '@strapi/icons';

const TITLE_ID = 'limits-title';

export function Title({ children }) {
  return (
    <Typography variant="alpha" id={TITLE_ID}>
      {children}
    </Typography>
  );
}

Title.propTypes = {
  children: PropTypes.node.isRequired,
};

export function Body({ children }) {
  return <Typography variant="omega">{children}</Typography>;
}

Body.propTypes = {
  children: PropTypes.node.isRequired,
};

function CallToActions() {
  return (
    <Flex gap={2}>
      <LinkButton variant="default" isExternal href="https://strapi.io/">
        Learn More
      </LinkButton>
      <LinkButton variant="tertiary" isExternal href="https://strapi.io/">
        Contact Sales
      </LinkButton>
    </Flex>
  );
}

export function LimitsModal({ children, isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalLayout labelledBy={TITLE_ID}>
      <ModalBody paddingBottom={10} paddingTop={10}>
        <IconButton icon={<Cross />} label="Close" onClick={onClose} />

        <Flex alignItems="start" direction="column" gap={5} width="50%">
          {children}
          <CallToActions />
        </Flex>
      </ModalBody>
    </ModalLayout>
  );
}

LimitsModal.defaultProps = {
  isOpen: false,
};

LimitsModal.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};
