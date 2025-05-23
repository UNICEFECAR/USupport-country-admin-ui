import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  Block,
  Grid,
  GridItem,
  Loading,
  TabsUnderlined,
  Error as ErrorComponent,
  InputSearch,
  BaseTable,
  CheckBox,
} from "@USupport-components-library/src";
import { useTranslation } from "react-i18next";

import { cmsSvc, adminSvc } from "@USupport-components-library/services";
import {
  filterAdminData,
  getDateView,
} from "@USupport-components-library/utils";
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
  const [searchValue, setSearchValue] = useState("");
  const [faqData, setFaqData] = useState([]);
  const [faqIds, setFaqIds] = useState([]);

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

  //--------------------- FAQs ----------------------//

  const getFAQs = async () => {
    const chosenInterface = options.find((x) => x.isSelected).value;

    // Request faq ids from the master DB based on selected interface
    const faqIds = await adminSvc.getFAQs(chosenInterface);
    setFaqIds(faqIds);
    let { data } = await cmsSvc.getFAQs({
      locale: i18n.language,
      ids: faqIds,
      isForAdmin: true,
      populate: true,
    });

    const filteredData = filterAdminData(data?.data, data.meta.localizedIds);

    return filteredData.map((faq) => {
      return {
        id: faq.id,
        isSelected: !!faq.isSelected,
        ...faq.attributes,
      };
    });
  };

  const { data: FAQsData, isLoading: FAQsLoading } = useQuery(
    ["FAQs", options, i18n.language],
    getFAQs
  );

  const rows = useMemo(() => {
    return [
      { label: t("published"), sortingKey: "isSelected", isCentered: true },
      { label: t("content"), sortingKey: "question" },
      { label: t("published_at"), sortingKey: "publishedAt", isCentered: true },
    ];
  }, [i18n.language]);

  useEffect(() => {
    setFaqData(FAQsData);
  }, [FAQsData]);

  const handleTabPress = (index) => {
    const optionsCopy = [...options];

    optionsCopy.forEach((option) => {
      option.isSelected = false;
    });

    optionsCopy[index].isSelected = !optionsCopy[index].isSelected;

    setOptions(optionsCopy);
  };

  const handleSelectFAQ = async (id, newValue, index) => {
    let newData = JSON.parse(JSON.stringify(FAQsData));
    const platform = options.find((x) => x.isSelected).value;
    newData.find((x) => x.id === id).isSelected = newValue;

    let idToUse = id;
    if (newValue === false) {
      // If the podcast is being removed, we need to get the id of the localized version
      if (!faqIds.includes(id)) {
        const currentData = FAQsData[index];
        const dataLocalizations = currentData.localizations.data;

        const faqIdToUse = dataLocalizations.find((x) =>
          faqIds.includes(x.id.toString())
        );
        console.log(faqIdToUse, "faqIdToUse");
        if (faqIdToUse) {
          idToUse = faqIdToUse.id;
        }
      }
    }

    updateFAQsMutation.mutate({
      id: idToUse.toString(),
      newValue,
      platform,
      faqData: newData,
    });
  };

  const updateFAQs = async (data) => {
    const faqAvailableLocales = await cmsSvc.getFAQAvailableLocales(data.id);
    const currentLang = i18n.language;
    if (data.newValue === true) {
      await adminSvc.putFAQ(
        data.platform,
        faqAvailableLocales[currentLang].toString()
      );
    } else {
      await adminSvc.deleteFAQ(
        data.platform,
        faqAvailableLocales[currentLang].toString()
      );
    }
    return data.newValue;
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
    onSuccess: (isAdding) => {
      toast(t(isAdding ? "faq_added" : "faq_removed"));
    },
    onError: (error, variables, rollback) => {
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
      rollback();
    },
  });

  const getFilteredQuestions = () => {
    const filteredQuestions = faqData?.filter((faq) => {
      if (searchValue) {
        const value = searchValue.toLowerCase();

        const isQuestionMatching = faq.question.toLowerCase().includes(value);
        const isAnswerMatching = faq.answer.toLowerCase().includes(value);

        return isQuestionMatching || isAnswerMatching;
      }

      return true;
    });

    return filteredQuestions;
  };

  const getTableRows = () => {
    const data = getFilteredQuestions();

    return data?.map((faq, index) => {
      return [
        <div>
          <CheckBox
            isChecked={faq.isSelected}
            setIsChecked={() => handleSelectFAQ(faq.id, !faq.isSelected, index)}
          />
        </div>,
        <div className="faq__row-text-container">
          <h4>{faq.question}</h4>
          <p className="text">{faq.answer}</p>
        </div>,
        <p className="text centered">
          {getDateView(new Date(faq.publishedAt))}
        </p>,
      ];
    });
  };

  return (
    <Block classes="faq">
      <Grid>
        <GridItem md={8} lg={12} classes="faq__tabs">
          <TabsUnderlined
            options={options}
            handleSelect={handleTabPress}
            t={t}
          />
        </GridItem>
        <GridItem md={4} lg={6}>
          <InputSearch
            placeholder={t("search_placeholder")}
            value={searchValue}
            onChange={(value) => setSearchValue(value)}
            classes="faq__search"
          />
        </GridItem>
        <GridItem md={8} lg={12}>
          {!FAQsData?.length && FAQsLoading ? (
            <Loading />
          ) : (
            <BaseTable
              rows={rows}
              t={t}
              data={getFilteredQuestions()}
              rowsData={getTableRows()}
              hasMenu={false}
              updateData={setFaqData}
              noteText={t("note")}
            />
          )}
          {error ? <ErrorComponent message={error} /> : null}
        </GridItem>
      </Grid>
    </Block>
  );
};
