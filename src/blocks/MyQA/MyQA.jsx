import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Tabs,
  InputSearch,
  Loading,
  Answer,
  Dropdown,
  ButtonWithIcon,
} from "@USupport-components-library/src";
import { QuestionDetails, FilterQuestions } from "#backdrops";
import { useGetQuestions, useGetLanguages } from "#hooks";

import "./my-qa.scss";

/**
 * MyQA
 *
 * MyQA block
 *
 * @return {jsx}
 */
export const MyQA = ({
  isFilterOpen,
  setIsFilterOpen,
  isFilterButtonShown,
  setIsFilterButtonShown,
}) => {
  const { t } = useTranslation("my-qa");

  const [tabs, setTabs] = useState([
    { value: "unanswered", isSelected: true },
    { value: "answered", isSelected: false },
  ]);
  const [searchValue, setSearchValue] = useState("");
  const [isQuestionDetailsOpen, setIsQuestionDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    tag: null,
    provider: null,
  });
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const { data: languages } = useGetLanguages();

  const languageOptions = useMemo(() => {
    const showAllOption = {
      value: "all",
      label: t("all"),
    };

    if (!languages) return [showAllOption];

    return [
      showAllOption,
      ...languages.map((x) => ({
        value: x.language_id,
        label: x.local_name,
      })),
    ];
  }, [languages, t]);

  const questionsQuery = useGetQuestions(
    tabs.find((tab) => tab.isSelected).value,
    selectedLanguage
  );

  const handleSelectTab = (index) => {
    const tabsCopy = [...tabs];

    for (let i = 0; i < tabsCopy.length; i++) {
      if (i === index) {
        tabsCopy[i].isSelected = true;
      } else {
        tabsCopy[i].isSelected = false;
      }
    }
    setTabs(tabsCopy);

    setIsFilterButtonShown(
      tabs.find((tab) => tab.isSelected).value === "answered"
    );
  };

  const handleReadMore = (question) => {
    setSelectedQuestion(question);
    setIsQuestionDetailsOpen(true);
  };

  const renderQuestions = useCallback(() => {
    if (questionsQuery.isLoading) {
      return <Loading />;
    }

    if (questionsQuery.data.length === 0) {
      return (
        <p className="text my-qa__questions-container__no-data ">
          {t("no_data_found")}
        </p>
      );
    }

    const filteredQuestions = questionsQuery.data.filter((question) => {
      const isTagMatching =
        !filters.tag || filters.tag === "All"
          ? true
          : question.tags?.includes(filters.tag);

      const isProviderMatching =
        !filters.provider || filters.provider === "all"
          ? true
          : question.providerDetailId === filters.provider;

      const isStartingDateMatching = filters.startingDate
        ? new Date(question.createdAt).getTime() >=
          new Date(new Date(filters?.startingDate).setHours(0, 0, 0)).getTime()
        : true;

      const isEndDateMatching = filters.endingDate
        ? new Date(question.createdAt).getTime() <=
          new Date(new Date(filters?.endingDate).setHours(23, 59, 59)).getTime()
        : true;

      const value = searchValue.toLowerCase();
      const isSearchMatching = !value
        ? true
        : question.answerTitle?.toLowerCase().includes(value) ||
          question.answerText?.toLowerCase().includes(value) ||
          question.question?.toLowerCase().includes(value) ||
          question.tags?.find((x) => x?.toLowerCase().includes(value)) ||
          question.providerData?.name?.toLowerCase().includes(value) ||
          question.providerData?.surname?.toLowerCase().includes(value) ||
          question.providerData?.patronym?.toLowerCase().includes(value) ||
          question.providerData?.email?.toLowerCase().includes(value);

      return (
        isTagMatching &&
        isProviderMatching &&
        isSearchMatching &&
        isStartingDateMatching &&
        isEndDateMatching
      );
    });

    if (!filteredQuestions.length) {
      return <p>{t("no_data_found")}</p>;
    }

    return filteredQuestions.map((question, index) => {
      return (
        <Answer
          question={question}
          classes="my-qa__answer"
          t={t}
          renderIn="country-admin"
          key={index}
          handleReadMore={handleReadMore}
        />
      );
    });
  }, [questionsQuery.data, searchValue, filters, t]);

  const providerOptions = Array.from(
    new Set(questionsQuery.data?.map((x) => x.providerData?.provider_detail_id))
  ).map((x) => {
    const providerData = questionsQuery.data?.find((q) => {
      return q.providerData?.provider_detail_id === x;
    })?.providerData;

    return {
      label: `${providerData?.name} ${providerData?.surname}`,
      value: x,
    };
  });
  providerOptions.unshift({
    label: t("all"),
    value: "all",
  });

  const tagsOptions = Array.from(
    new Set(questionsQuery.data?.map((x) => x.tags?.map((y) => y)))
  ).map((x) => {
    return x;
  });
  tagsOptions.unshift(t("all"));

  const handleApplyFilters = (filterData) => {
    setFilters(filterData);
    closeFilterModal();
  };

  const handleResetFilters = () => {
    setFilters({
      reason: null,
      provider: null,
    });
    closeFilterModal();
  };

  const closeFilterModal = () => setIsFilterOpen(false);

  return (
    <>
      <Block classes="my-qa">
        <div className="my-qa__tabs-wrapper">
          <div className="my-qa__tabs-container">
            <Tabs
              options={tabs.map((tab) => {
                return {
                  label: t(tab.value),
                  value: tab.value,
                  isSelected: tab.isSelected,
                };
              })}
              handleSelect={handleSelectTab}
            />
            <ButtonWithIcon
              type="primary"
              label={t("filter")}
              iconName="filter"
              iconColor="#ffffff"
              iconSize="sm"
              color="purple"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              classes="my-qa__tabs-container__filter-button"
            />
          </div>
          {isFilterButtonShown && (
            <div className="my-qa__tabs-container__search">
              <InputSearch
                placeholder={t("search_placeholder")}
                value={searchValue}
                onChange={(value) => setSearchValue(value)}
                classes="my-qa__search-input"
              />
              <Dropdown
                options={languageOptions}
                selected={selectedLanguage}
                setSelected={(lang) => {
                  console.log(lang);
                  setSelectedLanguage(lang);
                }}
              />
            </div>
          )}
        </div>
        <div className="my-qa__questions-container">{renderQuestions()}</div>
      </Block>
      {isQuestionDetailsOpen && (
        <QuestionDetails
          question={selectedQuestion}
          isOpen={isQuestionDetailsOpen}
          onClose={() => setIsQuestionDetailsOpen(false)}
        />
      )}
      {isFilterOpen && (
        <FilterQuestions
          isOpen={isFilterOpen}
          handleClose={closeFilterModal}
          filters={filters}
          setFilters={setFilters}
          providerOptions={providerOptions}
          tagsOptions={tagsOptions}
          handleApplyFilters={handleApplyFilters}
          handleResetFilters={handleResetFilters}
        />
      )}
    </>
  );
};
