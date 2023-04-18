import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Button,
  DropdownWithLabel,
  Input,
  Loading,
  ReportCollapsible,
  Modal,
} from "@USupport-components-library/src";

import {
  getTimeFromDate,
  getDateView,
} from "@USupport-components-library/utils";

import { useGetContactForms } from "#hooks";

import "./contact-forms.scss";
import { useEffect } from "react";

/**
 * ContactForms
 *
 * Contact forms report block
 *
 * @return {jsx}
 */
export const ContactForms = ({ Heading }) => {
  const { t } = useTranslation("contact-forms");
  const { isLoading, data } = useGetContactForms();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [emailOptions, setEmailOptions] = useState([]);

  useEffect(() => {
    if (data) {
      let emails = [
        {
          value: "all",
          label: t("all"),
        },
      ];
      const emailsSet = new Set(data.map((x) => x.sender));
      emails.push(
        ...Array.from(emailsSet).map((email) => ({
          value: email,
          label: email,
        }))
      );
      setEmailOptions(emails);
    }
  }, [data]);

  const subjectOptions = [
    { value: "all", label: t("all") },
    { value: "information", label: t("contact_reason_1") },
    { value: "technical-problem", label: t("contact_reason_2") },
    { value: "join-as-provider", label: t("contact_reason_3") },
    { value: "partnerships", label: t("contact_reason_4") },
    { value: "other", label: t("contact_reason_5") },
    { value: "services-information", label: t("contact_reason_6") },
  ];

  const sentFromOptions = [
    { value: "all", label: t("all") },
    { value: "website", label: t("website") },
    { value: "provider", label: t("provider") },
    { value: "client", label: t("client") },
  ];

  const handleFilterSave = (filterData) => {
    setFilters(filterData);
  };

  const filterForms = (form) => {
    const isSubjectMatching =
      filters.subject && filters.subject !== "all"
        ? form.subject === filters.subject
        : true;

    const isSenderMatching =
      filters.sender && filters.sender !== "all"
        ? form.sender === filters.sender
        : true;

    const isStartingDateMatching = filters.startingDate
      ? new Date(form.createdAt).toLocaleDateString() >=
        new Date(filters.startingDate).toLocaleDateString()
      : true;

    const isSentFromMatching =
      filters.sentFrom && filters.sentFrom !== "all"
        ? form.sentFrom === filters.sentFrom
        : true;

    return isSubjectMatching &&
      isSenderMatching &&
      isStartingDateMatching &&
      isSentFromMatching
      ? form
      : false;
  };

  const renderForms = useMemo(() => {
    if (!data) return null;

    const filteredForms = data.filter(filterForms);
    if (filteredForms.length === 0) return <p>{t("no_results")}</p>;

    return filteredForms
      .sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .map((item, index) => {
        const subjectTranslation =
          subjectOptions.find((x) => x.value === item.subject)?.label ||
          item.subject;
        return (
          <ReportCollapsible
            key={index}
            headingItems={[
              <p>
                {t("sent_from")}: <strong>{t(item.sentFrom)}</strong>
              </p>,

              <p>
                {t("email")}: <strong>{item.sender}</strong>
              </p>,

              <p>
                {t("subject")}: <strong>{subjectTranslation}</strong>
              </p>,

              <p>
                {t("time")}:
                <strong>
                  {" "}
                  {getTimeFromDate(item.createdAt)},{" "}
                  {getDateView(item.createdAt)}
                </strong>
              </p>,
            ]}
            contentHeading={t("content_heading")}
            contentText={item.message}
          />
        );
      });
  }, [data, filters]);

  return (
    <Block classes="contact-forms">
      <Heading
        headingLabel={t("heading")}
        handleButtonClick={() => setIsFilterOpen(true)}
      />
      {isLoading ? <Loading /> : renderForms}
      <Filters
        isOpen={isFilterOpen}
        handleClose={() => setIsFilterOpen(false)}
        handleSave={handleFilterSave}
        subjectOptions={subjectOptions}
        emailOptions={emailOptions}
        sentFromOptions={sentFromOptions}
        t={t}
      />
    </Block>
  );
};

const Filters = ({
  isOpen,
  handleClose,
  handleSave,
  t,
  subjectOptions,
  emailOptions,
  sentFromOptions,
}) => {
  const initialFilters = {
    rating: "all",
    startingDate: "",
    sentFrom: "all",
  };
  const [data, setData] = useState(initialFilters);

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    handleSave(data);
    handleClose();
  };

  const handleResetFilter = () => {
    setData(initialFilters);
    handleSave(initialFilters);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={handleClose}
      heading={t("filters")}
      classes="client-ratings__backdrop"
    >
      <>
        <div>
          <DropdownWithLabel
            label={t("subject")}
            selected={data.subject}
            setSelected={(value) => handleChange("subject", value)}
            options={subjectOptions}
          />
          <DropdownWithLabel
            label={t("sender")}
            selected={data.sender}
            setSelected={(value) => handleChange("sender", value)}
            options={emailOptions}
          />
          <DropdownWithLabel
            label={t("sent_from")}
            selected={data.sentFrom}
            setSelected={(value) => handleChange("sentFrom", value)}
            options={sentFromOptions}
            classes="contact-forms__filters-dropdown"
          />
          <Input
            type="date"
            label={t("starting_date")}
            onChange={(e) =>
              handleChange("startingDate", e.currentTarget.value)
            }
            value={data.startingDate}
            placeholder="DD.MM.YYY"
            classes="contact-forms__filters__date-picker"
          />
        </div>
        <Button
          label={t("submit")}
          size="lg"
          onClick={handleSubmit}
          classes="contact-forms__filters__apply-button"
        />
        <Button
          label={t("reset_filter")}
          type="secondary"
          size="lg"
          onClick={handleResetFilter}
          classes="contact-forms__filters__reset-button"
        />
      </>
    </Modal>
  );
};
