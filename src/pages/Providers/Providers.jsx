import React from "react";
import { Page, Providers as ProvidersBlock } from "#blocks";

import "./providers.scss";

/**
 * Providers
 *
 * Display all the providers
 *
 * @returns {JSX.Element}
 */
export const Providers = () => {
  return (
    <Page showGoBackArrow={false} classes="page__providers">
      <ProvidersBlock />
    </Page>
  );
};
