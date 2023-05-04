import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Tabs,
  InputSearch,
  Loading,
  Answer,
  DropdownWithLabel,
} from "@USupport-components-library/src";
import { QuestionDetails, FilterQuestions } from "#backdrops";
import { useGetQuestions } from "#hooks";

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

  const questionsQuery = useGetQuestions(
    tabs.find((tab) => tab.isSelected).value
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

  const renderQuestions = () => {
    if (questionsQuery.isLoading) {
      return <Loading />;
    }

    if (questionsQuery.data.length === 0) {
      return <p className="text">{t("no_data_found")}</p>;
    }

    const filteredQuestions = questionsQuery.data.filter((question) => {
      if (filters.tag && filters.tag !== "All") {
        const tags = question.tags;
        if (!tags.includes(filters.tag)) {
          return null;
        }
      }

      if (filters.provider && filters.provider !== "all") {
        if (question.providerDetailId !== filters.provider) return null;
      }

      const value = searchValue.toLowerCase();

      if (value) {
        if (
          !question.answerTitle?.toLowerCase().includes(value) &&
          !question.answerText?.toLowerCase().includes(value) &&
          !question.question?.toLowerCase().includes(value) &&
          !question.tags?.find((x) => x?.toLowerCase().includes(value))
        )
          return null;
      }
      return true;
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
  };

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
          </div>
          {isFilterButtonShown && (
            <InputSearch
              placeholder={t("search_placeholder")}
              value={searchValue}
              onChange={(value) => setSearchValue(value.toLowerCase())}
              classes="my-qa__search-input"
            />
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
        />
      )}
    </>
  );
};