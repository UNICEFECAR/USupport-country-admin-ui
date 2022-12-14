import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Block,
  Grid,
  GridItem,
  FAQRow,
  Loading,
  TabsUnderlined,
  Error as ErrorComponent,
} from "@USupport-components-library/src";
import { useTranslation } from "react-i18next";

import { cmsSvc, adminSvc } from "@USupport-components-library/services";
import { filterAdminData } from "@USupport-components-library/utils";
import { useError } from "#hooks";

import "./faq.scss";

/**
 * FAQ
 *
 * FAQ block
 *
 * @return {jsx}
 */
export const FAQ = () => {
  const queryClient = useQueryClient();
  const { i18n, t } = useTranslation("faq");

  const [error, setError] = useState();

  //--------------------- Tabs ----------------------//
  const [options, setOptions] = useState([
    { label: "Website", value: "website", isSelected: true },
    {
      label: "Client",
      value: "client",
      isSelected: false,
    },
    { label: "Provider", value: "provider", isSelected: false },
  ]);

  const handleTabPress = (index) => {
    const optionsCopy = [...options];

    optionsCopy.forEach((option) => {
      option.isSelected = false;
    });

    optionsCopy[index].isSelected = !optionsCopy[index].isSelected;

    setOptions(optionsCopy);
  };

  //--------------------- FAQs ----------------------//

  const getFAQs = async () => {
    const chosenInterface = options.find((x) => x.isSelected).value;

    // Request faq ids from the master DB based on selected interface
    const faqIds = await adminSvc.getFAQs(chosenInterface);

    let { data } = await cmsSvc.getFAQs({
      locale: i18n.language,
      ids: faqIds,
      isForAdmin: true,
    });

    const filteredData = filterAdminData(data.data, data.meta.localizedIds);

    return filteredData;
  };

  const {
    data: FAQsData,
    isLoading: FAQsLoading,
    isFetched: isFAQsFetched,
  } = useQuery(["FAQs", options, i18n.language], getFAQs);

  const handleSelectFAQ = async (id, newValue, index) => {
    let newData = JSON.parse(JSON.stringify(FAQsData));
    const platform = options.find((x) => x.isSelected).value;
    newData[index].isSelected = newValue;

    updateFAQsMutation.mutate({
      id: id.toString(),
      newValue,
      platform,
      faqData: newData,
    });
  };

  const updateFAQs = async (data) => {
    const faqAvailableLocales = await cmsSvc.getFAQAvailableLocales(data.id);

    let res;
    if (data.newValue === true) {
      res = await adminSvc.putFAQ(
        data.platform,
        faqAvailableLocales.en.toString()
      );
    } else {
      res = await adminSvc.deleteFAQ(
        data.platform,
        faqAvailableLocales.en.toString()
      );
    }
    return res.data;
  };

  const updateFAQsMutation = useMutation(updateFAQs, {
    onMutate: (data) => {
      const oldData = queryClient.getQueryData([
        "FAQs",
        options,
        i18n.language,
      ]);

      // Perform an optimistic update to the UI
      queryClient.setQueryData(["FAQs", options, i18n.language], data.faqData);

      return () => {
        queryClient.setQueryData(["FAQs", options, i18n.language], oldData);
      };
    },
    onSuccess: (data) => {},
    onError: (error, variables, rollback) => {
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
      rollback();
    },
  });
  return (
    <Block classes="faq">
      <Grid>
        <GridItem md={8} lg={12} classes="faq__tabs">
          <Grid>
            <GridItem md={6} lg={10}>
              <TabsUnderlined options={options} handleSelect={handleTabPress} />
            </GridItem>
          </Grid>
        </GridItem>

        <GridItem md={8} lg={12} classes="faq__rows">
          {isFAQsFetched &&
            FAQsData &&
            FAQsData?.map((faq, index) => {
              return (
                <FAQRow
                  selected={faq.isSelected}
                  setSelected={() =>
                    handleSelectFAQ(faq.id, !faq.isSelected, index)
                  }
                  question={faq.attributes.question}
                  answer={faq.attributes.answer}
                  key={index}
                />
              );
            })}
          {!FAQsData?.length && FAQsLoading && <Loading />}
          {!FAQsData?.length && !FAQsLoading && isFAQsFetched && (
            <h3 className="page__faq__no-results">{t("no_results")}</h3>
          )}
          {error ? <ErrorComponent message={error} /> : null}
        </GridItem>
      </Grid>
    </Block>
  );
};
