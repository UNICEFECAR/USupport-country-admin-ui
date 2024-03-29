import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import {
  Block,
  Loading,
  ReportCollapsible,
  InputSearch,
} from "@USupport-components-library/src";
import {
  getTimeFromDate,
  getDateView,
} from "@USupport-components-library/utils";

import { FilterQuestions } from "#backdrops";
import {
  useGetArchivedQuestions,
  useActivateQuestion,
  useDeleteQuestion,
} from "#hooks";

import "./my-qa-reports.scss";

/**
 * MyQAReports
 *
 * MyQAReports archive block used in reports page
 *
 * @return {jsx}
 */
export const MyQAReports = ({ Heading }) => {
  const { t } = useTranslation("my-qa-reports");

  const queryClient = useQueryClient();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    reason: null,
    provider: null,
  });
  const [searchValue, setSearchValue] = useState("");

  const [questionsToDisplay, setQuestionsToDisplay] = useState();

  const questionsQuery = useGetArchivedQuestions();

  useEffect(() => {
    if (questionsQuery.data) {
      setQuestionsToDisplay(questionsQuery.data);
    }
  }, [questionsQuery.data]);

  const onSuccess = (action) => {
    queryClient.invalidateQueries({ queryKey: ["archived-questions"] });
    toast(t(`${action}_success`));
  };
  const onError = (errorMessage) => {
    toast(errorMessage);
  };
  const activateQuestionMutation = useActivateQuestion(onSuccess, onError);
  const deleteQuestionMutation = useDeleteQuestion(onSuccess, onError);

  const handleActivate = (questionId) => {
    activateQuestionMutation.mutate({ questionId });
  };

  const handleDelete = (questionId) => {
    deleteQuestionMutation.mutate({ questionId });
  };

  const contentMenuOptions = [
    { label: t("activate_button_label"), onClick: handleActivate },
    {
      label: t("delete_button_label"),
      onClick: handleDelete,
      color: "red",
    },
  ];

  const getHeadingItem = (question) => {
    const providerData = question.providerData;
    const date = new Date(question.createdAt);
    const timeText = `${getTimeFromDate(date)}, ${getDateView(date)}`;

    return [
      <p>
        {t("provider")}:{" "}
        <strong>
          {providerData.name} {providerData.surname}
        </strong>
      </p>,
      <p>
        {t("email")}: <strong>{providerData.email}</strong>
      </p>,
      <p>
        {t("archiving_reason_label")}: <strong>{t(question.reason)}</strong>
      </p>,
      <p>
        {t("archiving_date_label")}: <strong>{timeText}</strong>
      </p>,
    ];
  };

  const renderQuestions = useCallback(() => {
    if (questionsQuery.isLoading || !questionsToDisplay) return <Loading />;

    const searchVal = searchValue.toLowerCase();
    const { reason, provider, startingDate, endingDate } = filters;
    const filterData = (question) => {
      const isSearchMatching = !searchVal
        ? true
        : question.question.toLowerCase().includes(searchVal) ||
          question.additionalText.toLowerCase().includes(searchVal) ||
          question.providerData?.name.toLowerCase().includes(searchVal) ||
          question.providerData?.surname.toLowerCase().includes(searchVal) ||
          question.providerData?.email.toLowerCase().includes(searchVal) ||
          question.reason.toLowerCase().includes(searchVal);

      const isProviderMatching =
        !provider || provider === "all"
          ? true
          : question.providerData?.provider_detail_id === provider;
      const isReasonMatching =
        !reason || reason === "all" ? true : question.reason === reason;

      const isStartingDateMatching = startingDate
        ? new Date(question.createdAt).getTime() >=
          new Date(new Date(startingDate).setHours(0, 0, 0)).getTime()
        : true;

      const isEndDateMatching = endingDate
        ? new Date(question.createdAt).getTime() <=
          new Date(new Date(endingDate).setHours(23, 59, 59)).getTime()
        : true;

      return (
        isSearchMatching &&
        isProviderMatching &&
        isReasonMatching &&
        isStartingDateMatching &&
        isEndDateMatching
      );
    };
    const filteredQuestions = questionsToDisplay?.filter(filterData);

    if (filteredQuestions?.length === 0) return <p>{t("no_data_found")}</p>;
    else {
      return filteredQuestions?.filter(filterData).map((question, index) => {
        return (
          <ReportCollapsible
            key={index}
            headingItems={getHeadingItem(question)}
            contentHeading={t("content_heading")}
            contentText={question.question}
            contentMenuOptions={contentMenuOptions}
            componentId={question.questionId}
          >
            {question.reason === "other" && (
              <>
                <p className="paragraph my-qa-reports__other-reason-text">
                  <strong>{t("other_reason_text")}</strong>
                </p>
                <p className="text">{question.additionalText}</p>
              </>
            )}
          </ReportCollapsible>
        );
      });
    }
  }, [questionsToDisplay, filters, searchValue]);

  // Create an array of unique provider options
  const providerOptions = Array.from(
    new Set(questionsQuery.data?.map((x) => x.providerData?.provider_detail_id))
  ).map((x) => {
    const providerData = questionsQuery.data?.find((q) => {
      return q.providerData?.provider_detail_id === x;
    })?.providerData;

    return {
      label: `${providerData.name} ${providerData.surname}`,
      value: x,
    };
  });
  providerOptions.unshift({
    label: t("all"),
    value: "all",
  });

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

  const dropdownOptions = [
    { value: "all" },
    { value: "duplicate" },
    { value: "spam" },
    { value: "other" },
  ];

  return (
    <Block classes="my-qa-reports">
      <Heading
        headingLabel={t("heading")}
        handleButtonClick={() => setIsFilterOpen(true)}
      />
      <InputSearch
        placeholder={t("search")}
        value={searchValue}
        onChange={setSearchValue}
      />
      {renderQuestions()}
      {isFilterOpen && (
        <FilterQuestions
          isOpen={isFilterOpen}
          handleClose={closeFilterModal}
          filters={filters}
          providerOptions={providerOptions}
          handleApplyFilters={handleApplyFilters}
          handleResetFilters={handleResetFilters}
          reasonOptions={dropdownOptions}
        />
      )}
    </Block>
  );
};
