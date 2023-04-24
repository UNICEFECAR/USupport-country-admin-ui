import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
  Block,
  Modal,
  DropdownWithLabel,
  Loading,
  ReportCollapsible,
  Box,
} from "@USupport-components-library/src";
import {
  getTimeFromDate,
  getDateView,
} from "@USupport-components-library/utils";
import {
  useGetArchivedQuestions,
  useActivateQuestion,
  useDeleteQuestion,
} from "#hooks";

import "./my-qa.scss";

/**
 * MyQA
 *
 * MyQA archive block used in reports page
 *
 * @return {jsx}
 */
export const MyQA = ({ Heading }) => {
  const { t } = useTranslation("my-qa");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState(null);

  const questionsQuery = useGetArchivedQuestions();

  const onSuccess = (action) => {
    questionsQuery.refetch();
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

  const renderQuestions = () => {
    if (questionsQuery.isLoading) return <Loading />;

    let questionsToRender = questionsQuery.data;
    if (filter) {
      questionsToRender = questionsToRender.filter(
        (question) => question.reason === filter
      );
    }

    if (questionsToRender.length === 0) return <p>{t("no_data_found")}</p>;
    else
      return questionsToRender.map((question, index) => {
        console.log(question);
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
                <p className="paragraph my-qa__other-reason-text">
                  <strong>{t("other_reason_text")}</strong>
                </p>
                <p className="text">{question.additionalText}</p>
              </>
            )}
          </ReportCollapsible>
        );
      });
  };

  return (
    <Block classes="my-qa">
      <Heading
        headingLabel={t("heading")}
        handleButtonClick={() => setIsFilterOpen(true)}
      />
      {renderQuestions()}
      {isFilterOpen && (
        <Filters
          isOpen={isFilterOpen}
          handleClose={() => setIsFilterOpen(false)}
          t={t}
          filter={filter}
          setFilter={setFilter}
          errorMessage={errorMessage}
        />
      )}
    </Block>
  );
};

const Filters = ({ isOpen, handleClose, filter, setFilter, t }) => {
  const [selectedOption, setSelectedOption] = useState(filter);

  const options = [
    { value: "duplicate" },
    { value: "spam" },
    { value: "other" },
  ];

  const handleCtaClick = () => {
    setFilter(selectedOption);
    handleClose();
  };

  const handleSecondaryCtaClick = () => {
    setSelectedOption(null);
    setFilter(null);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      heading={t("filters")}
      closeModal={handleClose}
      classes="my-qa__filter-modal"
      ctaLabel={t("save")}
      ctaHandleClick={handleCtaClick}
      secondaryCtaLabel={t("reset")}
      secondaryCtaHandleClick={handleSecondaryCtaClick}
    >
      <div className="my-qa__filter-modal__content-wrapper">
        <DropdownWithLabel
          label={t("dropdown_label")}
          options={options.map((option) => {
            return {
              label: t(`${option.value}`),
              value: option.value,
              isSelected: filter === option.value,
            };
          })}
          selected={selectedOption}
          setSelected={(value) => setSelectedOption(value)}
        />
      </div>
    </Modal>
  );
};
